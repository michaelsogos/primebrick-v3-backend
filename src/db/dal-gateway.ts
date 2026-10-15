import { Dal, getDal } from "@primebrick/dal-pg";
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

let dalInstance: Dal | null = null;

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

export function initDal(): Dal {
  if (dalInstance) return dalInstance;
  const { url, schemas } = assertDbEnv();
  dalInstance = getDal({
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
  return dalInstance;
}

// standards-exempt: getPool — governed seam for migration/patch tooling ONLY (run-be-migrations, db-migration.service)
export function getPool(): Pool {
  // standards-exempt: getPool — passthrough to the Dal-owned pool; callers are migration tooling
  return initDal().getPool();
}

export async function closeDal(): Promise<void> {
  if (dalInstance) {
    await dalInstance.close();
    dalInstance = null;
  }
}
