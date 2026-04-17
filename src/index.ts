import cors from "cors";
import express, { type Response } from "express";
import { customersRouter } from "./modules/customers/router.js";
import { openApiRouter } from "./openapi/router.js";
import { errorHandler } from "./http/error-handler.js";
import { getPool } from "./db/pool.js";
import { isDatabaseUnavailableError } from "./http/api-errors.js";
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

async function healthPayload(): Promise<HealthPayload> {
  return {
    ok: true,
    service: "primebrick-api",
    version: BACKEND_VERSION,
    modules: INSTALLED_MODULES,
    db: await checkDb(),
  };
}

/** 200 when DB is up; 503 when the API process is up but Postgres is not (same JSON body). */
async function sendHealth(res: Response) {
  const payload = await healthPayload();
  res.status(payload.db.ok ? 200 : 503).json(payload);
}

app.get("/health", async (_req, res) => {
  await sendHealth(res);
});

// Same payload under API prefix so the frontend dev proxy can reach it.
app.get("/api/v1/health", async (_req, res) => {
  await sendHealth(res);
});

app.get("/api/v1/modules", (_req, res) => {
  res.json({
    modules: [
      { id: "crm", name: "CRM", enabled: true },
      { id: "accounting", name: "Accounting", enabled: false },
      { id: "warehouse", name: "Warehouse", enabled: false },
    ],
  });
});

app.use(openApiRouter());
app.use(customersRouter());

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
