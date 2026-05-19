import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256Hex } from "../src/db/database-patch-naming.js";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "..");
const patchesDir = join(backendRoot, "db-meta", "patches");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixRegistry() {
  const patches = [
    "20260516125000_create_public_customers_audit",
    "20260516200000_addcol_public_customers_audit_changed_by",
    "20260518142700_seed_initial_role_mappings",
    "20260518130727_create_public_user_profiles_public_role_mappings",
  ];

  for (const patchId of patches) {
    const patchPath = join(patchesDir, `${patchId}.sql`);
    const raw = readFileSync(patchPath, "utf8");
    const sha = sha256Hex(raw);

    console.log(`Patch ID: ${patchId}`);
    console.log(`Current file SHA256: ${sha}`);

    const res = await pool.query<{ content_sha256: string }>(
      `SELECT content_sha256 FROM public.primebrick_database_patch WHERE patch_id = $1`,
      [patchId]
    );

    if (res.rowCount === 0) {
      console.log("Patch not found in registry - nothing to fix");
    } else {
      const recorded = res.rows[0]!.content_sha256;
      console.log(`Registry SHA256: ${recorded}`);

      if (recorded !== sha) {
        console.log("Mismatch detected - updating registry...");
        await pool.query(
          `UPDATE public.primebrick_database_patch SET content_sha256 = $1 WHERE patch_id = $2`,
          [sha, patchId]
        );
        console.log("Registry updated successfully");
      } else {
        console.log("SHA256 matches - no update needed");
      }
    }
    console.log("---");
  }

  await pool.end();
}

fixRegistry().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
