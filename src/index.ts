import "dotenv/config"; // must stay first — loads .env before any module reads it
import { logger, assertDbEnv } from "@primebrick/sdk";
import "./observability/logging-init.js"; // must stay first import — async console bridge
import cors from "cors";
import express, { type Response } from "express";
import cookieParser from "cookie-parser";
import { extJsonMiddleware, extJsonBodyParser, extJsonParse, Permission, NatsClient, subscribeSharedConfig, logModuleStartup, logServiceStartup, type HealthResponse } from "@primebrick/sdk";
import type { NatsConnection } from "@nats-io/transport-node";
import { mountModules } from "./modules/index.js";
import CasdoorSDK from "casdoor-nodejs-sdk";
import { getConfigEntriesService, type AuthConfigDb } from "./modules/auth/services/config-entries.service.js";
import { openApiRouter } from "./openapi/router.js";
import { aggregatedOpenApiRouter } from "./openapi/aggregated-router.js";
import { errorHandler } from "./http/error-handler.js";
import { initDal, getDal } from "./db/dal-gateway.js";
import { isDatabaseUnavailableError } from "./http/api-errors.js";
import { makeProtectedRouter } from "./http/protected-router.js";
import { rbacHandler } from "./modules/auth/rbac.middleware.js";
import { loadRoleMappings, initAuthPorts, getAuthPorts } from "./modules/auth/auth.middleware.js";
import { loadAuthConfig, getAuthConfig } from "./modules/auth/config.js";
import { initCache, closeCache, getRedisHealth, getCachePort } from "./cache/cache-port-holder.js";
import { initPresenceStore, closePresenceStore } from "./modules/collaboration/presence-store-holder.js";
import { collaborationBusRegistry } from "./modules/collaboration/collaboration-bus-registry.js";
import { startKeyspaceListener } from "./modules/collaboration/keyspace-listener.js";
import { initMcpModule } from "./modules/mcp/index.js";
import { mountMcp } from "./controllers/http/mcp/index.js";
// Side-effect import: activates `Express.Request.user` type augmentation.
import "./modules/auth/express-augmentation.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ServiceRegistryService } from "./modules/system/service-registry.service.js";
import { ServiceLifecycleSubscriber } from "./controllers/nats-sub/service-lifecycle-subscriber.js";
import { startInternalRequestRoutes } from "./controllers/nats-sub/internal-request-routes.js";
import { createPublisherVerifier } from "./controllers/nats-sub/publisher-identity.js";
import { initBackendIdentity } from "./modules/proxy/backend-identity.js";
import { initSecretEngine } from "./modules/secrets/secret-engine.js";
import { StaleDetectionJob } from "./controllers/nats-sub/stale-detection-job.js";
import { ModuleDiscoveryService } from "./modules/system/module-discovery.service.js";
import { serviceEventsBus } from "./modules/proxy/service-events-bus.js";
import { initBackendTelemetry, getTelemetryShared } from "./observability/telemetry.js";
import { shutdownTelemetry, flushLogsSync } from "@primebrick/sdk";

// Closed-set env contract: DATABASE_URL + DATABASE_SCHEMA are the ONLY
// env vars this service may consume — any violation crashes before listen.
assertDbEnv();

// Keyspace listener cleanup function (set during startup, called during shutdown)
let stopKeyspaceListener: (() => Promise<void>) | null = null;

const app = express();
// Closed-set env contract (assertDbEnv above): only DATABASE_URL and
// DATABASE_SCHEMA may be consumed — the API port is a fixed product constant,
// not an env override.
const port = 3001;

app.use(cors({ origin: true }));
// Use ext-json body parser instead of native express.json() to preserve
// BigInt precision in request bodies (e.g. config values for bigint type).
// ext-json is a superset of JSON: standard JSON is parsed correctly, and
// all integers are returned as native `bigint` (not just large ones).
app.use(extJsonBodyParser({ limit: "1mb" }));
app.use(cookieParser());
app.use(extJsonMiddleware());

type HealthCheckResult = { ok: boolean; version?: string; type?: string; model?: string; error?: string };

function readBackendVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url)); // backend/src
  const pkgPath = resolve(here, "..", "package.json");
  const pkg = extJsonParse(readFileSync(pkgPath, "utf-8")) as { version?: string };
  return pkg.version ?? "0.0.0";
}

const BACKEND_VERSION = readBackendVersion();

async function checkDb(): Promise<HealthCheckResult> {
  try {
    const dal = getDal();
    const { version } = await dal.serverVersion();
    // version() returns e.g. "PostgreSQL 18.0, compiled by Visual C++ ..."
    const versionMatch = version.match(/PostgreSQL\s+([\d.]+)/);
    return { ok: true, version: versionMatch?.[1] };
  } catch (e) {
    if (isDatabaseUnavailableError(e)) return { ok: false };
    return { ok: false };
  }
}

async function checkIdp(): Promise<HealthCheckResult> {
  try {
    // Closed-set env contract: no env fallbacks — IDP configuration lives in
    // config_entries only. A missing config is an honest "unhealthy", not a
    // fake default pointing at a wrong IDP.
    let casdoorEndpoint: string | undefined;
    let clientId: string | undefined;
    let clientSecret: string | undefined;
    let orgName = "admin";

    try {
      const dbConfig = await getConfigEntriesService().loadAuthConfigOnly();
      casdoorEndpoint = dbConfig.idp_endpoint || casdoorEndpoint;
      clientId = dbConfig.idp_client_id || clientId;
      clientSecret = dbConfig.idp_client_secret || clientSecret;
      orgName = dbConfig.idp_organization || orgName;
    } catch (error) {
      logger.warn("Could not load IDP configuration from database:", { tags: ["core"], error: error });
    }

    if (!casdoorEndpoint || !clientId || !clientSecret) {
      return { ok: false, error: "idp config missing" };
    }

    // Call the correct version endpoint from Casdoor docs with authentication
    const url = new URL(`${casdoorEndpoint}/api/get-version-info`);
    url.searchParams.set("clientId", clientId);
    url.searchParams.set("clientSecret", clientSecret);

    const versionResponse = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!versionResponse.ok) {
      logger.error("Version endpoint returned non-OK status", { tags: ["core", `${versionResponse.status}`] });
      return { ok: false };
    }

    const versionData = await versionResponse.json() as { status?: string; msg?: string; data?: { version?: string; commitId?: string; commitOffset?: number } };
    return {
      ok: true,
      type: "Casdoor",
      version: versionData.data?.version || "unknown",
    };
  } catch (e) {
    logger.error(`Error:`, { tags: ["core"], error: (e as Error).message });
    return { ok: false };
  }
}

/**
 * Check Redis connectivity with an actual PING command.
 * Detects Redis going down AFTER startup (not just a null singleton check).
 * The version is cached at startup — no INFO query on every health probe.
 */
async function checkRedis(): Promise<HealthCheckResult> {
  const port = getCachePort();
  if (!port) return { ok: false, error: "Redis not configured" };
  try {
    const ok = await port.ping();
    if (!ok) return { ok: false, error: "Redis PING failed" };
    return { ok: true, version: getRedisHealth().version };
  } catch {
    return { ok: false, error: "Redis PING threw" };
  }
}

/**
 * Check NATS connectivity. Uses isConnected() (local check, no network round-trip).
 * The NATS client's built-in heartbeat/reconnection handles detecting actual
 * connectivity loss. Version is cached at startup from the INFO handshake.
 */
function checkNats(): HealthCheckResult {
  if (!NatsClient.isConnected()) return { ok: false, error: "NATS connection is not alive" };
  const version = NatsClient.getServerVersion() ?? undefined;
  return { ok: true, version };
}

/**
 * LLM health check — reads checks.llm from the AI microservice's public
 * /health probe (LLM connectivity + model + version for the version panel).
 * The shielded /api/v1/ai/health domain route is NOT usable here — it
 * requires client identity and 403s on unauthenticated probes.
 *
 * The AI microservice must be registered in service_registry with code='ai'.
 * If the AI microservice is not registered or not running, the LLM check
 * returns ok:false (the BE itself stays healthy — LLM is optional infra).
 */
async function checkLlm(): Promise<HealthCheckResult> {
  try {
    const service = await new ServiceRegistryService().findByCode("ai");
    if (!service || !service.base_url) {
      return { ok: false, error: "AI microservice not registered in service_registry" };
    }

    // Public system probe (api-path-conventions: /health is always public,
    // no client identity — mounted before the shield gate in the SDK).
    // checks.llm carries { ok, model?, version?, error? } from the ai
    // service's customHealthChecks.
    const healthUrl = `${service.base_url}/health`;
    // Bounded at 2.5s: the ai service is local — when healthy it answers in
    // ms; the budget only burns while IT waits on its own upstream LLM probe.
    // LLM must never gate the /health latency of the whole API.
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(2500) });
    if (!res.ok && res.status !== 503) {
      return { ok: false, error: `AI microservice health failed: HTTP ${res.status}` };
    }

    const json = (await res.json()) as {
      ok: boolean;
      checks?: { llm?: { ok: boolean; model?: string; version?: string; error?: string } };
    };

    if (!json.checks?.llm) {
      return { ok: false, error: "AI microservice did not return LLM health info" };
    }
    const llmCheck = json.checks.llm;

    return {
      ok: llmCheck.ok,
      model: llmCheck.model,
      version: llmCheck.version,
      ...(llmCheck.ok ? {} : { error: llmCheck.error ?? "LLM check failed" }),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "LLM check error" };
  }
}

async function healthPayload(): Promise<HealthResponse> {
  // Parallel: /health latency is bounded by the SLOWEST check, not the sum —
  // the informational llm probe must not stack its wait on the critical path.
  const [db, idp, redis, llm] = await Promise.all([
    checkDb(),
    checkIdp(),
    checkRedis(),
    checkLlm(),
  ]);
  const checks: Record<string, HealthCheckResult> = {
    db,
    idp,
    redis,
    nats: checkNats(),
    // LLM is optional infrastructure — included for the version panel but
    // does NOT affect the overall health status (BE stays 200 even if LLM is down).
    llm,
  };
  // Only core infra (db, idp, redis, nats) determines overall health.
  // LLM is reported but does not cause 503.
  const isHealthy = ["db", "idp", "redis", "nats"].every((k) => checks[k].ok);
  return {
    ok: isHealthy,
    service: "primebrick-api",
    version: BACKEND_VERSION,
    url: `http://localhost:${port}`,
    checks,
  };
}

/** 200 when ALL checks pass; 503 when any infrastructure component is down (same JSON body). */
async function sendHealth(res: Response) {
  const payload = await healthPayload();
  res.status(payload.ok ? 200 : 503).json(payload);
}

// Public health endpoint - no authentication required
app.get("/api/v1/health", async (_req, res) => {
  await sendHealth(res);
});

// All /api/v1/* routes require authentication, EXCEPT the health endpoint
// (already registered above) and the OpenAPI docs router (mounted before the
// guard, so the spec stays publicly browsable for clients during integration).
app.use(openApiRouter());
app.use(aggregatedOpenApiRouter());

// Use makeProtectedRouter for /modules endpoint
const apiRouter = makeProtectedRouter();
apiRouter.get("/modules", rbacHandler([Permission.AUTHENTICATED_USER]), async (req, res) => {
  // THE module discovery document — one access-filtered payload feeding the
  // launcher, sidebar, breadcrumb and the client-derived route census.
  // AUTHENTICATED_USER: discovery must work for ordinary users; WHAT they
  // see is governed by the `access.*` grant axis inside the service
  // (is_admin ⇒ access.system only — business roots need explicit grants).
  // Disabled rows never surface: `is_enabled === false` is the admin's
  // "do not expose" decision.
  // ?lang selects the language the `labels` seed is resolved in — the FE
  // passes the active uiLang; anything else falls back to en-GB.
  const lang =
    typeof req.query.lang === "string" && /^[a-z]{2,3}(-[a-zA-Z]{2,8}){1,2}$/i.test(req.query.lang)
      ? req.query.lang
      : "en-GB";
  res.json(await new ModuleDiscoveryService().list(req.user, lang));
});

app.use("/api/v1", apiRouter);
// Mount all feature routers (customers / organizations / system / auth).
mountModules(app);

// Mount the MCP endpoint at /mcp (Streamable HTTP transport, stateless mode).
// Auth is handled by requireBearerAuth inside mountMcp — NOT by the global
// authMiddleware, because MCP uses its own OAuth token verifier that populates
// req.auth (the MCP SDK's expected auth shape) rather than req.user.
// OAuth metadata is built lazily on each request so mountMcp is synchronous.
mountMcp(app, "/mcp");

app.use(errorHandler);

// Bind the port BEFORE any DB-dependent startup work so /health stays
// answerable even when Postgres is down (returns 503 + JSON, not a proxy 502).
// Set server.timeout to 5 minutes (300s) — this is a socket inactivity timeout
// that resets on every res.write(). SSE connections with 15s keep-alive never
// hit it. It only fires on zombie connections (no data for 5 min), allowing the
// server to reclaim resources. Never set to 0 (zombie accumulation).
const server = app.listen(port, () => {
  logServiceStartup(`http://localhost:${port}`);
});
server.timeout = 300_000;

// Background startup tasks — MUST NOT prevent the server from starting.
// /health is public and unaffected; authenticated endpoints fail closed
// (503 from DB-unavailable errors, or 403 from empty role cache) until
// the role mappings are successfully loaded.
void runStartupTasks().catch((err) => {
  logger.error("background task failed", { tags: ["core"], error: err });
});

async function runStartupTasks(): Promise<void> {
  // Step -1 — DAL bootstrap BEFORE anything DB-touching (banner probe,
  // migrations, config loads). initDal() is once-only; getDal() fails fast
  // everywhere else.
  initDal();
  await logPostgresBanner();
  // Step 0 — own-schema migrations BEFORE role mappings / auth config /
  // any other table read. Mode lives in public.config_entries.
  const { runModuleMigrations } = await import("./db/run-module-migrations.js");
  await runModuleMigrations();
  initAuthPorts();
  await refreshRoleMappings();
  await refreshAuthConfig();
  await initCacheFromConfig();
  await initPresenceStoreFromConfig();
  // Initialize the MCP module with the same auth ports used by authMiddleware.
  // This must run after initAuthPorts() so the ports are available.
  const ports = getAuthPorts();
  if (ports) {
    initMcpModule(ports);
  } else {
    logger.warn("MCP module not initialized — auth ports unavailable", { tags: ["core"] });
  }
  await startServiceLifecycle();
}

/**
 * Initialize the Redis cache from `redis_url` in config_entries.
 * Runs after refreshAuthConfig() so the config is loaded.
 * Redis is mandatory — if redis_url is set but Redis is unreachable, retry
 * every 5s (same pattern as refreshRoleMappings and refreshAuthConfig).
 * The /health endpoint will return 503 (redis.ok=false) until the retry succeeds.
 */
async function initCacheFromConfig(): Promise<void> {
  try {
    const cfg = getAuthConfig();
    await initCache(cfg.redis_url, logger);
  } catch (err) {
    logger.warn(
      "initCache failed (Redis unavailable?). Retrying in 5s.",
      { tags: ["core"], error: err }
    );
    setTimeout(() => void initCacheFromConfig().catch(() => {}), 5000);
  }
}

/**
 * Initialize the Redis presence store from `redis_url` in config_entries.
 * Runs after refreshAuthConfig() so the config is loaded.
 * Redis is mandatory — if redis_url is set but Redis is unreachable, retry
 * every 5s (same pattern as refreshRoleMappings and refreshAuthConfig).
 */
async function initPresenceStoreFromConfig(): Promise<void> {
  try {
    const cfg = getAuthConfig();
    await initPresenceStore(cfg.redis_url, logger);
    // Start keyspace listener for presence expiry events (best-effort)
    if (cfg.redis_url) {
      try {
        stopKeyspaceListener = await startKeyspaceListener(cfg.redis_url, logger);
      } catch (err) {
        logger.warn("keyspace listener failed (best-effort):", { tags: ["core"], error: err });
      }
    }
  } catch (err) {
    logger.warn(
      "initPresenceStore failed (Redis unavailable?). Retrying in 5s.",
      { tags: ["core"], error: err }
    );
    setTimeout(() => void initPresenceStoreFromConfig().catch(() => {}), 5000);
  }
}

async function logPostgresBanner(): Promise<void> {
  try {
    const { version } = await getDal().serverVersion();
    const versionMatch = version.match(/PostgreSQL\s+([\d.]+)/);
    const dbUrl = (process.env.DATABASE_URL ?? "localhost:5432").replace(/(:\/\/[^:/]+):[^@]+@/, "$1@");
    logModuleStartup("PostgreSQL", versionMatch?.[1], dbUrl);
  } catch (err) {
    logger.warn(
      "PostgreSQL connection failed. Retrying in 5s.",
      { tags: ["core"], error: err }
    );
    setTimeout(() => void logPostgresBanner().catch(() => {}), 5000);
  }
}

async function refreshRoleMappings(): Promise<void> {
  try {
    await loadRoleMappings();
  } catch (err) {
    logger.warn(
      "loadRoleMappings failed (database unavailable?). Retrying in 5s.",
      { tags: ["core"], error: err }
    );
    setTimeout(() => void refreshRoleMappings().catch(() => {}), 5000);
  }
}

async function refreshAuthConfig(): Promise<void> {
  try {
    const authConfig = await loadAuthConfig();
    logger.done(`Global configuration loaded — ${Object.keys(authConfig ?? {}).length} keys found (public.config_entries)`, { tags: ["core"] });
    logger.done("Auth settings resolved", { tags: ["core"] });
    // Telemetry/logging config lives in config_entries — init once DB is up.
    await initBackendTelemetry("primebrick-api", BACKEND_VERSION);
  } catch (err) {
    logger.warn(
      "loadAuthConfig failed (database unavailable?). Retrying in 5s.",
      { tags: ["core"], error: err }
    );
    setTimeout(() => void refreshAuthConfig().catch(() => {}), 5000);
  }
}

/** One instance for the process — start() is interval-guarded, so
 * re-running the lifecycle after a NATS outage must not leak timers. */
const staleJob = new StaleDetectionJob();
/** Suppresses the nc.closed() re-arm during graceful shutdown. */
let serviceLifecycleStopping = false;
/** Dedup: nc.closed() is hooked once per live connection, not once per init pass. */
let natsCloseHooked: NatsConnection | null = null;

async function startServiceLifecycle(): Promise<void> {
  try {
    // nats_url lives in config_entries (seeded by patch
    // 20261022225000_seed_nats_url) — the env contract allows only
    // DATABASE_URL + DATABASE_SCHEMA. Runs after initDal(); the row is
    // mandatory — missing config means a misconfigured system, not a default.
    const natsEntry = await getConfigEntriesService().findByKey("nats_url");
    if (!natsEntry?.value) {
      throw new Error('config_entries row "nats_url" missing — run pnpm db:migrate');
    }
    const nc = await NatsClient.getConnection(String(natsEntry.value));
    // Permanent close (broker restart past the client's reconnect window)
    // cannot be revived by nats.js — re-run this whole init to reconnect,
    // re-enroll identity and re-subscribe every route. closed() resolves
    // only on permanent close, never during reconnect attempts.
    if (natsCloseHooked !== nc) {
      natsCloseHooked = nc;
      void nc.closed().then(() => {
        if (serviceLifecycleStopping) return;
        logger.warn("NATS connection closed permanently — re-running service lifecycle in 5s", {
          tags: ["nats"],
        });
        setTimeout(() => void startServiceLifecycle().catch(() => {}), 5000);
      });
    }
    // config.get — governed correlation-reply serving the shared config
    // (redis_url, telemetry) to microservices at boot and on config.changed.
    const sharedConfigVerifier = createPublisherVerifier();
    await subscribeSharedConfig(NatsClient, () => {
      const cfg = getAuthConfig();
      return { redis_url: cfg.redis_url, telemetry: getTelemetryShared() };
    }, sharedConfigVerifier.asRouteVerify());
    // Identity FIRST: the lifecycle subscriber publishes service.gateway_online
    // and internal routes serve shield-verified calls — every NATS publish
    // must already carry the BE's client-shield identity.
    await enrollBackendIdentity();
    const subscriber = new ServiceLifecycleSubscriber();
    await subscriber.start();
    await startInternalRequestRoutes();
    await initSecretEngine();
    staleJob.start();
  } catch (err) {
    logger.warn(
      "NATS connection failed (service lifecycle subscriber not started). Retrying in 5s.",
      { tags: ["core"], error: err }
    );
    setTimeout(() => void startServiceLifecycle().catch(() => {}), 5000);
  }
}

/**
 * Self-enroll the BE into system.client_shield_registry (B11): the BE never sends
 * `service.register`, so it upserts its own `source='registry'` row keyed
 * by `{pkg_name}/{version}` — the UA prefix it sends on proxied calls.
 * The client key comes from the `service_client_shield_key` config entry (module config,
 * not env). Delegates to `initBackendIdentity()` which also primes the
 * cached identity headers used by the proxy hot path.
 */
async function enrollBackendIdentity(): Promise<void> {
  await initBackendIdentity();
}

// --- Graceful shutdown --------------------------------------------------------
// Close the Redis cache connection on SIGTERM/SIGINT so the Redis client
// quits cleanly (avoids "QUIT" errors in Redis logs on abrupt process exit).

async function gracefulShutdown(): Promise<void> {
  serviceLifecycleStopping = true;
  // Notify all SSE clients that the server is shutting down
  try {
    serviceEventsBus.emit({
      id: `shutdown:${Date.now()}`,
      event: "error",
      data: { type: "server_shutdown", message: "Server is shutting down" },
    });
    serviceEventsBus.close();
  } catch {
    // Non-critical — SSE clients will reconnect to another instance
  }
  try {
    await closeCache();
  } catch (err) {
    logger.warn("closeCache failed:", { tags: ["core"], error: err });
  }
  try {
    await closePresenceStore();
  } catch (err) {
    logger.warn("closePresenceStore failed:", { tags: ["core"], error: err });
  }
  try {
    collaborationBusRegistry.closeAll();
  } catch (err) {
    logger.warn("collaborationBusRegistry.closeAll failed:", { tags: ["core"], error: err });
  }
  if (stopKeyspaceListener) {
    try {
      await stopKeyspaceListener();
    } catch (err) {
      logger.warn("keyspace listener stop failed:", { tags: ["core"], error: err });
    }
    stopKeyspaceListener = null;
  }
  try {
    await shutdownTelemetry();
  } catch (err) {
    logger.warn("shutdownTelemetry failed:", { tags: ["core"], error: err });
  }
  flushLogsSync();
}

process.on("SIGTERM", () => void gracefulShutdown().finally(() => process.exit(0)));
process.on("SIGINT", () => void gracefulShutdown().finally(() => process.exit(0)));
