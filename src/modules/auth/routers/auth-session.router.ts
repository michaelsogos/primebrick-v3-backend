/**
 * auth-session.router — thin controller for authentication session endpoints.
 *
 * Endpoints:
 *   POST   /api/v1/auth/login    → Casdoor OAuth password grant, sets cookies
 *   POST   /api/v1/auth/refresh  → Casdoor OAuth refresh grant, sets cookies
 *   GET    /api/v1/auth/config   → public auth flags (enable_formauth, enable_webauthn)
 *   PATCH  /api/v1/auth/me       → self-service profile update
 *   GET    /api/v1/auth/me       → fetch own profile
 *   GET    /api/v1/auth/me/meta  → metadata for the self-service profile form
 *
 * The router contains NO business logic. Cookies are set via the
 * `setAuthCookies` / `clearRefreshCookie` helpers (the only place the auth
 * flow touches `res` for cookies). All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 */

import type { RequestHandler, Response } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission, getAuthConfig } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { UserProfilesDal } from "../user-profiles-dal.js";
import { CasdoorService } from "../services/casdoor.service.js";
import { UserService } from "../services/user.service.js";
import {
  AuthSessionService,
  setAuthCookies,
  clearRefreshCookie,
  buildUserFromClaims,
} from "../services/auth-session.service.js";
import { LoginBodySchema, ProfileUpdateSchema, makeChangeOwnPasswordSchema } from "../dto.js";
import { PasswordPolicy, DEFAULT_PASSWORD_POLICY } from "../password-policy.js";
import { UnauthorizedError, ApiError } from "../../../http/api-errors.js";

function makeService(): AuthSessionService {
  const pool = getPool();
  const dal = new UserProfilesDal(pool);
  const casdoor = new CasdoorService(pool);
  return new AuthSessionService(pool, dal, casdoor);
}

function makeUserService(): UserService {
  const pool = getPool();
  const dal = new UserProfilesDal(pool);
  const casdoor = new CasdoorService(pool);
  return new UserService(pool, dal, casdoor);
}

// Schema for self-service password change — requires current_password + newPassword
const ChangeMyPasswordSchema = makeChangeOwnPasswordSchema(DEFAULT_PASSWORD_POLICY);

/** Metadata for the self-service profile form (`GET /api/v1/auth/me/meta`). */
const meMeta = {
  entity: "user_profiles",
  titleKey: "entities.userProfile.title",
  updatePageTitle: "${display_name}",
  uid: "uuid",
  list: {
    columns: [
      { key: "is_admin", labelKey: "entities.userProfile.fields.is_admin", type: "boolean", tooltip: "entities.userProfile.hints.is_admin", tooltipPriority: "WARNING", tooltipTitle: "entities.userProfile.hints.is_admin_title", showFormTooltip: true },
      { key: "is_verified", labelKey: "entities.userProfile.fields.is_verified", type: "boolean", tooltip: "entities.userProfile.hints.is_verified", tooltipPriority: "HINT", tooltipTitle: "entities.userProfile.hints.is_verified_title", showFormTooltip: true },
      { key: "email_verified", labelKey: "entities.userProfile.fields.email_verified", type: "boolean", tooltip: "entities.userProfile.hints.email_verified", tooltipPriority: "HINT", tooltipTitle: "entities.userProfile.hints.email_verified_title", showFormTooltip: true },
    ],
    auditingColumns: [
      { key: "deleted_at", labelKey: "entities.userProfile.fields.deleted_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "deleted_by", labelKey: "entities.userProfile.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "updated_at", labelKey: "entities.userProfile.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "updated_by", labelKey: "entities.userProfile.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "last_synced_at", labelKey: "entities.userProfile.fields.last_synced_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_at", labelKey: "entities.userProfile.fields.created_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_by", labelKey: "entities.userProfile.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "version", labelKey: "entities.userProfile.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
    ],
  },
} as const;

function requireUserId(req: { user?: { id?: string } }): string {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new UnauthorizedError("User ID not found in request", {
      internal_code: "USER_NOT_AUTHENTICATED",
    });
  }
  return userId;
}

export function authSessionRouter() {
  const router = makeProtectedRouter();
  const service = makeService();

  const login: RequestHandler = asyncHandler(async (req, res) => {
    const { tokens, claims } = await service.login(req.body as z.infer<typeof LoginBodySchema>);
    setAuthCookies(res as Response, tokens);
    res.json({ success: true, user: buildUserFromClaims(claims) });
  });

  const refresh: RequestHandler = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refresh_token;
    try {
      const { tokens, claims } = await service.refresh(refreshToken);
      setAuthCookies(res as Response, tokens);
      res.json({ success: true, user: buildUserFromClaims(claims) });
    } catch (err) {
      // Clear invalid refresh token cookie on any auth failure.
      clearRefreshCookie(res as Response);
      throw err;
    }
  });

  const updateMe: RequestHandler = asyncHandler(async (req, res) => {
    const userId = requireUserId(req);
    const { profile } = await service.updateMe(userId, req.body as z.infer<typeof ProfileUpdateSchema>);
    res.json({ success: true, profile });
  });

  const getMe: RequestHandler = asyncHandler(async (req, res) => {
    const userId = requireUserId(req);
    const { profile } = await service.getMe(userId);
    res.json({ success: true, profile });
  });

  const getMeMeta: RequestHandler = asyncHandler(async (_req, res) => {
    res.json(meMeta);
  });

  /**
   * POST /api/v1/auth/me/dismiss-passkey-prompt
   * Dismiss the passkey enrollment prompt for the current user.
   */
  const dismissPasskeyPrompt: RequestHandler = asyncHandler(async (req, res) => {
    const userId = requireUserId(req);
    const result = await service.dismissPasskeyPrompt(userId);
    res.json(result);
  });

  /**
   * POST /api/v1/auth/me/change-password
   * Self-service password change for the authenticated user.
   * Requires the current password for verification (sent to Casdoor).
   * The email notification is sent by UserService.changeOwnPassword().
   */
  const changeMyPassword: RequestHandler = asyncHandler(async (req, res) => {
    const userId = requireUserId(req);
    const { current_password, newPassword } = req.body as z.infer<typeof ChangeMyPasswordSchema>;
    const userService = makeUserService();
    const result = await userService.changeOwnPassword(userId, current_password, newPassword);
    if (result.status !== "ok") {
      throw new ApiError(
        "/errors/internal-error",
        "Password change failed",
        502,
        result.msg || "Casdoor returned an error while changing the password",
        { internal_code: "CASDOOR_CHANGE_PASSWORD_FAILED", severity: "HIGH" },
      );
    }

    res.json({ success: true });
  });

  /**
   * Public auth configuration — returns only the flags the FE needs to decide
   * which login methods to show. No secrets, no endpoint URLs.
   * `GET /api/v1/auth/config`
   */
  const getAuthConfigPublic: RequestHandler = asyncHandler(async (_req, res) => {
    const cfg = getAuthConfig();
    res.json({
      enable_formauth: cfg.enable_formauth,
      enable_webauthn: cfg.enable_webauthn,
    });
  });

  registerRoutes(router, [
    {
      method: "post",
      path: "/api/v1/auth/login",
      permission: rbacHandler([Permission.PUBLIC]),
      middlewares: [validateBody(LoginBodySchema)],
      handler: login,
    },
    {
      method: "post",
      path: "/api/v1/auth/refresh",
      permission: rbacHandler([Permission.PUBLIC]),
      handler: refresh,
    },
    {
      method: "get",
      path: "/api/v1/auth/config",
      permission: rbacHandler([Permission.PUBLIC]),
      handler: getAuthConfigPublic,
    },
    {
      method: "patch",
      path: "/api/v1/auth/me",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateBody(ProfileUpdateSchema)],
      handler: updateMe,
    },
    {
      method: "get",
      path: "/api/v1/auth/me",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: getMe,
    },
    {
      method: "get",
      path: "/api/v1/auth/me/meta",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: getMeMeta,
    },
    {
      method: "post",
      path: "/api/v1/auth/me/dismiss-passkey-prompt",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: dismissPasskeyPrompt,
    },
    {
      method: "post",
      path: "/api/v1/auth/me/change-password",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateBody(ChangeMyPasswordSchema)],
      handler: changeMyPassword,
    },
  ]);

  return router;
}
