import "dotenv/config";
import { getPool } from "../src/db/pool.js";

async function fixDriftPatch() {
  const pool = getPool();
  try {
    await pool.query("DELETE FROM public.primebrick_database_patch WHERE patch_id LIKE '%drift%'");
    console.log("Deleted drift patches from registry");
  } catch (error) {
    console.error("Error deleting drift patches:", error);
  } finally {
    await pool.end();
  }
}

fixDriftPatch();
