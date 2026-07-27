/**
 * Just-in-time provisioning of `user_profiles` rows.
 *
 * The auth middleware calls `resolveInternalUuid()` on every authenticated
 * request to map the IDP `sub` to our internal Primebrick UUID. The first
 * time a user appears we INSERT a new row; subsequent calls hit the Redis
 * cache and never touch the DB.
 *
 * The cache only stores the `idp_code → uuid` mapping (never claims), so
 * stale values are not a security risk. TTL is 5 minutes — we want changes
 * to email / display_name on the IDP side to propagate within a few minutes.
 *
 * If Redis is disabled (redis_url empty or unreachable), every call hits
 * the DB — best-effort, the system is fully valid without Redis.
 */

import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { Repository, field, Filter } from "@primebrick/dal-pg";
import { getPool } from "../../db/pool.js";
import { BeAuditPortAdapter } from "../../db/audit-port-adapter.js";
import { UserProfileEntity } from "./user_profile_entity.js";
import { getCachePort } from "../../cache/cache-port-holder.js";

const USER_PROFILE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

function idpCodeCacheKey(idpCode: string): string {
  return `be:user_profiles:idp_code:${idpCode}`;
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
  // 1. Check Redis cache
  const port = getCachePort();
  if (port) {
    try {
      const cached = await port.get<string>(idpCodeCacheKey(input.idp_code));
      if (cached) return cached;
    } catch (e) {
      console.warn(`[cache] user_profiles get failed: ${e}`);
    }
  }

  const repo = new Repository(pool);
  const auditPort = new BeAuditPortAdapter(repo);

  // 2. Try a fast SELECT first — most requests hit existing users.
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
    // 3. Cache the result in Redis
    if (port) {
      try {
        await port.set(idpCodeCacheKey(input.idp_code), row.uuid, USER_PROFILE_CACHE_TTL_MS);
      } catch (e) {
        console.warn(`[cache] user_profiles set failed: ${e}`);
      }
    }
    return row.uuid;
  }

  // 4. Not found → just-in-time provisioning. The user that performs the very
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
  // 5. Cache the result in Redis
  if (port) {
    try {
      await port.set(idpCodeCacheKey(input.idp_code), uuid, USER_PROFILE_CACHE_TTL_MS);
    } catch (e) {
      console.warn(`[cache] user_profiles set failed: ${e}`);
    }
  }
  return uuid;
}

/**
 * Invalidate the Redis cache for a specific idp_code.
 * Called when a user profile is updated via the users API.
 * Best-effort — if Redis is down, the cache TTL (5 min) bounds staleness.
 */
export async function invalidateUserProfileCache(idpCode: string): Promise<void> {
  const port = getCachePort();
  if (port) {
    try {
      await port.del(idpCodeCacheKey(idpCode));
    } catch (e) {
      console.warn(`[cache] user_profiles invalidate failed: ${e}`);
    }
  }
}

/** Test helper: clear the user profile cache. With Redis, this is a no-op
 * (tests should use a FakeCachePort or mock). Kept for backward compat. */
export function resetUserProfileCacheForTest(): void {
  // No-op — the in-memory Map is gone. Tests that need cache isolation should
  // either disable Redis (no redis_url) or use a FakeCachePort.
}
