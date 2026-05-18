/**
 * Authentication middleware — populates `req.user` for every request that
 * passes through it.
 *
 * Two execution paths:
 *
 *   STANDALONE
 *     Reads the `Authorization: Bearer <jwt>` header. The token is verified
 *     against the configured IDP via `openid-client` + JWKS. The decoded
 *     payload is normalized into a Primebrick `AuthUser` and `req.user.id`
 *     is set to our internal UUID (just-in-time provisioned in `user_profiles`).
 *
 *   GATEWAY
 *     Trusts a small set of HTTP headers injected by an upstream API gateway
 *     (Kong / Tyk / APISIX / Envoy / SvelteKit `hooks.server.ts`). To prevent
 *     spoofing in case the API is reached without going through the gateway,
 *     a shared-secret header (`X-Gateway-Secret`) MUST match the configured
 *     `GATEWAY_SECRET`. Mismatch / missing secret → 401.
 *
 * Both paths converge on the same `AuthUser` shape and the same internal-UUID
 * resolution, so downstream code (RBAC checks, DAL, audit columns) is mode-agnostic.
 *
 * Errors thrown here are RFC 7807 `UnauthorizedError` instances; the global
 * error handler serializes them.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { UnauthorizedError } from "../../http/api-errors.js";
import { getAuthConfig } from "./config.js";
import { verifyAccessToken } from "./oidc-client.js";
import { buildAuthUser, normalizeIdpToken, coerceRoles } from "./token-normalizer.js";
import { resolveInternalUuid } from "./user-profile-repo.js";
import { runWithSession, type Session } from "./session-context.js";
import type { AuthUser } from "./types.js";

/**
 * Build the route-attachable middleware. We use a factory so the caller can
 * compose `authMiddleware()` once at boot and reuse it across mounts.
 */
export function authMiddleware(): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const cfg = getAuthConfig();
      const user: AuthUser =
        cfg.mode === "GATEWAY"
          ? await fromGateway(req)
          : await fromStandalone(req);
      req.user = user;
      // Mirror the user into AsyncLocalStorage so DAL / services downstream
      // can call `requireActor()` without receiving the actor through every
      // method signature. The store dies with the request's async chain.
      const session: Session = {
        actor: user.id,
        roles: user.roles,
        idpCode: user.idp_code,
      };
      runWithSession(session, () => next());
    } catch (err) {
      next(err);
    }
  };
}

async function fromStandalone(req: Request): Promise<AuthUser> {
  const header = req.headers["authorization"];
  if (!header || typeof header !== "string" || !header.toLowerCase().startsWith("bearer ")) {
    throw new UnauthorizedError("Missing or malformed Authorization header", {
      internal_code: "AUTH_BEARER_MISSING",
    });
  }
  const token = header.slice(7).trim();
  if (!token) {
    throw new UnauthorizedError("Empty Bearer token", { internal_code: "AUTH_BEARER_EMPTY" });
  }

  let claims;
  try {
    const verified = await verifyAccessToken(token);
    claims = verified.payload;
  } catch (e) {
    // Don't leak crypto / JWKS internals — log server-side, return generic 401.
    console.error("[auth] token verification failed:", (e as Error)?.message);
    throw new UnauthorizedError("Invalid or expired access token", {
      internal_code: "AUTH_TOKEN_INVALID",
    });
  }

  const cfg = getAuthConfig();
  const normalized = normalizeIdpToken(claims, cfg.rolesPath);
  const internalUuid = await resolveInternalUuid({
    idp_code: normalized.idp_code,
    email: normalized.email,
    display_name: normalized.name,
  });
  return buildAuthUser(internalUuid, normalized);
}

async function fromGateway(req: Request): Promise<AuthUser> {
  const cfg = getAuthConfig();
  const { secret, headers } = cfg.gateway;

  // Anti-spoofing: the gateway and only the gateway knows this value.
  // Without it, the API MUST NOT trust any X-User-* header.
  const provided = req.headers["x-gateway-secret"];
  if (typeof provided !== "string" || provided !== secret) {
    throw new UnauthorizedError("Gateway authentication failed", {
      internal_code: "AUTH_GATEWAY_SECRET_INVALID",
    });
  }

  const idpCode = readHeaderString(req, headers.idpCode);
  if (!idpCode) {
    throw new UnauthorizedError(
      `Missing user identity header '${headers.idpCode}' from gateway`,
      { internal_code: "AUTH_GATEWAY_HEADERS_MISSING" }
    );
  }

  const email = readHeaderString(req, headers.email);
  const name = readHeaderString(req, headers.name);
  const rawRoles = readHeaderString(req, headers.roles);
  // The gateway forwards roles as a comma-separated list (CSV).
  // Empty / missing → no roles, which means the user gets only public endpoints.
  const roles = rawRoles
    ? coerceRoles(rawRoles.split(",").map((s) => s.trim()).filter(Boolean))
    : [];

  const internalUuid = await resolveInternalUuid({
    idp_code: idpCode,
    email,
    display_name: name,
  });
  return buildAuthUser(internalUuid, {
    idp_code: idpCode,
    email,
    name,
    roles,
  });
}

function readHeaderString(req: Request, name: string): string | null {
  const v = req.headers[name];
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}
