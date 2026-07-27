/**
 * Route permission declaration & enforcement.
 *
 * Each protected route MUST attach a handler produced by `rbacHandler(...)` to
 * declare the permissions it requires. The handler orchestrates, in order:
 *
 *   1. **Gateway authentication** (only when `AUTH_MODE=GATEWAY`)
 *      Validates the configured gateway-secret header. The header / value used
 *      depend on whether the route is `PUBLIC` (uses `publicSecret` /
 *      `publicSecretHeaderName`) or authenticated (uses `secret` /
 *      `secretHeaderName`). This step also applies to PUBLIC routes — a proxy
 *      sitting in front of us must always identify itself.
 *
 *   2. **User authentication** (only when the declaration is NOT `PUBLIC`)
 *      Delegates to `authMiddleware` to verify the Bearer JWT (STANDALONE) or
 *      to read trusted user-identity headers (GATEWAY). Populates `req.user`
 *      and a Session in `AsyncLocalStorage`.
 *
 *   3. **RBAC check** (only when the declaration is NOT `PUBLIC` /
 *      `AUTHENTICATED_USER` / `AUTHENTICATED_ADMIN`)
 *      Evaluates `req.user.permissions` against the declared permissions using
 *      the SDK's `checkRbac()` function. Default semantics is **OR** (any-of):
 *      the user passes if they hold AT LEAST ONE of the permissions in the
 *      array. Use `rbacHandler.all([...])` for AND semantics.
 *
 * Sentinels:
 *   - `Permission.PUBLIC`             → endpoint reachable anonymously.
 *   - `Permission.AUTHENTICATED_USER` → any caller with a valid identity passes.
 *   - `Permission.AUTHENTICATED_ADMIN`→ only callers with `isAdmin === true` pass.
 *
 * Admin bypass: `req.user.isAdmin` skips all permission checks (handled by SDK checkRbac).
 * System bypass: `req.user.isSystem` skips all permission checks (system API keys).
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../../http/api-errors.js";
import { getAuthConfig, AuthMode } from "@primebrick/sdk";
import {
  Permission,
  isPermissionSentinel,
  checkRbac,
} from "@primebrick/sdk";
import { authMiddleware } from "./auth.middleware.js";

/** Internal marker injected on every handler returned by `rbacHandler(...)`. */
export const PERMISSION_DECLARED = Symbol.for("primebrick.rbac.permissionDeclared");

interface PermissionDeclaration {
  /** The permissions array as declared by the route. */
  declared: readonly string[];
  /** Evaluation mode: `"any"` for OR (default) / `"all"` for AND. */
  mode: "any" | "all";
}

export type DeclaredHandler = RequestHandler & {
  [PERMISSION_DECLARED]: PermissionDeclaration;
};

type RbacFactory = {
  /**
   * Declare an OR group of permissions. The user passes if they hold at least
   * one of them. Single-permission arrays behave the same in OR and AND.
   */
  (perms: readonly string[]): DeclaredHandler;
  /** Declare an AND group of permissions. The user must hold all of them. */
  all(perms: readonly string[]): DeclaredHandler;
};

function build(perms: readonly string[], mode: "any" | "all"): DeclaredHandler {
  if (!Array.isArray(perms) || perms.length === 0) {
    throw new Error(
      "[rbac] rbacHandler() requires a non-empty permission array. " +
        "Use [Permission.PUBLIC] for anonymous endpoints."
    );
  }

  const isPublic = perms.includes(Permission.PUBLIC);
  const isAuthenticatedOnly = perms.includes(Permission.AUTHENTICATED_USER);
  const isAdminOnly = perms.includes(Permission.AUTHENTICATED_ADMIN);

  // Sanity: sentinels (PUBLIC, AUTHENTICATED_USER, AUTHENTICATED_ADMIN) must
  // appear alone. Combining a sentinel with CRUD perms is semantically
  // meaningless and hides intent.
  if ((isPublic || isAuthenticatedOnly || isAdminOnly) && perms.length > 1) {
    throw new Error(
      "[rbac] PUBLIC, AUTHENTICATED_USER and AUTHENTICATED_ADMIN are sentinels; " +
        "they must be the ONLY element of the permission array."
    );
  }

  const handler: RequestHandler = async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cfg = await getAuthConfig();

      // --- Step 1: gateway-secret check (ALWAYS in GATEWAY mode) ----------
      if (cfg.mode === AuthMode.GATEWAY) {
        const headerName = isPublic
          ? cfg.gateway.public_secret_header_name!
          : cfg.gateway.secret_header_name!;
        const expected = isPublic ? cfg.gateway.public_secret : cfg.gateway.secret;
        const provided = req.headers[headerName!];
        if (typeof provided !== "string" || provided !== expected) {
          throw new UnauthorizedError("Gateway authentication failed", {
            internal_code: "AUTH_GATEWAY_SECRET_INVALID",
          });
        }
      }

      // --- Step 2: user authentication (skipped for PUBLIC) ----------------
      if (isPublic) {
        next();
        return;
      }

      // Delegate to authMiddleware: it populates req.user + AsyncLocalStorage.
      authMiddleware()(req, _res, (err) => {
        if (err) {
          next(err);
          return;
        }

        // --- Step 3: RBAC check (using SDK checkRbac) -------------------
        if (!req.user) {
          next(
            new UnauthorizedError("Authenticated user context not available", {
              internal_code: "AUTH_USER_CONTEXT_MISSING",
            })
          );
          return;
        }

        if (isAuthenticatedOnly) {
          next();
          return;
        }

        // AUTHENTICATED_ADMIN short-circuit — admin-only gate.
        // The BE is the authoritative security gate: even if the FE fails to
        // hide the menu item, the API returns 403 for non-admins.
        // System API keys (isSystem === true) bypass all permission checks.
        if (isAdminOnly) {
          if (req.user?.isAdmin === true || req.user?.isSystem === true) {
            next();
            return;
          }
          next(
            new UnauthorizedError("Admin privileges required to perform this action", {
              internal_code: "RBAC_ADMIN_ONLY",
              extra: {
                issues: [
                  {
                    kind: "missing_admin",
                    required: [Permission.AUTHENTICATED_ADMIN],
                    user_roles: req.user!.roles,
                  },
                ],
              },
            })
          );
          return;
        }

        // Use SDK's checkRbac — handles admin bypass, system bypass, sentinels, wildcards
        const result = checkRbac(req.user, perms, mode);
        if (!result.allowed) {
          const realPerms = perms.filter((p) => !isPermissionSentinel(p));
          next(
            new UnauthorizedError("Insufficient permissions to perform this action", {
              internal_code: "RBAC_PERMISSION_DENIED",
              extra: {
                issues: [
                  {
                    kind: mode === "all" ? "missing_permissions" : "missing_any_of_permissions",
                    required: realPerms,
                    missing: result.missing || [],
                    mode,
                    user_roles: req.user!.roles,
                  },
                ],
              },
            })
          );
          return;
        }

        next();
      });
    } catch (err) {
      next(err);
    }
  };

  // Tag the handler so `makeProtectedRouter()` can detect declared routes.
  Object.defineProperty(handler, PERMISSION_DECLARED, {
    value: { declared: [...perms], mode } satisfies PermissionDeclaration,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return handler as DeclaredHandler;
}

const factory = ((perms: readonly string[]) => build(perms, "any")) as RbacFactory;
factory.all = (perms: readonly string[]) => build(perms, "all");

export const rbacHandler = factory;
