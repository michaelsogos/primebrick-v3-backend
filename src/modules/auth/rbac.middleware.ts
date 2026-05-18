/**
 * RBAC middleware factory.
 *
 * Endpoints declare the permissions they require, NOT the roles. Roles are an
 * implementation detail of the IDP / authorization design and are mapped to
 * permissions in `permissions.ts`. This keeps endpoints stable while role
 * compositions evolve.
 *
 * Usage:
 *   router.delete(
 *     "/api/v1/.../:id",
 *     rbacHandler([Permission.CUSTOMERS_DELETE]),
 *     asyncHandler(...)
 *   );
 *
 *   // OR semantics (any-of):
 *   router.get(
 *     "/api/v1/some-resource",
 *     rbacHandler.any([Permission.CUSTOMERS_LIST, Permission.CUSTOMERS_READ]),
 *     ...
 *   );
 *
 * On failure the middleware throws:
 *   - `UnauthorizedError` (401) if `req.user` is missing — typically means the
 *     route was mounted before `authMiddleware()`.
 *   - `ForbiddenError`    (403) when the user is authenticated but missing
 *     one or more required permissions. The missing permissions are
 *     surfaced via `extra.issues` for diagnostics (and so the FE can hide
 *     UI affordances).
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../../http/api-errors.js";
import type { Permission } from "./permissions.js";

type RbacFactory = {
  /** Require ALL listed permissions (logical AND). */
  (required: readonly Permission[]): RequestHandler;
  /** Require ANY of the listed permissions (logical OR). */
  any(required: readonly Permission[]): RequestHandler;
};

function createAllOf(required: readonly Permission[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(
        new UnauthorizedError("Authenticated user context not available on this route", {
          internal_code: "AUTH_USER_CONTEXT_MISSING",
        })
      );
      return;
    }
    const missing = required.filter((p) => !req.user!.permissions.has(p));
    if (missing.length > 0) {
      next(
        new ForbiddenError("Insufficient permissions to perform this action", {
          internal_code: "RBAC_PERMISSION_DENIED",
          extra: {
            issues: [
              {
                kind: "missing_permissions",
                required: [...required],
                missing,
                user_roles: req.user.roles,
              },
            ],
          },
        })
      );
      return;
    }
    next();
  };
}

function createAnyOf(required: readonly Permission[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(
        new UnauthorizedError("Authenticated user context not available on this route", {
          internal_code: "AUTH_USER_CONTEXT_MISSING",
        })
      );
      return;
    }
    const has = required.some((p) => req.user!.permissions.has(p));
    if (!has) {
      next(
        new ForbiddenError("Insufficient permissions to perform this action", {
          internal_code: "RBAC_PERMISSION_DENIED",
          extra: {
            issues: [
              {
                kind: "missing_any_of_permissions",
                any_of: [...required],
                user_roles: req.user.roles,
              },
            ],
          },
        })
      );
      return;
    }
    next();
  };
}

const factory = createAllOf as RbacFactory;
factory.any = createAnyOf;

export const rbacHandler: RbacFactory = factory;
