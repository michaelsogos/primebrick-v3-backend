/**
 * Auth configuration loaded once at boot from environment variables and database.
 *
 * Two operating modes are supported, mutually exclusive:
 *
 *   - STANDALONE: the API itself validates the Bearer token against the IDP via
 *                 OIDC discovery (`openid-client`). This is the default for dev
 *                 and direct-exposure deployments.
 *
 *   - GATEWAY:    a trusted reverse proxy (Kong / Tyk / APISIX / Envoy) sits in
 *                 front of the API, validates the token itself and forwards
 *                 user identity via custom HTTP headers. The API then verifies
 *                 a shared secret header (`X-Gateway-Secret`) to defend against
 *                 spoofing of the user headers, and trusts the headers contents.
 *
 * IMPORTANT: there is intentionally NO `DISABLED` mode. Either the upstream
 * passes us a token / verified user headers, or the request is rejected with 401.
 * Internal jobs that need to write to the DAL may pass the literal string
 * `"system"` as the actor; this is a fallback restricted to non-HTTP code paths.
 */

import { Pool } from "pg";
import { loadAuthConfigFromDb, type AuthConfigDb } from "./config-repo.js";

export type AuthMode = "STANDALONE" | "GATEWAY";

export interface OidcConfig {
  /** Issuer URL used for OIDC discovery (e.g. http://localhost:8000). */
  issuerUrl: string;
  /** OIDC client_id registered on the IDP (Casdoor application name). */
  clientId: string;
  /** OIDC client_secret. Required for token introspection / confidential flows. */
  clientSecret: string;
  /** Expected `aud` claim. Optional — when set, tokens with mismatched audience are rejected. */
  audience?: string;
  /** IDP type (casdoor, keycloak, auth0, etc.). Default: casdoor */
  issuerType: string;
}

export interface GatewayConfig {
  /**
   * Shared secret the gateway MUST send to authenticate ITSELF (anti-spoofing).
   * Required in GATEWAY mode for every authenticated route.
   */
  secret: string;
  /** HTTP header that carries the gateway secret. Default `x-gateway-secret`. */
  secretHeaderName: string;
  /**
   * Optional separate secret used for `Permission.PUBLIC` routes. Lets ops
   * issue a less-privileged token to the gateway specifically for
   * unauthenticated traffic, or rotate it independently. When unset, falls
   * back to `secret`.
   */
  publicSecret: string;
  /** Header that carries the public-route gateway secret. Default = `secretHeaderName`. */
  publicSecretHeaderName: string;
  /** Header names from which user identity is read. Configurable so we can adapt to different gateways. */
  headers: {
    userId: string;     // default: x-user-id
    email: string;      // default: x-user-email
    name: string;       // default: x-user-name
    roles: string;      // default: x-user-roles (CSV)
    idpCode: string;    // default: x-user-idp-code (original sub)
  };
}

export interface AuthConfig {
  mode: AuthMode;
  /**
   * Path expression used to extract the roles array from a JWT payload.
   * Examples:
   *   "roles"               (Casdoor default, Microsoft Entra)
   *   "realm_access.roles"  (Keycloak realm roles)
   *   "resource_access.<client>.roles" (Keycloak client roles)
   */
  rolesPath: string;
  oidc: OidcConfig;
  gateway: GatewayConfig;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`[auth] Missing required environment variable: ${name}`);
  }
  return v;
}

let cached: AuthConfig | null = null;

export async function getAuthConfig(pool?: Pool): Promise<AuthConfig> {
  if (cached) return cached;

  const rawMode = (process.env.AUTH_MODE ?? "STANDALONE").toUpperCase();
  if (rawMode !== "STANDALONE" && rawMode !== "GATEWAY") {
    throw new Error(`[auth] AUTH_MODE must be "STANDALONE" or "GATEWAY", got: ${rawMode}`);
  }
  const mode = rawMode as AuthMode;

  // Load configuration from database if pool is provided
  let dbConfig: AuthConfigDb | null = null;
  if (pool) {
    try {
      dbConfig = await loadAuthConfigFromDb(pool);
    } catch (error) {
      console.warn("[auth] Could not load configuration from database, falling back to environment variables:", error);
    }
  }

  // STANDALONE requires real OIDC config; GATEWAY still allows OIDC config to be
  // present (useful for occasional offline tooling), but does not require it.
  const oidc: OidcConfig = {
    issuerUrl: mode === "STANDALONE"
      ? (dbConfig?.oidcIssuerUrl ?? process.env.OIDC_ISSUER_URL ?? "")
      : (dbConfig?.oidcIssuerUrl ?? process.env.OIDC_ISSUER_URL ?? ""),
    clientId: mode === "STANDALONE"
      ? (dbConfig?.oidcClientId ?? process.env.OIDC_CLIENT_ID ?? "")
      : (dbConfig?.oidcClientId ?? process.env.OIDC_CLIENT_ID ?? ""),
    clientSecret: mode === "STANDALONE"
      ? (dbConfig?.oidcClientSecret ?? process.env.OIDC_CLIENT_SECRET ?? "")
      : (dbConfig?.oidcClientSecret ?? process.env.OIDC_CLIENT_SECRET ?? ""),
    audience: process.env.OIDC_AUDIENCE,
    issuerType: dbConfig?.oidcIssuerType ?? process.env.OIDC_ISSUER_TYPE ?? "casdoor",
  };

  const secret = mode === "GATEWAY" ? requireEnv("GATEWAY_SECRET") : (process.env.GATEWAY_SECRET ?? "");
  const secretHeaderName = (process.env.GATEWAY_SECRET_HEADER ?? "x-gateway-secret").toLowerCase();
  const gateway: GatewayConfig = {
    secret,
    secretHeaderName,
    // Public-route secret defaults to the main one. Ops can override either
    // value or header name to use a separate credential for anonymous traffic.
    publicSecret: process.env.GATEWAY_PUBLIC_SECRET ?? secret,
    publicSecretHeaderName: (
      process.env.GATEWAY_PUBLIC_SECRET_HEADER ?? secretHeaderName
    ).toLowerCase(),
    headers: {
      userId: (process.env.GATEWAY_HEADER_USER_ID ?? "x-user-id").toLowerCase(),
      email: (process.env.GATEWAY_HEADER_EMAIL ?? "x-user-email").toLowerCase(),
      name: (process.env.GATEWAY_HEADER_NAME ?? "x-user-name").toLowerCase(),
      roles: (process.env.GATEWAY_HEADER_ROLES ?? "x-user-roles").toLowerCase(),
      idpCode: (process.env.GATEWAY_HEADER_IDP_CODE ?? "x-user-idp-code").toLowerCase(),
    },
  };

  cached = {
    mode,
    rolesPath: process.env.AUTH_ROLES_PATH ?? "roles",
    oidc,
    gateway,
  };
  return cached;
}

/** Test helper: clear cache so a fresh `getAuthConfig()` re-reads env. */
export function resetAuthConfigForTest(): void {
  cached = null;
}
