/**
 * Repository factory — creates a DAL `Repository`, optionally wrapped with
 * `withCache` if the Redis cache is enabled.
 *
 * Usage: replace `new Repository(pool)` with `createRepository(pool)` in DAL
 * files that handle `@Cached` entities. If the cache is disabled (redis_url
 * empty or Redis unreachable), a bare `Repository` is returned — no overhead.
 *
 * DALs for non-cached entities (role_mappings, auth_configurations,
 * service_registry, user_invitations, user_passkeys) should keep using
 * `new Repository(pool)` directly — no point wrapping them with `withCache`
 * since they're not `@Cached`.
 */

import type { Pool } from "pg";
import { Repository } from "@primebrick/dal-pg";
import { withCache, type CacheableRepository, type CacheLogger } from "@primebrick/sdk";
import { getCachePort } from "../cache/cache-port-holder.js";

const logger: CacheLogger = {
  warn: console.warn.bind(console),
  info: console.info.bind(console),
};

/**
 * Create a `Repository`, wrapped with `withCache` if Redis is enabled.
 * If cache is disabled, returns a bare `Repository`.
 */
export function createRepository(pool: Pool): Repository {
  const repo = new Repository(pool);
  const cachePort = getCachePort();
  if (cachePort) {
    return withCache(repo as unknown as CacheableRepository, cachePort, logger) as unknown as Repository;
  }
  return repo;
}
