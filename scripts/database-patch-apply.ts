/**
 * Apply database SQL patches to TARGET database.
 *
 * Strategy:
 * - Use DATABASE_URL (or backend/.env) for connection.
 * - Read db-meta/patches files sorted by filename (timestamp prefix).
 * - Read last applied patch_id from the database patch registry table (max).
 * - Only consider files strictly after that patch_id.
 * - For each candidate file:
 *   - Compute SHA256 of body.
 *   - If content_sha256 already recorded in registry, skip.
 *   - Otherwise, BEGIN; apply SQL; INSERT into registry; COMMIT.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

import { PATCH_REGISTRY_DDL, PATCH_REGISTRY_FQNAME } from "../src/db/database-patch-registry.js";
import { patchIdFromFilename, sha256Hex } from "../src/db/database-patch-naming.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "..");
const patchesDir = join(backendRoot, "db-meta", "patches");

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
  console.error("DATABASE_URL not set: cannot apply database patches.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });

try {
  // Ensure registry table exists
  await pool.query(PATCH_REGISTRY_DDL);

  // Find last applied patch_id
  const lastR = await pool.query<{ patch_id: string | null }>(
    `SELECT max(patch_id) AS patch_id FROM ${PATCH_REGISTRY_FQNAME}`
  );
  const lastPatchId = lastR.rows[0]?.patch_id ?? null;

  const files = readdirSync(patchesDir)
    .filter((f) => f.endsWith(".sql"))
    .sort(); // lexicographic: timestamp prefix gives chronological order

  const candidates = lastPatchId
    ? files.filter((f) => patchIdFromFilename(f) > lastPatchId)
    : files;

  if (candidates.length === 0) {
    console.log("No new database patches to apply.");
    process.exit(0);
  }

  console.log(`Found ${candidates.length} patch(es) to apply.`);

  for (const filename of candidates) {
    const patchPath = join(patchesDir, filename);
    const raw = readFileSync(patchPath, "utf8");
    const sha = sha256Hex(raw);
    const patchId = patchIdFromFilename(filename);

    const existing = await pool.query(
      `SELECT 1 FROM ${PATCH_REGISTRY_FQNAME} WHERE content_sha256 = $1 LIMIT 1`,
      [sha]
    );
    if ((existing.rowCount ?? 0) > 0) {
      console.log(`Skipping already-recorded patch body: ${filename}`);
      continue;
    }

    console.log(`Applying patch: ${filename}`);
    try {
      await pool.query("BEGIN");
      await pool.query(raw);
      await pool.query(
        `INSERT INTO ${PATCH_REGISTRY_FQNAME} (patch_id, content_sha256) VALUES ($1, $2) ON CONFLICT (patch_id) DO NOTHING`,
        [patchId, sha]
      );
      await pool.query("COMMIT");
    } catch (e) {
      await pool.query("ROLLBACK");
      console.error(`Failed to apply patch ${filename}:`, e);
      process.exit(1);
    }
  }

  console.log("All pending database patches applied.");
} finally {
  await pool.end();
}

