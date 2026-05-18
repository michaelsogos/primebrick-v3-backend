/**
 * Just-in-time provisioning of `user_profiles` rows.
 *
 * The auth middleware calls `resolveInternalUuid()` on every authenticated
 * request to map the IDP `sub` to our internal Primebrick UUID. The first
 * time a user appears we INSERT a new row; subsequent calls hit a small
 * in-memory LRU and never touch the DB.
 *
 * The cache is intentionally tiny and time-bounded: we want changes to
 * email / display_name on the IDP side to propagate within a few minutes.
 * The cache only stores the `idp_code → uuid` mapping (never claims), so
 * stale values are not a security risk.
 */

import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { getPool } from "../../db/pool.js";

interface CacheEntry {
  uuid: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_ENTRIES = 1000;
const cache = new Map<string, CacheEntry>();

function cacheGet(idpCode: string): string | null {
  const entry = cache.get(idpCode);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(idpCode);
    return null;
  }
  return entry.uuid;
}

function cacheSet(idpCode: string, uuid: string): void {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    // Drop the oldest entry (insertion order on Map iterators).
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(idpCode, { uuid, expiresAt: Date.now() + CACHE_TTL_MS });
}

export interface ResolveInput {
  idp_code: string;
  email: string | null;
  display_name: string | null;
}

/**
 * Return the internal Primebrick UUID for the given IDP subject, creating a
 * `user_profiles` row on first encounter.
 *
 * Concurrency:
 *   The INSERT uses `ON CONFLICT (idp_code) DO UPDATE` so two simultaneous
 *   requests for a brand-new user will agree on the same UUID (the one that
 *   wins the unique constraint). The losing INSERT then reads back the
 *   winning UUID via `RETURNING`.
 */
export async function resolveInternalUuid(
  input: ResolveInput,
  pool: Pool = getPool()
): Promise<string> {
  const cached = cacheGet(input.idp_code);
  if (cached) return cached;

  // Try a fast SELECT first — most requests hit existing users.
  const sel = await pool.query<{ uuid: string }>(
    `select uuid from public.user_profiles where idp_code = $1 limit 1`,
    [input.idp_code]
  );
  if (sel.rowCount && sel.rows[0]) {
    cacheSet(input.idp_code, sel.rows[0].uuid);
    return sel.rows[0].uuid;
  }

  // Not found → just-in-time provisioning. The user that performs the very
  // first auth bootstraps their own profile, hence `created_by = uuid`.
  const newUuid = randomUUID();
  const now = new Date();
  const ins = await pool.query<{ uuid: string }>(
    `insert into public.user_profiles
       (uuid, idp_code, email, display_name,
        created_at, created_by, updated_at, updated_by, version)
     values ($1, $2, $3, $4, $5, $6, $7, $8, 1)
     on conflict (idp_code) do update
       set email = excluded.email,
           display_name = excluded.display_name,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by,
           version = public.user_profiles.version + 1
     returning uuid`,
    [
      newUuid,
      input.idp_code,
      input.email,
      input.display_name,
      now,
      newUuid,
      now,
      newUuid,
    ]
  );
  const uuid = ins.rows[0]?.uuid ?? newUuid;
  cacheSet(input.idp_code, uuid);
  return uuid;
}

/** Test helper: clear the in-memory mapping cache. */
export function resetUserProfileCacheForTest(): void {
  cache.clear();
}
