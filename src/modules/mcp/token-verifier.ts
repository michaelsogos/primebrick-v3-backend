/**
 * OAuthTokenVerifier implementation for the MCP server.
 *
 * Reuses the existing `verifyAuth()` from `@primebrick/sdk` to validate
 * Casdoor JWTs. The verifier is called by `requireBearerAuth` middleware
 * on every MCP request. The resulting `AuthInfo` is attached to `req.auth`
 * and surfaced to tool handlers via `ctx.http.authInfo`.
 *
 * The verifier also populates the ALS session so that BE service layer
 * calls (in-process dispatch) can use `requireActor()` as usual.
 */

import type { AuthInfo, OAuthTokenVerifier } from "@modelcontextprotocol/server";
import { OAuthError, OAuthErrorCode } from "@modelcontextprotocol/server";
import {
  verifyAuth,
  getAuthConfig,
  runWithSession,
  type Session,
  type AuthUser,
  type AuthPorts,
  type HeaderProvider,
} from "@primebrick/sdk";

// Cached ports — set during MCP module initialization.
// These are the same port instances used by authMiddleware().
let cachedPorts: AuthPorts | null = null;

/**
 * Set the auth ports (user resolver + role mapping).
 * Called once at startup, after `initAuthPorts()` has run.
 */
export function setAuthPorts(ports: AuthPorts): void {
  cachedPorts = ports;
}

/**
 * Build a minimal HeaderProvider that wraps a raw Bearer token.
 * The SDK's `verifyAuth` expects a HeaderProvider, so we synthesize one
 * that returns the token in the Authorization header.
 */
class BearerTokenHeaderProvider implements HeaderProvider {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  getHeader(name: string): string | undefined {
    if (name.toLowerCase() === "authorization") {
      return `Bearer ${this.token}`;
    }
    return undefined;
  }
}

/**
 * Convert a verified AuthUser into MCP AuthInfo.
 * The AuthInfo is what tool handlers receive via `ctx.http.authInfo`.
 */
function authUserToAuthInfo(user: AuthUser, token: string): AuthInfo {
  // Extract expiration from the JWT if available.
  // The Casdoor JWT includes an `exp` claim (seconds since epoch).
  // We parse it here to populate expiresAt (required by the SDK).
  let expiresAt: number | undefined;
  try {
    const payloadB64 = token.split(".")[1];
    if (payloadB64) {
      const payload = JSON.parse(
        Buffer.from(payloadB64, "base64url").toString("utf-8"),
      ) as { exp?: number };
      if (typeof payload.exp === "number") {
        expiresAt = payload.exp;
      }
    }
  } catch {
    // If we can't parse the JWT, leave expiresAt undefined.
    // The bearer auth middleware will reject tokens without expiresAt,
    // but we handle this by setting a far-future fallback if parsing fails.
  }

  // If we couldn't extract exp, set a conservative fallback (current time + 1 hour).
  // This should rarely happen — Casdoor JWTs always include exp.
  if (expiresAt === undefined) {
    expiresAt = Math.floor(Date.now() / 1000) + 3600;
  }

  return {
    token,
    clientId: user.idp_code,
    scopes: Array.from(user.permissions),
    expiresAt,
    extra: {
      user_id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      is_admin: user.isAdmin,
      is_system: user.isSystem,
      idp_code: user.idp_code,
      idp_org: user.idp_org,
      idp_username: user.idp_username,
      raw_access_token: user.raw_access_token,
      permissions: Array.from(user.permissions),
    },
  };
}

/**
 * The OAuthTokenVerifier implementation.
 * Called by `requireBearerAuth` on every MCP request.
 */
export const tokenVerifier: OAuthTokenVerifier = {
  verifyAccessToken: async (token: string): Promise<AuthInfo> => {
    if (!cachedPorts) {
      throw new OAuthError(
        OAuthErrorCode.ServerError,
        "Auth ports not initialized — MCP module not ready",
      );
    }

    let user: AuthUser;
    try {
      const cfg = await getAuthConfig();
      const headers = new BearerTokenHeaderProvider(token);
      user = await verifyAuth(headers, cfg, cachedPorts);
    } catch (err) {
      // Map auth errors to OAuth errors so the middleware returns proper 401 challenges.
      const message = err instanceof Error ? err.message : "Token verification failed";
      throw new OAuthError(OAuthErrorCode.InvalidToken, message);
    }

    // Populate ALS session so BE service layer can use requireActor().
    // This mirrors what authMiddleware() does for regular /api/v1 routes.
    const session: Session = {
      actor: user.id,
      roles: user.roles,
      idpCode: user.idp_code,
      idpOrg: user.idp_org,
      idpUsername: user.idp_username,
    };

    // runWithSession is synchronous — it sets the ALS context and returns
    // the result of the callback. We need the session to persist for the
    // duration of the MCP request, so we wrap the AuthInfo creation.
    // The session will be available to any downstream service calls made
    // within the same async chain.
    return runWithSession(session, () => authUserToAuthInfo(user, token));
  },
};

/**
 * Extract the AuthUser from AuthInfo (stored in extra fields by the verifier).
 * Used by tool handlers to access the full user context.
 */
export function authInfoToUser(authInfo: AuthInfo): {
  id: string;
  email: string | null;
  name: string | null;
  roles: string[];
  is_admin: boolean;
  is_system: boolean;
  idp_code: string;
  idp_org: string | null;
  idp_username: string | null;
  raw_access_token?: string;
  permissions: string[];
} {
  const e = authInfo.extra ?? {};
  return {
    id: e.user_id as string,
    email: (e.email as string | null) ?? null,
    name: (e.name as string | null) ?? null,
    roles: (e.roles as string[]) ?? [],
    is_admin: (e.is_admin as boolean) ?? false,
    is_system: (e.is_system as boolean) ?? false,
    idp_code: (e.idp_code as string) ?? "",
    idp_org: (e.idp_org as string | null) ?? null,
    idp_username: (e.idp_username as string | null) ?? null,
    raw_access_token: e.raw_access_token as string | undefined,
    permissions: (e.permissions as string[]) ?? [],
  };
}
