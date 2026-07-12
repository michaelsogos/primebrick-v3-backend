import "dotenv/config";
import { Pool, types } from "pg";

let pool: Pool | null = null;

// Register INT8 (bigint) type parser — pg returns INT8 as string by default.
// We want native bigint for all bigint columns (id PKs, counts, etc.).
// OID 20 = int8, OID 1700 = numeric.
types.setTypeParser(types.builtins.INT8, (val: string) => BigInt(val));
// Keep NUMERIC as number (or string if too large) — default pg behavior is string.
types.setTypeParser(types.builtins.NUMERIC, (val: string) => Number(val));

export function getPool(): Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set (required to use DAL)");
  }
  pool = new Pool({ connectionString: url, max: 10 });
  return pool;
}

