import { Dal, getDal } from "@primebrick/dal-pg";
import type { Pool } from "pg";

let dalInstance: Dal | null = null;

export function initDal(): Dal {
  if (dalInstance) return dalInstance;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  dalInstance = getDal({
    connectionString,
    schema: "public",
    max: 10,
    statementTimeoutMs: 30000,
    applicationName: "primebrick-api",
  });
  return dalInstance;
}

export function getPool(): Pool {
  return initDal().getPool();
}

export async function closeDal(): Promise<void> {
  if (dalInstance) {
    await dalInstance.close();
    dalInstance = null;
  }
}
