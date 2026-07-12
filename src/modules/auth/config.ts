/**
 * Auth configuration — BE-specific wrapper around SDK's auth-config-cache.
 *
 * The SDK provides initAuthConfig(), loadAuthConfig(), getAuthConfig(), and
 * invalidateAuthConfig(). The BE uses BeAuthConfigPort (from sdk-auth-ports.ts)
 * as the port implementation that reads from the `auth_configurations` table.
 *
 * This file re-exports the SDK functions for backward-compatible usage within
 * the BE codebase, and provides the BE-specific loadAuthConfig(pool) function
 * that initializes the port if needed.
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

// Re-export types from SDK
export { AuthMode, type AuthConfig, type OidcConfig, type GatewayConfig };

// Re-export SDK cache functions
export const getAuthConfig = sdkGetAuthConfig;
export const invalidateAuthConfig = sdkInvalidateAuthConfig;

/**
 * Load auth config from DB into the SDK's in-memory cache.
 * Called once at startup and on invalidation.
 */
export async function loadAuthConfig(pool: Pool): Promise<AuthConfig> {
  initAuthConfig(new BeAuthConfigPort(pool));
  return sdkLoadAuthConfig();
}

/** Test helper alias (backward compat). */
export const resetAuthConfigForTest = sdkInvalidateAuthConfig;
