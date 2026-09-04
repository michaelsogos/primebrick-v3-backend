/**
 * Module aggregator — single entry point for mounting all feature routers.
 *
 * `src/index.ts` calls `mountModules(app)` once instead of importing each
 * router individually. This keeps `index.ts` focused on process-level concerns
 * (Express bootstrap, CORS, cookies, error handler) and makes the set of
 * mounted modules scannable in one place.
 *
 * Order matters for route shadowing: `authRouter` (which mounts the
 * auth-session / auth-check / users / user-profiles sub-routers) and the
 * entity routers all use full paths (`/api/v1/...`), so registration order is
 * only significant where two routers could match the same path. The order
 * below preserves the previous registration order from `index.ts`.
 */

import type { Express } from "express";

import { customersRouter } from "./customers/router.js";
import { organizationsRouter } from "./auth/routers/organizations.router.js";
import { systemRouter } from "./system/system-router.js";
import { translationsRouter } from "./system/translations-router.js";
import { authRouter } from "./auth/router.js";
import { proxyRouter } from "./proxy/proxy-router.js";
import { collaborationRouter } from "./collaboration/router.js";

export function mountModules(app: Express): void {
  app.use(customersRouter());
  app.use(organizationsRouter());
  app.use(systemRouter());
  // Translations — central CRUD gateway for all translation schemas.
  app.use(translationsRouter());
  // Auth router (public login endpoint + protected user/organization surface).
  app.use(authRouter());
  // Generic microservice proxy (/ws/:serviceCode/* → microservice /api/*).
  app.use(proxyRouter());
  // Collaboration (presence + entity-changed awareness for shared entities).
  app.use(collaborationRouter());
}
