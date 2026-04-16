import "dotenv/config";
import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set (required to use DAL)");
  }
  pool = new Pool({ connectionString: url, max: 10 });
  return pool;
}

