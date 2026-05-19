import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updateTimestamps() {
  await pool.query(
    `UPDATE public.role_mappings 
     SET created_at = '2026-05-18T14:27:00Z', 
         updated_at = '2026-05-18T14:27:00Z',
         version = 1
     WHERE created_by = 'system'`
  );
  console.log('Updated role_mappings timestamps and version');
  await pool.end();
}

updateTimestamps().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
