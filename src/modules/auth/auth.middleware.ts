/**
 * Authentication middleware — populates `req.user` for every request that
 * passes through it.
 *
 * This is a thin Express wrapper around the SDK's verifyAuth() function.
 * The SDK handles JWT verification (STANDALONE mode) or gateway header
 * verification (GATEWAY mode), user resolution, and permission expansion.
 *
 * The BE operates in STANDALONE mode — it receives a raw JWT, verifies it
 * via OIDC discovery, resolves the IDP subject to an internal UUID, and
 * expands roles to permissions. The resulting AuthUser is attached to
 * req.user and mirrored into AsyncLocalStorage for DAL audit fields.
 *
 * For proxy forwarding to microservices, the raw access token is captured
 * on req.rawAccessToken (STANDALONE mode only).
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../../http/api-errors.js";
import { getPool } from "../../db/pool.js";
import {
  verifyAuth,
  getAuthConfig,
  runWithSession,
  type Session,
  type AuthUser,
  type AuthPorts,
  type AuthConfig,
  AuthError,
} from "@primebrick/sdk";
import { HttpHeaderProvider } from "@primebrick/sdk";
import { BeUserResolverPort, BeRoleMappingPort } from "./sdk-auth-ports.js";

// Cached port instances — created once at startup
let userResolverPort: BeUserResolverPort | null = null;
let roleMappingPort: BeRoleMappingPort | null = null;

/**
 * Initialize auth ports. Called once at application startup.
 */
export function initAuthPorts(): void {
  const pool = getPool();
  userResolverPort = new BeUserResolverPort(pool);
  roleMappingPort = new BeRoleMappingPort(pool);
}

/**
 * Load role mappings into memory at startup.
 * This should be called at application startup.
 */
export async function loadRoleMappings(): Promise<void> {
  if (!roleMappingPort) {
    initAuthPorts();
  }
  await roleMappingPort!.loadAllMappings();
}

/**
 * Clear the role mapping cache (useful for testing or hot-reload).
 */
export function clearRoleMappingCache(): void {
  roleMappingPort = null;
}

/**
 * Build the route-attachable middleware. We use a factory so the caller can
 * compose `authMiddleware()` once at boot and reuse it across mounts.
 */
export function authMiddleware(): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fail closed while role mappings are not yet loaded
      if (!roleMappingPort || !userResolverPort) {
        throw new ForbiddenError(
          "Role mappings not loaded yet (database may be unavailable).",
          { internal_code: "AUTH_ROLE_MAPPINGS_NOT_LOADED" }
        );
      }

      const cfg = await getAuthConfig();
      const ports: AuthPorts = {
        resolveInternalUuid: (input) => userResolverPort!.resolveInternalUuid(input),
        getRoleMapping: (role) => roleMappingPort!.getRoleMapping(role),
      };

      const headers = new HttpHeaderProvider(req);

      // For STANDALONE mode, also check the cookie (Express-specific)
      // The SDK's verifyAuth reads from HeaderProvider, which only reads headers.
      // We need to inject the cookie token into the header if the Authorization header is missing.
      if (cfg.mode === "STANDALONE" as const) {
        const authHeader = req.headers["authorization"];
        if (!authHeader && req.cookies?.access_token) {
          // Inject the cookie token as a Bearer header for the SDK to find
          req.headers["authorization"] = `Bearer ${req.cookies.access_token}`;
        }
      }

      let user: AuthUser;
      try {
        user = await verifyAuth(new HttpHeaderProvider(req), cfg, ports);
      } catch (err) {
        if (err instanceof AuthError) {
          throw new UnauthorizedError(err.message, { internal_code: err.internal_code });
        }
        throw err;
      }

      req.user = user;
      // Capture raw access token for proxy forwarding (STANDALONE mode only)
      if (user.raw_access_token) {
        req.rawAccessToken = user.raw_access_token;
      }

      // Mirror the user into AsyncLocalStorage so DAL / services downstream
      // can call `requireActor()` without receiving the actor through every
      // method signature. The store dies with the request's async chain.
      const session: Session = {
        actor: user.id,
        roles: user.roles,
        idpCode: user.idp_code,
        idpOrg: user.idp_org,
        idpUsername: user.idp_username,
      };
      runWithSession(session, () => next());
    } catch (err) {
      next(err);
    }
  };
}
