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
 *      `AUTHENTICATED_USER`)
 *      Evaluates `req.user.permissions` against the declared permissions.
 *      Default semantics is **OR** (any-of): the user passes if they hold AT
 *      LEAST ONE of the permissions in the array. Use `rbacHandler.all([...])`
 *      for AND semantics.
 *
 * Sentinels:
 *   - `Permission.PUBLIC`             → endpoint reachable anonymously.
 *                                       Auth steps 2 and 3 are skipped. Step 1
 *                                       (gateway secret) still runs.
 *   - `Permission.AUTHENTICATED_USER` → any caller with a valid identity
 *                                       passes regardless of roles. Step 3 is
 *                                       skipped.
 *
 * The returned RequestHandler is tagged with a non-enumerable property so the
 * `makeProtectedRouter()` factory can detect routes that forgot to declare a
 * permission and inject a default-deny handler (secure-first policy).
 *
 * Usage:
 *   router.delete(
 *     "/api/v1/.../:id",
 *     rbacHandler([Permission.CUSTOMERS_DELETE]),
 *     asyncHandler(...)
 *   );
 *
 *   // OR is the default; explicit AND:
 *   router.get(
 *     "/api/v1/...",
 *     rbacHandler.all([Permission.CUSTOMERS_READ_ALL, Permission.MODULES_ADMIN]),
 *     ...
 *   );
 *
 *   // Public:
 *   router.get("/api/v1/health", rbacHandler([Permission.PUBLIC]), ...);
 *
 * Errors thrown:
 *   - `UnauthorizedError` (401) — missing / invalid gateway secret or token
 *   - `ForbiddenError`    (403) — insufficient permissions; missing perms are
 *                                 carried in `extra.issues`.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../../http/api-errors.js";
import { getAuthConfig } from "./config.js";
import { getPool } from "../../db/pool.js";
import { authMiddleware } from "./auth.middleware.js";
import { Permission, isPermissionSentinel, isPermissionGranted } from "./permissions.js";

/** Internal marker injected on every handler returned by `rbacHandler(...)`. */
export const PERMISSION_DECLARED = Symbol.for("primebrick.rbac.permissionDeclared");

interface PermissionDeclaration {
  /** The permissions array as declared by the route. */
  declared: readonly string[];
  /** Evaluation mode: `"any"` for OR (default) / `"all"` for AND. */
  mode: "any" | "all";
}

type DeclaredHandler = RequestHandler & {
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

  // Sanity: PUBLIC and AUTHENTICATED_USER must appear alone.
  if ((isPublic || isAuthenticatedOnly) && perms.length > 1) {
    throw new Error(
      "[rbac] PUBLIC and AUTHENTICATED_USER are sentinels; they must be the " +
        "ONLY element of the permission array."
    );
  }

  const handler: RequestHandler = async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cfg = await getAuthConfig(getPool());

      // --- Step 1: gateway-secret check (ALWAYS in GATEWAY mode) ----------
      if (cfg.mode === "GATEWAY") {
        const headerName = isPublic
          ? cfg.gateway.publicSecretHeaderName
          : cfg.gateway.secretHeaderName;
        const expected = isPublic ? cfg.gateway.publicSecret : cfg.gateway.secret;
        const provided = req.headers[headerName];
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

        // --- Step 3: RBAC check ------------------------------------------
        if (!req.user) {
          // Defensive: authMiddleware should always populate req.user or throw.
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

        // Filter out sentinels (defensive — they shouldn't be mixed but if a
        // future refactor allows it, only the real perms participate in the
        // role-based decision).
        const realPerms = perms.filter((p) => !isPermissionSentinel(p));
        if (realPerms.length === 0) {
          next();
          return;
        }

        // Admin bypass: if user is admin, skip all permission checks
        if (req.user.isAdmin) {
          next();
          return;
        }

        const userPerms = req.user.permissions;
        let passes: boolean;
        if (mode === "all") {
          passes = realPerms.every((p) => isPermissionGranted(userPerms, p));
        } else {
          passes = realPerms.some((p) => isPermissionGranted(userPerms, p));
        }

        if (!passes) {
          const missing =
            mode === "all"
              ? realPerms.filter((p) => !isPermissionGranted(userPerms, p))
              : realPerms; // for OR, none was found
          next(
            new UnauthorizedError("Insufficient permissions to perform this action", {
              internal_code: "RBAC_PERMISSION_DENIED",
              extra: {
                issues: [
                  {
                    kind: mode === "all" ? "missing_permissions" : "missing_any_of_permissions",
                    required: realPerms,
                    missing,
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

export const rbacHandler: RbacFactory = factory;

/** Test helper: extract the declaration from a handler (for unit tests). */
export function getDeclaredPermissions(handler: unknown): PermissionDeclaration | null {
  if (typeof handler !== "function") return null;
  const decl = (handler as unknown as Record<symbol, unknown>)[PERMISSION_DECLARED];
  return decl ? (decl as PermissionDeclaration) : null;
}
