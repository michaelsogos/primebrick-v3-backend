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
import { Repository, field, Filter } from "@primebrick/dal-pg";
import { getPool } from "../../db/pool.js";
import { BeAuditPortAdapter } from "../../db/audit-port-adapter.js";
import { UserProfileEntity } from "./user_profile_entity.js";

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
  idp_org?: string | null;
  idp_username?: string | null;
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

  const repo = new Repository(pool);
  const auditPort = new BeAuditPortAdapter(repo);

  // Try a fast SELECT first — most requests hit existing users.
  const row = await repo.find<UserProfileEntity, { uuid: string; idp_org?: string; idp_username?: string }>(
    UserProfileEntity,
    [
      { kind: "field", field: field(UserProfileEntity, "uuid" as any) },
      { kind: "field", field: field(UserProfileEntity, "idp_org" as any) },
      { kind: "field", field: field(UserProfileEntity, "idp_username" as any) },
    ],
    {
      filters: [Filter.fieldValue(field(UserProfileEntity, "idp_code" as any), "=", input.idp_code)],
      throwIfNotFound: false,
    }
  );

  if (row) {
    // Sync idp_org and idp_username if they differ from input (keeps Casdoor sync reliable)
    const needsUpdate =
      (input.idp_org !== undefined && input.idp_org !== null && row.idp_org !== input.idp_org) ||
      (input.idp_username !== undefined && input.idp_username !== null && row.idp_username !== input.idp_username);
    if (needsUpdate) {
      const updates: Record<string, unknown> = { idp_code: input.idp_code };
      if (input.idp_org !== undefined && input.idp_org !== null) {
        updates.idp_org = input.idp_org;
      }
      if (input.idp_username !== undefined && input.idp_username !== null) {
        updates.idp_username = input.idp_username;
      }
      await repo.update(
        UserProfileEntity,
        updates,
        { actor: row.uuid, matchBy: "idp_code", audit: auditPort }
      );
    }
    cacheSet(input.idp_code, row.uuid);
    return row.uuid;
  }

  // Not found → just-in-time provisioning. The user that performs the very
  // first auth bootstraps their own profile, hence `actor = newUuid`.
  const newUuid = randomUUID();

  const upserted = await repo.upsert(
    UserProfileEntity,
    {
      uuid: newUuid,
      idp_code: input.idp_code,
      email: input.email,
      display_name: input.display_name,
      idp_org: input.idp_org,
      idp_username: input.idp_username,
    },
    { actor: newUuid, conflictTarget: "idp_code", audit: auditPort }
  );

  const uuid = (upserted as any)?.uuid ?? newUuid;
  cacheSet(input.idp_code, uuid);
  return uuid;
}

/** Test helper: clear the in-memory mapping cache. */
export function resetUserProfileCacheForTest(): void {
  cache.clear();
}
