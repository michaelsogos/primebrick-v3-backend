import { getDal, resetDal } from "@primebrick/dal-pg";
import {
  assertDbEnv,
  logger,
  withCache,
  type CachePort,
  type CacheableRepository,
} from "@primebrick/sdk";
// standards-exempt: pg-import — type-only for the sanctioned getPool() migration seam
import type { Pool } from "pg";
import { getCachePort } from "../cache/cache-port-holder.js";

/**
 * Dal gateway bootstrap for the BE.
 *
 * `initDal()` is called ONCE from `index.ts` startup — before any
 * DB-dependent work (migrations, config loads). It returns void: the
 * accessor is `getDal()` (re-exported from dal-pg — same convention as
 * every microservice's `db/dal.ts`). `getDal()` FAILS FAST if bootstrap
 * hasn't run — there is no lazy get-or-init seam.
 *
 * The env contract (DATABASE_URL + DATABASE_SCHEMA, nothing else) is
 * enforced by assertDbEnv.
 */

/**
 * CachePort that resolves to the singleton port lazily on every call.
 * `initCache()` runs AFTER `initDal()` at boot (redis_url lives in
 * config_entries, which we must read via the Dal), so a concrete port
 * cannot be injected at Dal construction. Before Redis is up — or when
 * cache is disabled — every call is a no-op and `withCache` falls through
 * to the underlying Repository (best-effort by contract).
 */
const lazyCachePort: CachePort = {
  get: <T>(key: string) => getCachePort()?.get<T>(key) ?? Promise.resolve(null),
  set: <T>(key: string, value: T, ttl?: number) =>
    getCachePort()?.set(key, value, ttl) ?? Promise.resolve(),
  del: (key: string) => getCachePort()?.del(key) ?? Promise.resolve(),
  delByPrefix: (prefix: string) => getCachePort()?.delByPrefix(prefix) ?? Promise.resolve(),
  ping: () => getCachePort()?.ping() ?? Promise.resolve(false),
};

export function initDal(): void {
  const { url, schemas } = assertDbEnv();
  getDal({
    connectionString: url,
    schemas,
    // The BE is the i18n gateway — it manages `<module>.translations` in
    // every module schema (static + registry-discovered). `translations`
    // is the governed shared table contract; domain check still applies
    // to every other table.
    sharedTables: ["translations"],
    // `@Cached` entities are Redis-cached uniformly — no consumer may build
    // its own cached repository. Tx-scoped repos stay undecorated (cache
    // writes/invalidation must not fire before commit).
    repoDecorator: (repo) =>
      withCache(repo as unknown as CacheableRepository, lazyCachePort, logger) as unknown as typeof repo,
    max: 10,
    statementTimeoutMs: 30000,
    applicationName: "primebrick-api",
  });
}

export { getDal };

// standards-exempt: getPool — governed seam for migration/patch tooling ONLY (run-module-migrations, db-migration.service)
export function getPool(): Pool {
  // standards-exempt: getPool — passthrough to the Dal-owned pool; callers are migration tooling
  return getDal().getPool();
}

export async function closeDal(): Promise<void> {
  await resetDal();
}
