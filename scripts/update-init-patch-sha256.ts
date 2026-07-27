/**
 * Fire-and-forget script: update content_sha256 of 00000000000000_init_database.sql
 * in the patch registry on existing live databases.
 *
 * Context: the init patch was modified in-place to add:
 *   - CREATE EXTENSION vector
 *   - docs_kb, ai_conversations, ai_messages, auth_events tables
 *   - auth_auditor role mapping seed
 *
 * The patch runner (applyPatches) enforces sha256 immutability: if the patch is
 * already registered with the old sha256, re-running db:migrate fails with a
 * mismatch. This script updates the registry to the new sha256 so db:migrate
 * skips the patch (it's already applied on live databases).
 *
 * The SQL changes themselves (new tables, extension, seed) must be applied
 * SEPARATELY on each live database — either by running the new DDL statements
 * manually, or by spinning up a fresh database. This script ONLY fixes the
 * registry hash. It does NOT apply any SQL.
 *
 * Usage:
 *   pnpm tsx scripts/update-init-patch-sha256.ts
 *
 * Safety:
 *   - Reads DATABASE_URL from env or .env
 *   - Idempotent (ON CONFLICT DO UPDATE)
 *   - Prints old and new sha256 for audit
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { sha256Hex } from "../src/db/database-patch-naming.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "..");
const patchPath = join(backendRoot, "db-meta", "patches", "00000000000000_init_database.sql");
const patchId = "00000000000000_init_database";

async function main(): Promise<void> {
  // Load DATABASE_URL from .env if not set
  if (!process.env.DATABASE_URL) {
    try {
      const envPath = join(backendRoot, ".env");
      const raw = readFileSync(envPath, "utf8");
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const k = trimmed.slice(0, eq).trim();
        if (k === "DATABASE_URL") {
          process.env.DATABASE_URL = trimmed.slice(eq + 1).trim();
          break;
        }
      }
    } catch {
      // .env may not exist in some environments
    }
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Set it in .env or environment.");
    process.exit(1);
  }

  const body = readFileSync(patchPath, "utf8");
  const newSha = sha256Hex(body);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    // Check if registry table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'primebrick_database_patches'
      )
    `);
    if (!checkTable.rows[0].exists) {
      console.log("Patch registry table does not exist. Nothing to update.");
      return;
    }

    // Read current sha256
    const current = await pool.query(
      "SELECT patch_id, content_sha256 FROM public.primebrick_database_patches WHERE patch_id = $1",
      [patchId],
    );

    if (current.rows.length === 0) {
      // Patch not registered yet — insert it (fresh database or registry missing)
      await pool.query(
        "INSERT INTO public.primebrick_database_patches (patch_id, content_sha256) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [patchId, newSha],
      );
      console.log(`Patch '${patchId}' was not in registry. Inserted with new sha256: ${newSha}`);
      return;
    }

    const oldSha = current.rows[0].content_sha256;
    if (oldSha === newSha) {
      console.log(`Patch '${patchId}' sha256 already up to date: ${newSha}`);
      return;
    }

    // Update sha256
    await pool.query(
      "UPDATE public.primebrick_database_patches SET content_sha256 = $2 WHERE patch_id = $1",
      [patchId, newSha],
    );
    console.log(`Patch '${patchId}' sha256 updated:`);
    console.log(`  old: ${oldSha}`);
    console.log(`  new: ${newSha}`);
    console.log("");
    console.log("NOTE: This script only updates the registry hash.");
    console.log("      The actual DDL changes (new tables, extension, seed) must be");
    console.log("      applied separately on this database if not already present.");
  } catch (error) {
    console.error("Error updating patch registry:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
