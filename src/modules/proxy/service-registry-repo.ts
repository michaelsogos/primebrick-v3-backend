/**
 * Service registry lookup — reads from the `service_registry` table.
 * Used by the proxy to discover microservice base URLs by service code.
 */

import type { Pool } from "pg";

export interface ServiceRegistryEntry {
  code: string;
  base_url: string;
  endpoints: Record<string, string>;
}

interface ServiceRegistryRow {
  code: string;
  base_url: string;
  endpoints: Record<string, string>;
}

/**
 * Look up a service by its code from the `service_registry` table.
 * Returns null if not found.
 */
export async function findServiceByCode(pool: Pool, code: string): Promise<ServiceRegistryEntry | null> {
  const result = await pool.query<ServiceRegistryRow>(
    `SELECT code, base_url, endpoints FROM public.service_registry WHERE code = $1`,
    [code],
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    code: row.code,
    base_url: row.base_url,
    endpoints: row.endpoints || {},
  };
}

// Simple TTL cache (60s) to avoid hitting the DB on every proxy request
const cache = new Map<string, { entry: ServiceRegistryEntry; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 1000;

/**
 * Look up a service by code with TTL caching.
 */
export async function findServiceByCodeCached(pool: Pool, code: string): Promise<ServiceRegistryEntry | null> {
  const cached = cache.get(code);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.entry;
  }
  const entry = await findServiceByCode(pool, code);
  if (entry) {
    cache.set(code, { entry, expiresAt: Date.now() + CACHE_TTL_MS });
  }
  return entry;
}

/** Clear the cache (for testing or manual refresh). */
export function clearServiceRegistryCache(): void {
  cache.clear();
}
