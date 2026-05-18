import cors from "cors";
import express, { type Response } from "express";
import { customersRouter } from "./modules/customers/router.js";
import { Pool } from "pg";
import CasdoorSDK from "casdoor-nodejs-sdk";
import { loadAuthConfigFromDb, type AuthConfigDb } from "./modules/auth/config-repo.js";
import { openApiRouter } from "./openapi/router.js";
import { errorHandler } from "./http/error-handler.js";
import { getPool } from "./db/pool.js";
import { isDatabaseUnavailableError } from "./http/api-errors.js";
import { makeProtectedRouter } from "./http/protected-router.js";
import { rbacHandler } from "./modules/auth/rbac.middleware.js";
import { Permission } from "./modules/auth/permissions.js";
import { loadRoleMappings } from "./modules/auth/auth.middleware.js";
// Side-effect import: activates `Express.Request.user` type augmentation.
import "./modules/auth/types.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

type HealthModule = { id: string; version: string };
type HealthPayload = {
  ok: true;
  service: "primebrick-api";
  version: string;
  modules: HealthModule[];
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
const INSTALLED_MODULES: HealthModule[] = [
  // NOTE: This is the product/module version, not the API package version.
  { id: "crm", version: BACKEND_VERSION },
];

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
        casdoorEndpoint = dbConfig.casdoorEndpoint || casdoorEndpoint;
        clientId = "cb05577e2097c31af3c7"; // Built-in client ID is constant
        clientSecret = dbConfig.casdoorBuiltinClientSecret || clientSecret;
        orgName = dbConfig.casdoorOrganization || orgName;
      } catch (error) {
        console.warn("[IDP Health Check] Could not load configuration from database, using fallback:", error);
      }
    }
    
    console.log(`[IDP Health Check] Checking Casdoor at: ${casdoorEndpoint}`);
    console.log(`[IDP Health Check] Using SDK with clientId: ${clientId}`);
    
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

    console.log(`[IDP Health Check] Version endpoint status: ${versionResponse.status} ${versionResponse.statusText}`);

    if (!versionResponse.ok) {
      console.error(`[IDP Health Check] Version endpoint returned non-OK status: ${versionResponse.status}`);
      return { ok: false };
    }

    const versionData = await versionResponse.json() as { status?: string; msg?: string; data?: { version?: string; commitId?: string; commitOffset?: number } };
    console.log(`[IDP Health Check] Version data:`, JSON.stringify(versionData, null, 2));
    
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
    modules: INSTALLED_MODULES,
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

// Use makeProtectedRouter for /modules endpoint
const apiRouter = makeProtectedRouter();
apiRouter.get("/modules", rbacHandler([Permission.MODULES_LIST]), (_req, res) => {
  res.json({
    modules: [
      { id: "crm", name: "CRM", enabled: true },
      { id: "accounting", name: "Accounting", enabled: false },
      { id: "warehouse", name: "Warehouse", enabled: false },
    ],
  });
});

app.use("/api/v1", apiRouter);
app.use(customersRouter());

app.use(errorHandler);

// Load role mappings from database at startup
await loadRoleMappings();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
