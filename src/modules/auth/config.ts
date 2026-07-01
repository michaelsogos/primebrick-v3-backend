/**
 * Auth configuration loaded once at boot from the database.
 *
 * Two operating modes are supported, mutually exclusive:
 *
 *   - STANDALONE: the API itself validates the Bearer token against the IDP via
 *                 OIDC discovery (`jose` + JWKS). This is the default for dev
 *                 and direct-exposure deployments.
 *
 *   - GATEWAY:    a trusted reverse proxy (Kong / Tyk / APISIX / Envoy) sits in
 *                 front of the API, validates the token itself and forwards
 *                 user identity via custom HTTP headers. The API then verifies
 *                 a shared secret header to defend against spoofing of the
 *                 user headers, and trusts the headers contents.
 *
 * IMPORTANT: there is intentionally NO `DISABLED` mode. Either the upstream
 * passes us a token / verified user headers, or the request is rejected with 401.
 * Internal jobs that need to write to the DAL may pass the literal string
 * `"system"` as the actor; this is a fallback restricted to non-HTTP code paths.
 *
 * DB is the SOLE source of truth for ALL auth config. No env-var fallbacks
 * exist in this module (except `DATABASE_URL` for the bootstrap connection
 * and `NODE_ENV` for the cookie `secure` attribute, both outside this file).
 */

import type { Pool } from "pg";
import { loadAuthConfigFromDb, type AuthConfigDb } from "./config-repo.js";
import { AuthConfigNotLoadedError } from "../../http/api-errors.js";

/**
 * Authentication operating modes.
 *
 *   STANDALONE — the API itself validates the Bearer token against the IDP
 *                via OIDC discovery (jose + JWKS). Default for dev and
 *                direct-exposure deployments.
 *
 *   GATEWAY   — a trusted reverse proxy (Kong / Tyk / APISIX / Envoy) sits
 *                in front, validates the token itself, and forwards user
 *                identity via custom HTTP headers. The API verifies a shared
 *                secret header to defend against spoofing.
 *
 * Stored as TEXT/VARCHAR in `auth_configurations.auth_mode`.
 * The DB value must match one of the enum string values below.
 */
export const AuthMode = {
  STANDALONE: "STANDALONE",
  GATEWAY: "GATEWAY",
} as const;

export type AuthMode = (typeof AuthMode)[keyof typeof AuthMode];

// snake_case — matches DB keys exactly. No issuerUrl → issuer_url renaming.
// Fields are optional in the type: they're only guaranteed present in
// STANDALONE mode (enforced by the validation block in loadAuthConfigFromDb).
export interface OidcConfig {
  issuer_url?: string;
  client_id?: string;
  client_secret?: string;
  audience?: string;
  issuer_type?: string;
}

// snake_case — matches DB keys exactly.
// Fields are optional in the type: they're only guaranteed present in GATEWAY
// mode (enforced by the validation block in loadAuthConfigFromDb). Consumers
// guard access with `cfg.mode === AuthMode.GATEWAY` before touching gateway
// fields — the runtime check is the real contract, not the type.
export interface GatewayConfig {
  secret?: string;
  secret_header_name?: string;
  public_secret?: string;
  public_secret_header_name?: string;
  headers: {
    user_id?: string;
    email?: string;
    name?: string;
    roles?: string;
    idp_code?: string;
    idp_org?: string;
    idp_username?: string;
  };
}

// snake_case — no DTO transformation from AuthConfigDb.
export interface AuthConfig {
  mode: AuthMode;
  /**
   * Path expression used to extract the roles array from a JWT payload.
   * Examples:
   *   "roles"               (Casdoor default, Microsoft Entra)
   *   "realm_access.roles"  (Keycloak realm roles)
   *   "resource_access.<client>.roles" (Keycloak client roles)
   */
  roles_path: string;
  oidc: OidcConfig;
  gateway: GatewayConfig;
  // Casdoor-specific, needed by AuthSessionService.login/refresh
  casdoor_endpoint?: string;
  casdoor_organization?: string;
  enable_email_verification_check: boolean;
}

let cached: AuthConfig | null = null;

/**
 * Load auth config from DB into the in-memory cache.
 * Called once at startup (like loadRoleMappings) and on invalidation.
 * Throws if the DB is unreachable or critical config is incomplete.
 * NO env-var fallbacks. NO hardcoded defaults. DB is the sole source of truth.
 */
export async function loadAuthConfig(pool: Pool): Promise<AuthConfig> {
  const dbConfig = await loadAuthConfigFromDb(pool); // throws on DB error or missing mandatory fields

  const mode: AuthMode = dbConfig.auth_mode; // already validated + normalized in loadAuthConfigFromDb

  // Pure mapping — NO validation here (all checks are in loadAuthConfigFromDb).
  // Snake_case field names flow through unchanged from AuthConfigDb — no DTO
  // renaming. Only the logical grouping into oidc/gateway sub-objects is
  // applied (for type safety, not renaming). NO `?? ""` defaults — values
  // are exactly what the DB has (undefined if missing, string if present).
  const oidc: OidcConfig = {
    issuer_url: dbConfig.oidc_issuer_url,
    client_id: dbConfig.oidc_client_id,
    client_secret: dbConfig.oidc_client_secret,
    audience: dbConfig.oidc_audience,
    issuer_type: dbConfig.oidc_issuer_type,
  };

  const gateway: GatewayConfig = {
    secret: dbConfig.gateway_secret,
    secret_header_name: dbConfig.gateway_secret_header,
    public_secret: dbConfig.gateway_public_secret,
    public_secret_header_name: dbConfig.gateway_public_secret_header,
    headers: {
      user_id: dbConfig.gateway_header_user_id,
      email: dbConfig.gateway_header_email,
      name: dbConfig.gateway_header_name,
      roles: dbConfig.gateway_header_roles,
      idp_code: dbConfig.gateway_header_idp_code,
      idp_org: dbConfig.gateway_header_idp_org,
      idp_username: dbConfig.gateway_header_idp_username,
    },
  };

  cached = {
    mode,
    roles_path: dbConfig.auth_roles_path!,
    oidc,
    gateway,
    casdoor_endpoint: dbConfig.casdoor_endpoint,
    casdoor_organization: dbConfig.casdoor_organization,
    enable_email_verification_check: dbConfig.enable_email_verification_check,
  };
  return cached;
}

/**
 * Return the cached config. Throws `AuthConfigNotLoadedError` (500 CRITICAL)
 * if not loaded yet — the error handler serializes it as RFC7807 with
 * `severity: "CRITICAL"` so the FE shows a critical toast. Does NOT use 503
 * (the FE's 503 interceptor would trigger a misleading "DB OFFLINE" badge).
 * Does NOT touch the DB on the hot path.
 */
export async function getAuthConfig(): Promise<AuthConfig> {
  if (!cached) {
    throw new AuthConfigNotLoadedError(
      "Auth configuration is not loaded. The database may be unavailable or the 'auth_configurations' table is missing mandatory rows (auth_mode, auth_roles_path). Check the backend startup logs for details.",
      { internal_code: "AUTH_CONFIG_NOT_LOADED" }
    );
  }
  return cached;
}

/** Invalidate the cache so the next loadAuthConfig() re-reads from DB. */
export function invalidateAuthConfig(): void {
  cached = null;
}

/** Test helper alias (backward compat). */
export const resetAuthConfigForTest = invalidateAuthConfig;
