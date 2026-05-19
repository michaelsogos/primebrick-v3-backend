/**
 * Secure-first router factory.
 *
 * Wraps an Express `Router` so that any route added without an `rbacHandler`
 * permission declaration is automatically prepended with a `defaultDeny`
 * handler. The result: a route that exists in code but forgot to declare its
 * permission is always served as 403 with a stable RFC 7807 error code,
 * `ROUTE_PERMISSION_NOT_DECLARED`. We never accidentally expose an unprotected
 * endpoint.
 *
 * Detection:
 *   `rbacHandler(...)` tags every handler it returns with the
 *   `PERMISSION_DECLARED` symbol. The factory walks the registered handlers
 *   for each route (flattening nested arrays) and looks for that tag. If
 *   missing, `defaultDenyHandler` is injected as the first handler.
 *
 * Usage:
 *   const router = makeProtectedRouter();
 *   router.get(
 *     "/api/v1/health",
 *     rbacHandler([Permission.PUBLIC]),     // declaration
 *     (_req, res) => res.json({ ok: true }) // actual handler
 *   );
 *
 *   // Forgot to declare → automatic 403:
 *   router.get("/api/v1/whoops", (_req, res) => res.json({ leak: true }));
 */

import { Router, type IRouter, type RequestHandler } from "express";
import { ForbiddenError } from "./api-errors.js";
import { PERMISSION_DECLARED } from "../modules/auth/rbac.middleware.js";

/**
 * Handler attached automatically when no permission was declared on a route.
 * Returns RFC 7807 403 with a stable `internal_code` so monitoring can detect
 * forgotten declarations even in production.
 */
const defaultDenyHandler: RequestHandler = (req, _res, next): void => {
  next(
    new ForbiddenError(
      "This endpoint exists but no permission was registered. " +
        "Refusing to serve under secure-first policy.",
      {
        internal_code: "ROUTE_PERMISSION_NOT_DECLARED",
        extra: {
          issues: [
            {
              kind: "route_missing_permission_declaration",
              method: req.method,
              path: req.originalUrl,
            },
          ],
        },
      }
    )
  );
};

function isPermissionDeclared(handler: unknown): boolean {
  if (typeof handler !== "function") return false;
  return Boolean(
    (handler as unknown as Record<symbol, unknown>)[PERMISSION_DECLARED]
  );
}

function flatten(handlers: unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const h of handlers) {
    if (Array.isArray(h)) out.push(...flatten(h));
    else out.push(h);
  }
  return out;
}

/**
 * Methods we rewrite. We deliberately do NOT touch `use`, `param`, `route`,
 * `all` etc. because they are either middleware-only or rare and we want the
 * declare-first policy enforced where it matters most: HTTP verb endpoints.
 */
const VERBS = ["get", "post", "put", "patch", "delete"] as const;

/**
 * Build an Express `Router` that enforces the declare-first policy for all
 * verb-method registrations. The returned object is a real `Router` (so it
 * can be mounted via `app.use(router)`) with the verb methods proxied.
 */
export function makeProtectedRouter(): IRouter {
  const router = Router();

  for (const verb of VERBS) {
    const original = router[verb].bind(router) as (...args: unknown[]) => IRouter;
    (router as unknown as Record<string, unknown>)[verb] = (
      path: unknown,
      ...handlers: unknown[]
    ): IRouter => {
      const flat = flatten(handlers);
      const declared = flat.some(isPermissionDeclared);
      if (!declared) {
        return original(path, defaultDenyHandler, ...handlers);
      }
      return original(path, ...handlers);
    };
  }

  return router;
}
