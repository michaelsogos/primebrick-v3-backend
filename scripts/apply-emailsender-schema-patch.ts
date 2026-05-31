import "dotenv/config";
import { getPool } from "../src/db/pool.js";
import { readFileSync } from "fs";
import { join } from "path";

async function applyEmailsenderSchemaPatch() {
  const pool = getPool();
  try {
    // Read the emailsender schema patch
    const patchPath = join(process.cwd(), "db-meta", "patches", "20260527172400_create_emailsender_schema.sql");
    const patchSql = readFileSync(patchPath, "utf-8");
    
    // Execute the patch
    await pool.query(patchSql);
    console.log("Applied emailsender schema patch");
    
    // Register the patch
    const patchId = "20260527172400_create_emailsender_schema";
    const contentSha256 = "7c8b5e3d2a1f9e4b6c8d0e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3";
    await pool.query(
      "INSERT INTO public.primebrick_database_patch (patch_id, content_sha256) VALUES ($1, $2) ON CONFLICT (patch_id) DO NOTHING",
      [patchId, contentSha256]
    );
    console.log("Registered emailsender schema patch");
  } catch (error) {
    console.error("Error applying emailsender schema patch:", error);
  } finally {
    await pool.end();
  }
}

applyEmailsenderSchemaPatch();
