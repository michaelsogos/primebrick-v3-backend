/**
 * Declarative route registration helper.
 *
 * Lets a controller describe its endpoints as a single scannable table at the
 * top of the file instead of a sequence of `router.<verb>(...)` calls. The
 * helper preserves the secure-first policy enforced by `makeProtectedRouter()`:
 * every route MUST carry a permission declaration produced by `rbacHandler(...)`
 * (or `rbacHandler.all(...)`), otherwise the protected router injects its
 * default-deny handler and the route responds 403 with
 * `ROUTE_PERMISSION_NOT_DECLARED`.
 *
 * Usage:
 *   registerRoutes(router, [
 *     {
 *       method: "get",
 *       path: "/api/v1/entities/customer/meta",
 *       permission: rbacHandler([Permission.CUSTOMERS_READ_ALL, Permission.CUSTOMERS_READ_SINGLE]),
 *       handler: ctrl.getMeta,
 *     },
 *     {
 *       method: "post",
 *       path: "/api/v1/auth/users",
 *       permission: rbacHandler([Permission.USERS_CREATE_SINGLE]),
 *       middlewares: [validateBody(CreateUserSchema)],
 *       handler: ctrl.create,
 *     },
 *   ]);
 */

import type { IRouter, RequestHandler } from "express";
import type { DeclaredHandler } from "../modules/auth/rbac.middleware.js";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface RouteDef {
  /** HTTP verb. */
  method: HttpMethod;
  /** Full route path (e.g. `/api/v1/entities/customer/list`). */
  path: string;
  /** Permission declaration from `rbacHandler([...])` or `rbacHandler.all([...])`. */
  permission: DeclaredHandler;
  /** Optional middleware chain (validation, etc.) inserted between the
   *  permission declaration and the handler. */
  middlewares?: RequestHandler[];
  /** Thin controller handler. Should contain no business logic. */
  handler: RequestHandler;
}

/**
 * Register a list of route definitions on the given router. The router is
 * expected to come from `makeProtectedRouter()` so the declare-first policy
 * stays in effect.
 */
export function registerRoutes(router: IRouter, defs: RouteDef[]): void {
  for (const def of defs) {
    const chain: RequestHandler[] = [def.permission, ...(def.middlewares ?? []), def.handler];
    router[def.method](def.path, ...chain);
  }
}
