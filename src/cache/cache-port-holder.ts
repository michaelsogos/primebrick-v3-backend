/**
 * Singleton holder for the `CachePort` instance.
 *
 * The BE initializes this once at startup from `redis_url` in `auth_configurations`.
 * If `redis_url` is empty or Redis is unreachable, `cachePort` stays `null` and all
 * cache calls are no-ops (best-effort — the system is fully valid without Redis).
 *
 * All modules that need cache access call `getCachePort()` and check for `null`.
 */

import type { CachePort, CacheLogger } from "@primebrick/sdk";
import { RedisCachePort, createRedisClient, closeRedisClient, getRedisInfo, type RedisInfo } from "@primebrick/sdk";

let cachePort: CachePort | null = null;
let redisInfo: RedisInfo | null = null;

/**
 * Initialize the cache port from `redis_url`.
 *
 * - If `redisUrl` is empty/undefined: logs a warn, cache disabled (best-effort).
 * - If Redis is unreachable: logs a warn, cache disabled (best-effort).
 * - If Redis is reachable: creates the singleton `RedisCachePort`, queries the
 *   server version, and logs a startup banner with the version.
 *
 * Called once at startup from `runStartupTasks()` (after `refreshAuthConfig()`
 * so `redis_url` is loaded from the DB).
 */
export async function initCache(
  redisUrl: string | undefined,
  logger: CacheLogger,
): Promise<void> {
  if (!redisUrl) {
    logger.warn("[cache] redis_url not set — cache disabled (best-effort, system valid without it)");
    return;
  }
  try {
    const redis = await createRedisClient(redisUrl);
    cachePort = new RedisCachePort(redis);
    redisInfo = await getRedisInfo(redis);
    if (redisInfo) {
      logger.info(`[cache] Redis connected (v${redisInfo.version})`);
    } else {
      logger.info("[cache] Redis connected (version unknown)");
    }
  } catch (err) {
    logger.warn(`[cache] Redis connection failed — cache disabled: ${err}`);
    // cachePort stays null — all cache calls are no-ops
  }
}

/**
 * Returns the `CachePort`, or `null` if cache is disabled.
 * Callers MUST check for `null` before using the port.
 */
export function getCachePort(): CachePort | null {
  return cachePort;
}

/**
 * Returns the Redis health status for the `/api/v1/health` endpoint.
 * Does NOT expose the URL — only the connection status and server version.
 */
export function getRedisHealth(): { ok: boolean; version?: string } {
  if (!cachePort) return { ok: false };
  return { ok: true, version: redisInfo?.version };
}

/**
 * Graceful shutdown — disconnect Redis and clear the singleton.
 * Safe to call multiple times. Registered with `GracefulShutdown`.
 */
export async function closeCache(): Promise<void> {
  await closeRedisClient();
  cachePort = null;
  redisInfo = null;
}
