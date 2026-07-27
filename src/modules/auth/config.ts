/**
 * Auth configuration — BE-specific wrapper around SDK's auth-config-cache.
 *
 * Hybrid caching strategy (approved plan D2):
 *   - L1 (hot path): SDK in-memory cache (`getAuthConfig()` — synchronous, fast)
 *   - L2 (cross-pod): Redis cache (`be:auth_config:all` — shared across pods)
 *
 * `loadAuthConfig()` loads from DB, caches in BOTH SDK in-memory and Redis.
 * `getAuthConfig()` returns from SDK in-memory (sync — no Redis round-trip).
 * `invalidateAuthConfig()` clears BOTH SDK in-memory and Redis.
 *
 * Cross-pod staleness: when pod A invalidates, pod B's SDK in-memory cache is
 * NOT cleared. Pod B keeps serving stale config until the Redis TTL (5 min)
 * expires or pod B restarts. This is a pragmatic compromise — making
 * `getAuthConfig()` async to check Redis on every call would require touching
 * every call site (middleware, routers, services).
 */

import type { Pool } from "pg";
import {
  initAuthConfig,
  loadAuthConfig as sdkLoadAuthConfig,
  getAuthConfig as sdkGetAuthConfig,
  invalidateAuthConfig as sdkInvalidateAuthConfig,
  type AuthConfig,
  type AuthMode,
  type OidcConfig,
  type GatewayConfig,
} from "@primebrick/sdk";
import { BeAuthConfigPort } from "./sdk-auth-ports.js";
import { getCachePort } from "../../cache/cache-port-holder.js";

// Re-export types from SDK
export { AuthMode, type AuthConfig, type OidcConfig, type GatewayConfig };

const AUTH_CONFIG_CACHE_KEY = "be:auth_config:all";
const AUTH_CONFIG_TTL_MS = 5 * 60 * 1000; // 5 min

// Re-export SDK cache functions
export const getAuthConfig = sdkGetAuthConfig;

/**
 * Load auth config from DB into the SDK's in-memory cache AND Redis.
 * Called once at startup and on invalidation.
 */
export async function loadAuthConfig(pool: Pool): Promise<AuthConfig> {
  initAuthConfig(new BeAuthConfigPort(pool));
  const config = await sdkLoadAuthConfig();

  // Also store in Redis for cross-pod sharing
  const port = getCachePort();
  if (port) {
    try {
      await port.set(AUTH_CONFIG_CACHE_KEY, config, AUTH_CONFIG_TTL_MS);
    } catch (e) {
      console.warn(`[cache] auth_config set failed: ${e}`);
    }
  }
  return config;
}

/**
 * Invalidate both Redis and SDK in-memory cache.
 * Called when auth config is updated via the config API.
 */
export function invalidateAuthConfig(): void {
  sdkInvalidateAuthConfig();
  const port = getCachePort();
  if (port) {
    port.del(AUTH_CONFIG_CACHE_KEY).catch((e) =>
      console.warn(`[cache] auth_config invalidate failed: ${e}`)
    );
  }
}

/** Test helper alias (backward compat). */
export const resetAuthConfigForTest = sdkInvalidateAuthConfig;
