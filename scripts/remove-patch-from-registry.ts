import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

import { PATCH_REGISTRY_DDL, PATCH_REGISTRY_FQNAME } from "../src/db/database-patch-registry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "..");

const patchId = process.argv[2];
if (!patchId) {
  console.error('Usage: tsx scripts/remove-patch-from-registry.ts <patch_id>');
  process.exit(1);
}

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
  console.error("DATABASE_URL not set: cannot remove patch from registry.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });

async function main() {
  try {
    await pool.query(PATCH_REGISTRY_DDL);
    const result = await pool.query(
      `DELETE FROM ${PATCH_REGISTRY_FQNAME} WHERE patch_id = $1`,
      [patchId]
    );
    console.log(`Removed patch ${patchId} from registry (${result.rowCount} rows deleted)`);
  } catch (error) {
    console.error('Failed to remove patch:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
