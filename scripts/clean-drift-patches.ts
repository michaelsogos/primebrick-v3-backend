import "dotenv/config";
import { getPool } from "../src/db/pool.js";

async function cleanDriftPatches() {
  const pool = getPool();
  try {
    // Delete all drift patches
    await pool.query("DELETE FROM public.primebrick_database_patch WHERE patch_id LIKE '%drift%'");
    console.log("Deleted all drift patches from registry");
    
    // Also delete the organizations patch that has conflicts
    await pool.query("DELETE FROM public.primebrick_database_patch WHERE patch_id LIKE '%organizations%'");
    console.log("Deleted organizations patches from registry");
  } catch (error) {
    console.error("Error cleaning patches:", error);
  } finally {
    await pool.end();
  }
}

cleanDriftPatches();
