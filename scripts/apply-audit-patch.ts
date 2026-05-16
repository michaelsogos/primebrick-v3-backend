import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

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
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });

try {
  // Check if pg_partman extension is installed
  console.log("Checking pg_partman extension...");
  const checkExtension = await pool.query(`
    SELECT EXISTS (
      SELECT FROM pg_extension 
      WHERE extname = 'pg_partman'
    )
  `);
  
  if (checkExtension.rows[0].exists) {
    console.log("pg_partman extension already exists, checking schema...");
    const checkSchema = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_namespace 
        WHERE nspname = 'partman'
      )
    `);
    
    if (!checkSchema.rows[0].exists) {
      console.log("Dropping extension to recreate with schema...");
      await pool.query(`DROP EXTENSION IF EXISTS "pg_partman" CASCADE`);
      console.log("Creating partman schema...");
      await pool.query(`CREATE SCHEMA IF NOT EXISTS partman`);
      console.log("Creating pg_partman extension with schema...");
      await pool.query(`CREATE EXTENSION "pg_partman" SCHEMA partman`);
      console.log("pg_partman extension recreated with schema.");
    } else {
      console.log("pg_partman extension and schema already exist.");
    }
  } else {
    console.log("Creating partman schema...");
    await pool.query(`CREATE SCHEMA IF NOT EXISTS partman`);
    console.log("Creating pg_partman extension...");
    await pool.query(`CREATE EXTENSION "pg_partman" SCHEMA partman`);
    console.log("pg_partman extension created.");
  }
  
  // Drop existing table and partition config if exists
  console.log("Dropping existing customers_audit table if exists...");
  await pool.query(`DROP TABLE IF EXISTS "public"."customers_audit" CASCADE`);
  
  // Check if part_config table exists before trying to delete from it
  const checkPartConfig = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'part_config'
    )
  `);
  
  if (checkPartConfig.rows[0].exists) {
    await pool.query(`DELETE FROM public.part_config WHERE parent_table = 'public.customers_audit'`);
  }
  
  console.log("Existing table dropped.");
  
  const patchPath = join(backendRoot, "db-meta", "patches", "20260516125000_create_public_customers_audit.sql");
  const sql = readFileSync(patchPath, "utf8");
  
  // Remove the registry footer before executing
  const sqlWithoutFooter = sql.split("-- === database patch registry")[0];
  
  console.log("Applying customers_audit table patch with pg_partman...");
  await pool.query(sqlWithoutFooter);
  console.log("Patch applied successfully!");
  
  // Register the patch
  const patchId = "20260516125000_create_public_customers_audit";
  const contentSha = "TBD"; // Will need to calculate this properly
  
  // Check if patch registry table exists
  const checkRegistry = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'primebrick_database_patch'
    )
  `);
  
  if (checkRegistry.rows[0].exists) {
    await pool.query(`
      INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
      VALUES ($1, $2)
      ON CONFLICT (patch_id) DO UPDATE SET content_sha256 = EXCLUDED.content_sha256
    `, [patchId, contentSha]);
    console.log("Patch registered successfully!");
  }
} catch (error) {
  console.error("Error applying patch:", error);
  process.exit(1);
} finally {
  await pool.end();
}
