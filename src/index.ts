import cors from "cors";
import express, { type Response } from "express";
import cookieParser from "cookie-parser";
import { extJsonMiddleware, Permission, NatsClient, subscribeSharedConfig, logModuleStartup, logServiceStartup, type HealthResponse } from "@primebrick/sdk";
import { mountModules } from "./modules/index.js";
import { Pool } from "pg";
import CasdoorSDK from "casdoor-nodejs-sdk";
import { loadAuthConfigFromDb, type AuthConfigDb } from "./modules/auth/config-repo.js";
import { openApiRouter } from "./openapi/router.js";
import { aggregatedOpenApiRouter } from "./openapi/aggregated-router.js";
import { errorHandler } from "./http/error-handler.js";
import { getPool } from "./db/pool.js";
import { isDatabaseUnavailableError } from "./http/api-errors.js";
import { makeProtectedRouter } from "./http/protected-router.js";
import { rbacHandler } from "./modules/auth/rbac.middleware.js";
import { loadRoleMappings, initAuthPorts, getAuthPorts } from "./modules/auth/auth.middleware.js";
import { loadAuthConfig, getAuthConfig } from "./modules/auth/config.js";
import { initCache, closeCache, getRedisHealth, getCachePort } from "./cache/cache-port-holder.js";
import { initPresenceStore, closePresenceStore } from "./modules/collaboration/presence-store-holder.js";
import { collaborationBusRegistry } from "./modules/collaboration/collaboration-bus-registry.js";
import { startKeyspaceListener } from "./modules/collaboration/keyspace-listener.js";
import { mountMcp, initMcpModule } from "./modules/mcp/index.js";
// Side-effect import: activates `Express.Request.user` type augmentation.
import "./modules/auth/express-augmentation.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ServiceRegistryRepo } from "./modules/proxy/service-registry-repo.js";
import { ServiceLifecycleSubscriber } from "./modules/proxy/service-lifecycle-subscriber.js";
import { StaleDetectionJob } from "./modules/proxy/stale-detection-job.js";
import { buildModuleNavMeta } from "./modules/module-nav-meta.js";
import { serviceEventsBus } from "./modules/proxy/service-events-bus.js";

// Keyspace listener cleanup function (set during startup, called during shutdown)
let stopKeyspaceListener: (() => Promise<void>) | null = null;

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use(extJsonMiddleware());

type HealthCheckResult = { ok: boolean; version?: string; type?: string; error?: string };

function readBackendVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url)); // backend/src
  const pkgPath = resolve(here, "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { version?: string };
  return pkg.version ?? "0.0.0";
}

const BACKEND_VERSION = readBackendVersion();

async function checkDb(): Promise<HealthCheckResult> {
  try {
    const pool = getPool();
    // Keep it cheap; if DB is down this will throw quickly.
    const result = await pool.query("select 1 as ok, version() as pg_version");
    const pgVersion = result.rows[0]?.pg_version as string | undefined;
    // version() returns e.g. "PostgreSQL 18.0, compiled by Visual C++ ..."
    const versionMatch = pgVersion?.match(/PostgreSQL\s+([\d.]+)/);
    return { ok: true, version: versionMatch?.[1] };
  } catch (e) {
    if (isDatabaseUnavailableError(e)) return { ok: false };
    return { ok: false };
  }
}

async function checkIdp(pool?: Pool): Promise<HealthCheckResult> {
  try {
    // Load configuration from database or fallback to environment variables
    let casdoorEndpoint = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
    let clientId = process.env.CASDOOR_BUILTIN_CLIENT_ID || "cb05577e2097c31af3c7";
    let clientSecret = process.env.CASDOOR_BUILTIN_CLIENT_SECRET || "47b2e05673a5307ccf0552e32ba45a18f6627f21";
    let orgName = "admin";

    if (pool) {
      try {
        const dbConfig = await loadAuthConfigFromDb(pool);
        casdoorEndpoint = dbConfig.casdoor_endpoint || casdoorEndpoint;
        clientId = dbConfig.casdoor_builtin_client_id || clientId;
        clientSecret = dbConfig.casdoor_builtin_client_secret || clientSecret;
        orgName = dbConfig.casdoor_organization || orgName;
      } catch (error) {
        console.warn("[IDP Health Check] Could not load configuration from database, using fallback:", error);
      }
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
      console.error(`[IDP Health Check] Version endpoint returned non-OK status: ${versionResponse.status}`);
      return { ok: false };
    }

    const versionData = await versionResponse.json() as { status?: string; msg?: string; data?: { version?: string; commitId?: string; commitOffset?: number } };
    return {
      ok: true,
      type: "Casdoor",
      version: versionData.data?.version || "unknown",
    };
  } catch (e) {
    console.error(`[IDP Health Check] Error:`, (e as Error).message);
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

async function healthPayload(): Promise<HealthResponse> {
  const pool = getPool();
  const checks: Record<string, HealthCheckResult> = {
    db: await checkDb(),
    idp: await checkIdp(pool),
    redis: await checkRedis(),
    nats: checkNats(),
  };
  const isHealthy = Object.values(checks).every((c) => c.ok);
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
apiRouter.get("/modules", rbacHandler([Permission.MODULES_READ_ALL]), async (_req, res) => {
  const repo = new ServiceRegistryRepo(getPool());
  const services = await repo.findAll();
  res.json({
    modules: services.map((s) => {
      const navMeta = buildModuleNavMeta(s.code);
      return {
        id: s.code.toLowerCase(),
        name: s.name || s.code,
        enabled: s.is_enabled,
        icon: s.icon || navMeta?.icon,
        route_prefixes: navMeta?.route_prefixes,
        is_reserved: s.is_reserved,
      };
    }),
  });
});

apiRouter.get("/modules/:code/meta", rbacHandler([Permission.MODULES_READ_ALL]), async (req, res) => {
  const code = req.params.code as string;
  const meta = buildModuleNavMeta(code);
  if (!meta) {
    res.status(404).json({
      type: "about:blank",
      title: "Module not found",
      status: 404,
      detail: `No module with code '${code}'`,
    });
    return;
  }
  // Strip route_prefixes + is_reserved from the response — only needed in the /modules list
  const { route_prefixes: _rp, is_reserved: _ir, ...navMeta } = meta;
  res.json(navMeta);
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
  logServiceStartup("primebrick-api", BACKEND_VERSION, `http://localhost:${port}`);
});
server.timeout = 300_000;

// Background startup tasks — MUST NOT prevent the server from starting.
// /health is public and unaffected; authenticated endpoints fail closed
// (503 from DB-unavailable errors, or 403 from empty role cache) until
// the role mappings are successfully loaded.
void runStartupTasks().catch((err) => {
  console.error("[startup] background task failed:", err);
});

async function runStartupTasks(): Promise<void> {
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
    console.warn("[startup] MCP module not initialized — auth ports unavailable");
  }
  await startServiceLifecycle();
}

/**
 * Initialize the Redis cache from `redis_url` in auth_configurations.
 * Runs after refreshAuthConfig() so the config is loaded.
 * Redis is mandatory — if redis_url is set but Redis is unreachable, retry
 * every 5s (same pattern as refreshRoleMappings and refreshAuthConfig).
 * The /health endpoint will return 503 (redis.ok=false) until the retry succeeds.
 */
async function initCacheFromConfig(): Promise<void> {
  try {
    const cfg = getAuthConfig();
    await initCache(cfg.redis_url, console);
  } catch (err) {
    console.warn(
      "[startup] initCache failed (Redis unavailable?). Retrying in 5s.",
      err
    );
    setTimeout(() => void initCacheFromConfig().catch(() => {}), 5000);
  }
}

/**
 * Initialize the Redis presence store from `redis_url` in auth_configurations.
 * Runs after refreshAuthConfig() so the config is loaded.
 * Redis is mandatory — if redis_url is set but Redis is unreachable, retry
 * every 5s (same pattern as refreshRoleMappings and refreshAuthConfig).
 */
async function initPresenceStoreFromConfig(): Promise<void> {
  try {
    const cfg = getAuthConfig();
    await initPresenceStore(cfg.redis_url, console);
    // Start keyspace listener for presence expiry events (best-effort)
    if (cfg.redis_url) {
      try {
        stopKeyspaceListener = await startKeyspaceListener(cfg.redis_url, console);
      } catch (err) {
        console.warn("[startup] keyspace listener failed (best-effort):", err);
      }
    }
  } catch (err) {
    console.warn(
      "[startup] initPresenceStore failed (Redis unavailable?). Retrying in 5s.",
      err
    );
    setTimeout(() => void initPresenceStoreFromConfig().catch(() => {}), 5000);
  }
}

async function refreshRoleMappings(): Promise<void> {
  try {
    await loadRoleMappings();
  } catch (err) {
    console.warn(
      "[startup] loadRoleMappings failed (database unavailable?). Retrying in 5s.",
      err
    );
    setTimeout(() => void refreshRoleMappings().catch(() => {}), 5000);
  }
}

async function refreshAuthConfig(): Promise<void> {
  try {
    await loadAuthConfig(getPool());
    // Log PostgreSQL version after successful DB connection
    try {
      const result = await getPool().query("select version() as pg_version");
      const pgVersion = result.rows[0]?.pg_version as string | undefined;
      const versionMatch = pgVersion?.match(/PostgreSQL\s+([\d.]+)/);
      const dbUrl = process.env.DATABASE_URL ?? "localhost:5432";
      logModuleStartup("PostgreSQL", versionMatch?.[1], dbUrl);
    } catch {
      // version query failed — non-critical, DB is up (loadAuthConfig succeeded)
    }
  } catch (err) {
    console.warn(
      "[startup] loadAuthConfig failed (database unavailable?). Retrying in 5s.",
      err
    );
    setTimeout(() => void refreshAuthConfig().catch(() => {}), 5000);
  }
}

async function startServiceLifecycle(): Promise<void> {
  try {
    const natsUrl = process.env.NATS_URL ?? "nats://127.0.0.1:4222";
    await NatsClient.getConnection(natsUrl);
    // Subscribe to config.get — respond with shared config (redis_url, etc.)
    // Microservices discover redis_url from the BE via this NATS request/reply.
    await subscribeSharedConfig(NatsClient, () => {
      const cfg = getAuthConfig();
      return { redis_url: cfg.redis_url };
    });
    const subscriber = new ServiceLifecycleSubscriber();
    await subscriber.start();
    const staleJob = new StaleDetectionJob();
    staleJob.start();
  } catch (err) {
    console.warn(
      "[startup] NATS connection failed (service lifecycle subscriber not started). Retrying in 5s.",
      err
    );
    setTimeout(() => void startServiceLifecycle().catch(() => {}), 5000);
  }
}

// --- Graceful shutdown --------------------------------------------------------
// Close the Redis cache connection on SIGTERM/SIGINT so the Redis client
// quits cleanly (avoids "QUIT" errors in Redis logs on abrupt process exit).

async function gracefulShutdown(): Promise<void> {
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
    console.warn("[shutdown] closeCache failed:", err);
  }
  try {
    await closePresenceStore();
  } catch (err) {
    console.warn("[shutdown] closePresenceStore failed:", err);
  }
  try {
    collaborationBusRegistry.closeAll();
  } catch (err) {
    console.warn("[shutdown] collaborationBusRegistry.closeAll failed:", err);
  }
  if (stopKeyspaceListener) {
    try {
      await stopKeyspaceListener();
    } catch (err) {
      console.warn("[shutdown] keyspace listener stop failed:", err);
    }
    stopKeyspaceListener = null;
  }
}

process.on("SIGTERM", () => void gracefulShutdown().finally(() => process.exit(0)));
process.on("SIGINT", () => void gracefulShutdown().finally(() => process.exit(0)));
