/**
 * OIDC client singleton — performs discovery against the configured IDP and
 * exposes a `verifyAccessToken()` function that:
 *   - downloads & caches the JWKS automatically (`jose.createRemoteJWKSet`),
 *   - verifies the JWT signature, expiration, issuer and (optionally) audience,
 *   - returns the decoded payload as `JwtClaims`.
 *
 * Discovery endpoint used:
 *   <issuerUrl>/.well-known/openid-configuration
 *
 * The function is IDP-agnostic on purpose: replacing Casdoor with Keycloak /
 * Microsoft Entra / Auth0 only requires changing `OIDC_ISSUER_URL` (and
 * possibly `AUTH_ROLES_PATH`).
 */

import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyOptions,
  type JWTVerifyResult,
} from "jose";
import { getAuthConfig, type OidcConfig } from "./config.js";
import type { JwtClaims } from "./token-normalizer.js";

interface DiscoveryDocument {
  issuer: string;
  jwks_uri: string;
  // ... other fields exist but we only use what we need.
}

interface OidcRuntime {
  /** Discovery document fetched from `<issuer>/.well-known/openid-configuration`. */
  discovery: DiscoveryDocument;
  /** Cached JWKS resolver (jose handles its own internal caching + refresh). */
  jwks: ReturnType<typeof createRemoteJWKSet>;
}

let runtimePromise: Promise<OidcRuntime> | null = null;

/**
 * Resolve discovery + JWKS once and reuse forever (lazy singleton).
 * `jose.createRemoteJWKSet` itself caches keys with HTTP cache semantics, so
 * we don't need to do anything else.
 */
async function getRuntime(): Promise<OidcRuntime> {
  if (runtimePromise) return runtimePromise;

  runtimePromise = (async (): Promise<OidcRuntime> => {
    const cfg = (await getAuthConfig()).oidc;
    if (!cfg.issuer_url) {
      throw new Error("[auth] oidc_issuer_url is required to verify access tokens");
    }
    const discoveryUrl = `${cfg.issuer_url.replace(/\/+$/, "")}/.well-known/openid-configuration`;
    const res = await fetch(discoveryUrl);
    if (!res.ok) {
      throw new Error(
        `[auth] OIDC discovery failed: GET ${discoveryUrl} → HTTP ${res.status}`
      );
    }
    const discovery = (await res.json()) as DiscoveryDocument;
    if (!discovery.jwks_uri) {
      throw new Error(`[auth] OIDC discovery document missing 'jwks_uri'`);
    }
    const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
    return { discovery, jwks };
  })();

  // If discovery fails, drop the cached promise so the next request can retry.
  runtimePromise.catch(() => {
    runtimePromise = null;
  });

  return runtimePromise;
}

export interface VerifiedToken {
  payload: JwtClaims;
  raw: JWTVerifyResult<JWTPayload>;
}

/**
 * Verify a Bearer access token against the configured IDP.
 *
 * Validations performed:
 *   - JWT signature (via JWKS published by the IDP)
 *   - `exp` (not expired) and `nbf` (not used before)
 *   - `iss` matches the configured issuer
 *   - `aud` matches `OIDC_AUDIENCE` if configured (otherwise ignored)
 *
 * Throws on any failure. Callers should catch and translate to 401.
 *
 * @param pool Optional database pool to load OIDC configuration from database
 */
export async function verifyAccessToken(token: string): Promise<VerifiedToken> {
  const { discovery, jwks } = await getRuntime();
  const cfg: OidcConfig = (await getAuthConfig()).oidc;

  const verifyOpts: JWTVerifyOptions = {
    issuer: discovery.issuer,
  };
  if (cfg.audience) verifyOpts.audience = cfg.audience;

  const result = await jwtVerify(token, jwks, verifyOpts);
  return {
    payload: result.payload as JwtClaims,
    raw: result,
  };
}

/** Test helper: drop the cached runtime so a new discovery happens. */
export function resetOidcRuntimeForTest(): void {
  runtimePromise = null;
}
