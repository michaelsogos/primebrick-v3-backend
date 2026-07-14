import cors from "cors";
import express, { type Response } from "express";
import cookieParser from "cookie-parser";
import { extJsonMiddleware, Permission, NatsClient } from "@primebrick/sdk";
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
import { loadAuthConfig } from "./modules/auth/config.js";
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

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use(extJsonMiddleware());

type HealthPayload = {
  ok: true;
  service: "primebrick-api";
  version: string;
  db: { ok: boolean };
  idp: { ok: boolean; type?: string; version?: string };
};

function readBackendVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url)); // backend/src
  const pkgPath = resolve(here, "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { version?: string };
  return pkg.version ?? "0.0.0";
}

const BACKEND_VERSION = readBackendVersion();

async function checkDb(): Promise<{ ok: boolean }> {
  try {
    const pool = getPool();
    // Keep it cheap; if DB is down this will throw quickly.
    await pool.query("select 1 as ok");
    return { ok: true };
  } catch (e) {
    if (isDatabaseUnavailableError(e)) return { ok: false };
    return { ok: false };
  }
}

async function checkIdp(pool?: Pool): Promise<{ ok: boolean; type?: string; version?: string }> {
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
    
    // Initialize Casdoor SDK
    const sdk = new CasdoorSDK.SDK({
      endpoint: casdoorEndpoint,
      clientId: clientId,
      clientSecret: clientSecret,
      certificate: "",
      orgName: orgName,
    });
    
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
    const result = {
      ok: true,
      type: "Casdoor",
      version: versionData.data?.version || "unknown",
    };
    console.log(`[IDP Health Check] Result:`, result);
    
    return result;
  } catch (e) {
    console.error(`[IDP Health Check] Error:`, (e as Error).message);
    return { ok: false };
  }
}

async function healthPayload(): Promise<HealthPayload> {
  const pool = getPool();
  return {
    ok: true,
    service: "primebrick-api",
    version: BACKEND_VERSION,
    db: await checkDb(),
    idp: await checkIdp(pool),
  };
}

/** 200 when DB and IDP are up; 503 when the API process is up but Postgres or IDP is not (same JSON body). */
async function sendHealth(res: Response) {
  const payload = await healthPayload();
  const isHealthy = payload.db.ok && payload.idp.ok;
  res.status(isHealthy ? 200 : 503).json(payload);
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
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

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
    await NatsClient.getConnection();
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
