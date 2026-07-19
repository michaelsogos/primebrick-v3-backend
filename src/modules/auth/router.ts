/**
 * Auth router — aggregator for all authentication & user-management endpoints.
 *
 * This file used to be a 1600-line monolith mixing Casdoor OAuth, JWT decode,
 * cookies, user CRUD, raw SQL, avatar generation, validation, and error
 * shaping. It is now a thin aggregator that mounts four specialized routers,
 * each backed by a request-context-free service:
 *
 *   - authSessionRouter  → login / refresh / me / me/meta        (AuthSessionService)
 *   - authCheckRouter    → check-email / check-username           (UserService)
 *   - usersRouter        → POST/PATCH/DELETE /auth/users          (UserService)
 *   - userProfilesRouter → user_profiles entity CRUD surface      (UserService)
 *
 * The public `authRouter()` contract is unchanged: `src/index.ts` still calls
 * `app.use(authRouter())`. All endpoint paths, methods, status codes, and JSON
 * shapes are preserved.
 */

import { Router } from "express";
import { authSessionRouter } from "./routers/auth-session.router.js";
import { authCheckRouter } from "./routers/auth-check.router.js";
import { usersRouter } from "./routers/users.router.js";
import { userProfilesRouter } from "./routers/user-profiles.router.js";
import { authWebauthnRouter } from "./routers/auth-webauthn.router.js";
import { authInvitationRouter } from "./routers/auth-invitation.router.js";
import { roleMappingsRouter } from "./routers/role-mappings.router.js";

export function authRouter() {
  const router = Router();

  // Auth session endpoints (login / refresh / me / me/meta).
  router.use(authSessionRouter());

  // WebAuthn / passkey endpoints (signin / signup / credential management).
  router.use(authWebauthnRouter());

  // Invitation / welcome flow (verify / send-otp / verify-otp / complete / revoke / resend / login-alert).
  router.use(authInvitationRouter());

  // User availability checks (check-email / check-username).
  router.use(authCheckRouter());

  // Admin user management (create / update / delete).
  router.use(usersRouter());

  // user_profiles entity CRUD (meta / list / get / restore / audit / put).
  router.use(userProfilesRouter());

  // Role mappings CRUD (Casdoor-synced, non-best-effort).
  router.use(roleMappingsRouter());

  return router;
}
