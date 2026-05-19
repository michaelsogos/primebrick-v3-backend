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
 * Role-to-permission mapping is loaded from the `role_mappings` table at startup
 * and cached. The middleware expands the user's IDP roles into a set of
 * permissions using this cached mapping. Roles marked with `is_admin=true` grant
 * ALL permissions (super-user wildcard).
 *
 * Errors thrown here are RFC 7807 `UnauthorizedError` instances; the global
 * error handler serializes them.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { UnauthorizedError } from "../../http/api-errors.js";
import { getPool } from "../../db/pool.js";
import { getAuthConfig } from "./config.js";
import { verifyAccessToken } from "./oidc-client.js";
import { buildAuthUser, normalizeIdpToken, coerceRoles } from "./token-normalizer.js";
import { resolveInternalUuid } from "./user-profile-repo.js";
import { runWithSession, type Session } from "./session-context.js";
import type { AuthUser } from "./types.js";
import { RoleMappingRepo } from "./role-mapping-repo.js";
import { expandPermissions, Permission } from "./permissions.js";

// Cached role mappings loaded at startup
let roleMappingCache: Map<string, { permissions: string[]; is_admin: boolean }> | null = null;

/**
 * Load role mappings into memory at startup.
 * This should be called at application startup.
 */
export async function loadRoleMappings(): Promise<void> {
  const pool = getPool();
  const repo = new RoleMappingRepo(pool);
  roleMappingCache = await repo.loadAllMappings();
}

/**
 * Clear the role mapping cache (useful for testing or hot-reload).
 */
export function clearRoleMappingCache(): void {
  roleMappingCache = null;
}

/**
 * Build the route-attachable middleware. We use a factory so the caller can
 * compose `authMiddleware()` once at boot and reuse it across mounts.
 */
export function authMiddleware(): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const pool = getPool();
      const cfg = await getAuthConfig(pool);
      const user: AuthUser =
        cfg.mode === "GATEWAY"
          ? await fromGateway(req, cfg)
          : await fromStandalone(req, cfg, pool);
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

async function fromStandalone(req: Request, cfg: Awaited<ReturnType<typeof getAuthConfig>>, pool: import("pg").Pool): Promise<AuthUser> {
  let token = "";

  // 1. TENTATIVO A: Estrazione dall'header Authorization (Standard per integrazioni esterne)
  const header = req.headers["authorization"];
  if (header && typeof header === "string" && header.toLowerCase().startsWith("bearer ")) {
    token = header.slice(7).trim();
  }

  // 2. TENTATIVO B: Se l'header è vuoto, cerchiamo nel cookie HttpOnly (Standard per il nostro FE Svelte)
  if (!token && req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  // 3. Se non è presente in nessuno dei due posti, blocchiamo la richiesta
  if (!token) {
    throw new UnauthorizedError("Authentication required - please provide a valid token via Bearer header or cookie", {
      internal_code: "AUTH_TOKEN_MISSING",
    });
  }

  let claims;
  try {
    const verified = await verifyAccessToken(token, pool);
    claims = verified.payload;
  } catch (e) {
    // Don't leak crypto / JWKS internals — log server-side, return generic 401.
    console.error("[auth] token verification failed:", (e as Error)?.message);
    throw new UnauthorizedError("Invalid or expired access token", {
      internal_code: "AUTH_TOKEN_INVALID",
    });
  }

  const normalized = normalizeIdpToken(claims, cfg.rolesPath);
  const internalUuid = await resolveInternalUuid({
    idp_code: normalized.idp_code,
    email: normalized.email,
    display_name: normalized.name,
  });
  const { patterns, isAdmin } = await expandPermissions(
    normalized.roles,
    (role) => Promise.resolve(roleMappingCache?.get(role) || null)
  );
  return buildAuthUser(internalUuid, normalized, new Set(patterns), isAdmin);
}

async function fromGateway(req: Request, cfg: Awaited<ReturnType<typeof getAuthConfig>>): Promise<AuthUser> {
  const { secret, secretHeaderName, headers } = cfg.gateway;

  // Anti-spoofing: the gateway and only the gateway knows this value.
  // Without it, the API MUST NOT trust any X-User-* header.
  const provided = req.headers[secretHeaderName];
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
  const { patterns, isAdmin } = await expandPermissions(
    roles,
    (role) => Promise.resolve(roleMappingCache?.get(role) || null)
  );
  return buildAuthUser(internalUuid, {
    idp_code: idpCode,
    email,
    name,
    roles,
  }, new Set(patterns), isAdmin);
}

function readHeaderString(req: Request, name: string): string | null {
  const v = req.headers[name];
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}
