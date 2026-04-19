/**
 * Apply database SQL patches to TARGET database.
 *
 * Strategy:
 * - Use DATABASE_URL (or backend/.env) for connection.
 * - Read db-meta/patches files sorted by filename (UTC timestamp prefix in patch_id).
 * - For each file in order, consult public.primebrick_database_patch (patch_id + content_sha256):
 *   - If this patch_id is already recorded with the same SHA → skip (already applied).
 *   - If this patch_id exists with a different SHA → fail (immutable patch changed).
 *   - If this patch_id is missing but the same body SHA exists under another patch_id → register
 *     this patch_id with the same SHA without re-executing SQL (idempotent duplicate body).
 *   - Otherwise → BEGIN; apply SQL; INSERT registry row; COMMIT.
 *
 * This does not rely on max(patch_id) alone, so a gap (e.g. older patch never registered)
 * is still applied when encountered in sorted order.
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

function listPatchFilenamesSorted(): string[] {
  let files: string[] = [];
  try {
    files = readdirSync(patchesDir).filter((f) => f.endsWith(".sql"));
  } catch {
    return [];
  }
  return files.sort();
}

const pool = new Pool({ connectionString: url, max: 1 });

try {
  await pool.query(PATCH_REGISTRY_DDL);

  const files = listPatchFilenamesSorted();
  if (files.length === 0) {
    console.log("No database patch files in db-meta/patches.");
    process.exit(0);
  }

  let appliedOrRegistered = 0;

  for (const filename of files) {
    const patchPath = join(patchesDir, filename);
    const raw = readFileSync(patchPath, "utf8");
    const sha = sha256Hex(raw);
    const patchId = patchIdFromFilename(filename);

    const byId = await pool.query<{ content_sha256: string }>(
      `SELECT content_sha256 FROM ${PATCH_REGISTRY_FQNAME} WHERE patch_id = $1`,
      [patchId]
    );

    if ((byId.rowCount ?? 0) > 0) {
      const recorded = byId.rows[0]!.content_sha256;
      if (recorded === sha) {
        console.log(`Skipping already applied patch: ${filename}`);
        continue;
      }
      console.error(
        `Patch ${filename} (${patchId}) exists in registry with a different content_sha256 — refusing to run.`
      );
      process.exit(1);
    }

    const bySha = await pool.query<{ patch_id: string }>(
      `SELECT patch_id FROM ${PATCH_REGISTRY_FQNAME} WHERE content_sha256 = $1 LIMIT 1`,
      [sha]
    );
    if ((bySha.rowCount ?? 0) > 0) {
      const other = bySha.rows[0]!.patch_id;
      await pool.query(
        `INSERT INTO ${PATCH_REGISTRY_FQNAME} (patch_id, content_sha256) VALUES ($1, $2)`,
        [patchId, sha]
      );
      console.log(
        `Registered ${filename} (same body as ${other}) — no SQL re-execution.`
      );
      appliedOrRegistered++;
      continue;
    }

    console.log(`Applying patch: ${filename}`);
    try {
      await pool.query("BEGIN");
      await pool.query(raw);
      await pool.query(
        `INSERT INTO ${PATCH_REGISTRY_FQNAME} (patch_id, content_sha256) VALUES ($1, $2)`,
        [patchId, sha]
      );
      await pool.query("COMMIT");
      appliedOrRegistered++;
    } catch (e) {
      await pool.query("ROLLBACK");
      console.error(`Failed to apply patch ${filename}:`, e);
      process.exit(1);
    }
  }

  if (appliedOrRegistered === 0) {
    console.log("No new database patches to apply (all already recorded).");
  } else {
    console.log(`Database patches finished (${appliedOrRegistered} applied or registered).`);
  }
} finally {
  await pool.end();
}
