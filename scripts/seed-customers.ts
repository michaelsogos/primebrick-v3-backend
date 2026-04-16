/**
 * One-off customers seed script.
 *
 * Requirements:
 * - DATABASE_URL (or backend/.env) must be set.
 * - customers table must already exist (created by db:migrate).
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

import { CustomersDal } from "../src/modules/customers/customers_dal.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "..");

function tryLoadDatabaseUrlFromEnvFile() {
  if (process.env.DATABASE_URL) return;
  try {
    const raw = readFileSync(join(backendRoot, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      if (k !== "DATABASE_URL") continue;
      let v = trimmed.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env.DATABASE_URL = v;
      return;
    }
  } catch {
    /* no .env */
  }
}

tryLoadDatabaseUrlFromEnvFile();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set: cannot seed customers.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });

try {
  // Check table existence
  const reg = await pool.query<{ oid: string | null }>(
    `SELECT to_regclass('public.customers')::text AS oid`
  );
  const oid = reg.rows[0]?.oid;
  if (!oid || oid === "") {
    console.error("Table public.customers does not exist. Run db:migrate first.");
    process.exit(1);
  }

  const dal = new CustomersDal(pool);
  await dal.seedIfEmpty();
  console.log("Customers seed completed (if table was empty).");
} finally {
  await pool.end();
}

