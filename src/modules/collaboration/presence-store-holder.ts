/**
 * Singleton holder for the `PresencePort` instance.
 *
 * The BE initializes this once at startup — reusing the same Redis client as
 * the cache port (both are best-effort features backed by the same Redis).
 * If Redis is unavailable, `presencePort` stays `null` and all presence calls
 * are no-ops (best-effort — the system is fully valid without presence).
 *
 * All modules that need presence access call `getPresenceStore()` and check
 * for `null`.
 */

import type { PresencePort } from "@primebrick/sdk";
import { RedisPresencePort, createRedisClient } from "@primebrick/sdk";

let presencePort: PresencePort | null = null;

/**
 * Initialize the presence store from `redis_url`.
 *
 * Reuses the same `redis_url` as the cache port (from `auth_configurations`).
 * If `redisUrl` is empty/undefined: logs a warn, presence disabled (best-effort).
 * If Redis is unreachable: logs a warn, presence disabled (best-effort).
 *
 * Note: this creates a SEPARATE Redis client from the cache port. The node-redis
 * client does not support concurrent command queuing on a shared connection
 * safely across modules, so each feature gets its own client. Both connect to
 * the same Redis instance.
 *
 * Called once at startup from `runStartupTasks()` (after `refreshAuthConfig()`
 * so `redis_url` is loaded from the DB).
 */
export async function initPresenceStore(
  redisUrl: string | undefined,
  logger: { warn: (msg: string) => void; info: (msg: string) => void },
): Promise<void> {
  if (!redisUrl) {
    logger.warn("[presence] redis_url not set — presence disabled (best-effort, system valid without it)");
    return;
  }
  try {
    const redis = await createRedisClient(redisUrl);
    presencePort = new RedisPresencePort(redis);
    logger.info("[presence] Redis presence store connected");
  } catch (err) {
    logger.warn(`[presence] Redis connection failed — presence disabled: ${err}`);
    // presencePort stays null — all presence calls are no-ops
  }
}

/**
 * Returns the `PresencePort`, or `null` if presence is disabled.
 * Callers MUST check for `null` before using the port.
 */
export function getPresenceStore(): PresencePort | null {
  return presencePort;
}

/**
 * Graceful shutdown — clear the singleton. The Redis client itself is closed
 * by `closeRedisClient()` in the cache-port-holder (shared singleton).
 * Safe to call multiple times.
 */
export async function closePresenceStore(): Promise<void> {
  presencePort = null;
}
