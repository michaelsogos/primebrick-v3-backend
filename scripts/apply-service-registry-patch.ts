import "dotenv/config";
import { getPool } from "../src/db/pool.js";
import { readFileSync } from "fs";
import { join } from "path";

async function applyServiceRegistryPatch() {
  const pool = getPool();
  try {
    // Read the service_registry patch
    const patchPath = join(process.cwd(), "db-meta", "patches", "20260527172343_create_public_service_registry.sql");
    const patchSql = readFileSync(patchPath, "utf-8");
    
    // Execute the patch
    await pool.query(patchSql);
    console.log("Applied service_registry patch");
    
    // Register the patch
    const patchId = "20260527172343_create_public_service_registry";
    const contentSha256 = "1a1aeafd3c7ba18af931aa8e8a5084b4638b5ea984fa0d52b359ac6484e85646";
    await pool.query(
      "INSERT INTO public.primebrick_database_patch (patch_id, content_sha256) VALUES ($1, $2) ON CONFLICT (patch_id) DO NOTHING",
      [patchId, contentSha256]
    );
    console.log("Registered service_registry patch");
  } catch (error) {
    console.error("Error applying service_registry patch:", error);
  } finally {
    await pool.end();
  }
}

applyServiceRegistryPatch();
