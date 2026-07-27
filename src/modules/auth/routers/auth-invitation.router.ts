/**
 * auth-invitation.router — thin controller for the user onboarding/welcome flow.
 *
 * Endpoints:
 *   POST   /api/v1/auth/welcome/verify       → verify invitation token (PUBLIC)
 *   POST   /api/v1/auth/welcome/send-otp     → send OTP to invitation email (PUBLIC)
 *   POST   /api/v1/auth/welcome/verify-otp   → verify OTP code (PUBLIC)
 *   POST   /api/v1/auth/welcome/complete     → set password + complete onboarding (PUBLIC)
 *   POST   /api/v1/auth/invitations/:uuid/revoke  → revoke invitation (ADMIN)
 *   POST   /api/v1/auth/invitations/:uuid/resend  → resend invitation (ADMIN)
 *   GET    /api/v1/auth/login-alert          → process "if this wasn't you" link (PUBLIC)
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 *
 * Security notes:
 *   - Public welcome endpoints return only boolean/flag fields, never the
 *     user's email or other PII.
 *   - The welcome page (FE) sets `Referrer-Policy: no-referrer` and uses
 *     URL fragment (`#token=...`) so the token never leaks via Referer/logs.
 *   - IP rate limiting for public endpoints is configured at the infra level
 *     (see plan note — deferred to final hardening pass).
 */

import type { RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { CasdoorService } from "../services/casdoor.service.js";
import { InvitationService } from "../services/invitation.service.js";

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const VerifyTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const SendOtpSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const VerifyOtpSchema = z.object({
  token: z.string().min(1, "Token is required"),
  otp_code: z.string().length(6, "OTP code must be 6 digits"),
});

const CompleteInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  otp_code: z.string().length(6, "OTP code must be 6 digits"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginAlertSchema = z.object({
  alert_type: z.string().min(1, "Alert type is required"),
  token: z.string().min(1, "Token is required"),
});

// ─── Service factory ─────────────────────────────────────────────────────────

function makeService(): InvitationService {
  const pool = getPool();
  const casdoor = new CasdoorService(pool);
  return new InvitationService(pool, casdoor);
}

// ─── Router ──────────────────────────────────────────────────────────────────

export function authInvitationRouter() {
  const router = makeProtectedRouter();
  const service = makeService();

  // ─── Public welcome endpoints ──────────────────────────────────────────────

  /**
   * POST /api/v1/auth/welcome/verify
   * Verify an invitation token. Returns display_name + expires_at — NEVER email.
   */
  const verifyToken: RequestHandler = asyncHandler(async (req, res) => {
    const { token } = req.body as z.infer<typeof VerifyTokenSchema>;
    const result = await service.verifyToken(token);
    res.json(result);
  });

  /**
   * POST /api/v1/auth/welcome/send-otp
   * Send a 6-digit OTP to the invitation's email address.
   */
  const sendOtp: RequestHandler = asyncHandler(async (req, res) => {
    const { token } = req.body as z.infer<typeof SendOtpSchema>;
    const result = await service.sendOtp(token);
    res.json(result);
  });

  /**
   * POST /api/v1/auth/welcome/verify-otp
   * Verify a 6-digit OTP code.
   */
  const verifyOtp: RequestHandler = asyncHandler(async (req, res) => {
    const { token, otp_code } = req.body as z.infer<typeof VerifyOtpSchema>;
    const result = await service.verifyOtp(token, otp_code);
    res.json(result);
  });

  /**
   * POST /api/v1/auth/welcome/complete
   * Set the user's password in Casdoor + mark invitation COMPLETED.
   * Requires OTP verification first.
   */
  const completeInvitation: RequestHandler = asyncHandler(async (req, res) => {
    const { token, otp_code, new_password } = req.body as z.infer<typeof CompleteInvitationSchema>;
    const result = await service.completeInvitation(token, otp_code, new_password);
    res.json(result);
  });

  // ─── Admin invitation management endpoints ─────────────────────────────────

  /**
   * POST /api/v1/auth/invitations/:uuid/revoke
   * Revoke a pending invitation.
   */
  const revokeInvitation: RequestHandler = asyncHandler(async (req, res) => {
    const uuid = String(req.params.uuid);
    await service.revokeInvitation(uuid);
    res.json({ success: true });
  });

  /**
   * POST /api/v1/auth/invitations/:uuid/resend
   * Resend an invitation — generates a new token and sends a new email.
   */
  const resendInvitation: RequestHandler = asyncHandler(async (req, res) => {
    const uuid = String(req.params.uuid);
    await service.resendInvitation(uuid);
    res.json({ success: true });
  });

  // ─── Public login alert endpoint ───────────────────────────────────────────

  /**
   * POST /api/v1/auth/login-alert
   * Process a "if this wasn't you" link from a notification email.
   * Sends an admin alert email. HMAC-verified.
   */
  const loginAlert: RequestHandler = asyncHandler(async (req, res) => {
    const { alert_type, token } = req.body as z.infer<typeof LoginAlertSchema>;
    await service.processLoginAlert(alert_type, token);
    res.json({ success: true });
  });

  // ─── Route registration ────────────────────────────────────────────────────

  registerRoutes(router, [
    {
      method: "post",
      path: "/api/v1/auth/welcome/verify",
      permission: rbacHandler([Permission.PUBLIC]),
      middlewares: [validateBody(VerifyTokenSchema)],
      handler: verifyToken,
    },
    {
      method: "post",
      path: "/api/v1/auth/welcome/send-otp",
      permission: rbacHandler([Permission.PUBLIC]),
      middlewares: [validateBody(SendOtpSchema)],
      handler: sendOtp,
    },
    {
      method: "post",
      path: "/api/v1/auth/welcome/verify-otp",
      permission: rbacHandler([Permission.PUBLIC]),
      middlewares: [validateBody(VerifyOtpSchema)],
      handler: verifyOtp,
    },
    {
      method: "post",
      path: "/api/v1/auth/welcome/complete",
      permission: rbacHandler([Permission.PUBLIC]),
      middlewares: [validateBody(CompleteInvitationSchema)],
      handler: completeInvitation,
    },
    {
      method: "post",
      path: "/api/v1/auth/invitations/:uuid/revoke",
      permission: rbacHandler([Permission.USERS_UPDATE_SINGLE]),
      handler: revokeInvitation,
    },
    {
      method: "post",
      path: "/api/v1/auth/invitations/:uuid/resend",
      permission: rbacHandler([Permission.USERS_UPDATE_SINGLE]),
      handler: resendInvitation,
    },
    {
      method: "post",
      path: "/api/v1/auth/login-alert",
      permission: rbacHandler([Permission.PUBLIC]),
      middlewares: [validateBody(LoginAlertSchema)],
      handler: loginAlert,
    },
  ]);

  return router;
}
