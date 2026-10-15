/**
 * BE migration runner — thin wrapper over the dal-pg engine.
 * The SAME engine runs inside `runStartupTasks` (src/db/run-be-migrations.ts)
 * at every BE boot — this script exists for manual/dev runs (git post-merge
 * hook calls it). Mode + trust are enforced by the engine; a signed
 * MANIFEST.json over db-meta/patches is required (fail-closed).
 */
import "dotenv/config";
import { Pool } from "pg";
import { join } from "node:path";
import { runMigrations } from "@primebrick/dal-pg";
import { logger } from "@primebrick/sdk";

const PATCHES_DIR = join(process.cwd(), "db-meta", "patches");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const pool = new Pool({ connectionString: url, max: 4 });
  try {
    const result = await runMigrations({
      pool,
      schema: "public",
      patchesDir: PATCHES_DIR,
      allowedTrust:
        process.env.NODE_ENV === "production" ? ["release"] : ["dev", "release"],
      actor: `cli:${process.pid}`,
      logger,
    });
    logger.info(
      `db-migration: ${result.applied.length} applied, ${result.skipped.length} skipped, ${result.failed.length} failed, ${result.pendingReview.length} pending review`,
      { tags: ["db-patches"] },
    );
    if (result.degraded || result.failed.length || result.securityEvents.length) {
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
