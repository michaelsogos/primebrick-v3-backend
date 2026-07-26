/**
 * auth-mfa.router — thin controller for MFA / 2FA (TOTP) endpoints.
 *
 * Endpoints:
 *   POST   /api/v1/auth/mfa/enroll/begin    → start TOTP enrollment (AUTHENTICATED_USER)
 *   POST   /api/v1/auth/mfa/enroll/finish   → complete TOTP enrollment (AUTHENTICATED_USER)
 *   GET    /api/v1/auth/mfa/factors         → list enrolled MFA factors (AUTHENTICATED_USER)
 *   DELETE /api/v1/auth/mfa/factors/:uuid   → remove an MFA factor (AUTHENTICATED_USER)
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 */

import type { RequestHandler, Response } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { CasdoorService } from "../services/casdoor.service.js";
import { MfaService } from "../services/mfa.service.js";
import {
  MfaEnrollFinishSchema,
  MfaLoginVerifySchema,
  MfaStepUpInitiateSchema,
  MfaStepUpVerifySchema,
} from "../dto.js";
import { UnauthorizedError } from "../../../http/api-errors.js";
import { setAuthCookies } from "../services/auth-session.service.js";
import { buildUserFromClaims } from "../services/auth-session.service.js";

function makeService(): MfaService {
  const pool = getPool();
  const casdoor = new CasdoorService(pool);
  return new MfaService(pool, casdoor);
}

/** Require an authenticated user and return their UUID (user_profiles.uuid). */
function requireUserUuid(req: import("express").Request): string {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new UnauthorizedError("User ID not found in request", {
      internal_code: "USER_NOT_AUTHENTICATED",
    });
  }
  return userId;
}

const FactorUuidParamSchema = z.object({
  uuid: z.string().min(1),
});

export function authMfaRouter() {
  const router = makeProtectedRouter();
  const service = makeService();

  const enrollBegin: RequestHandler = asyncHandler(async (req, res) => {
    const userUuid = requireUserUuid(req);
    const result = await service.enrollBegin(userUuid);
    res.json({ success: true, ...result });
  });

  const enrollFinish: RequestHandler = asyncHandler(async (req, res) => {
    const userUuid = requireUserUuid(req);
    const body = req.body as z.infer<typeof MfaEnrollFinishSchema>;
    const result = await service.enrollFinish(
      userUuid,
      body.enrollment_token,
      body.passcode,
      body.label,
    );
    res.json(result);
  });

  const listFactors: RequestHandler = asyncHandler(async (req, res) => {
    const userUuid = requireUserUuid(req);
    const factors = await service.listFactors(userUuid);
    res.json({ success: true, factors });
  });

  const deleteFactor: RequestHandler = asyncHandler(async (req, res) => {
    const userUuid = requireUserUuid(req);
    const params = FactorUuidParamSchema.parse(req.params);
    const result = await service.deleteFactor(userUuid, params.uuid);
    res.json(result);
  });

  /**
   * POST /api/v1/auth/mfa/verify — complete login MFA challenge.
   * PUBLIC (challenge-token gated, not session-gated). The user is not
   * authenticated yet — they just entered their password and got mfa_required.
   * On success, sets auth cookies (the Casdoor tokens were stashed server-side).
   */
  const verifyLogin: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof MfaLoginVerifySchema>;
    const result = await service.verifyAtLogin(
      body.mfa_challenge_token,
      body.factor_id,
      body.code,
    );
    setAuthCookies(res as Response, result.tokens);
    res.json({ success: true, user: buildUserFromClaims(result.claims as Record<string, any>) });
  });

  /**
   * POST /api/v1/auth/mfa/step-up/initiate — start a step-up MFA challenge.
   * Session-gated (requires authenticated user). Returns a challenge token +
   * available factors. The FE presents the TOTP input, then calls step-up/verify.
   */
  const stepUpInitiate: RequestHandler = asyncHandler(async (req, res) => {
    const userUuid = requireUserUuid(req);
    const body = req.body as z.infer<typeof MfaStepUpInitiateSchema>;
    const result = await service.mintStepUpChallenge(
      userUuid,
      body.action,
      body.target_resource,
    );
    res.json({
      success: true,
      mfa_challenge_token: result.mfa_challenge_token,
      available_factors: result.available_factors,
    });
  });

  /**
   * POST /api/v1/auth/mfa/step-up/verify — verify a step-up MFA challenge.
   * Session-gated. On success, returns a single-use action authorization token.
   * The FE must send this token in the X-MFA-Action-Authorization header when
   * calling the protected endpoint.
   */
  const stepUpVerify: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof MfaStepUpVerifySchema>;
    const result = await service.verifyStepUp(
      body.mfa_challenge_token,
      body.factor_id,
      body.code,
    );
    res.json({
      success: true,
      action_authorization_token: result.action_authorization_token,
      action: result.action,
      target_resource: result.target_resource,
    });
  });

  registerRoutes(router, [
    {
      method: "post",
      path: "/api/v1/auth/mfa/enroll/begin",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: enrollBegin,
    },
    {
      method: "post",
      path: "/api/v1/auth/mfa/enroll/finish",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateBody(MfaEnrollFinishSchema)],
      handler: enrollFinish,
    },
    {
      method: "get",
      path: "/api/v1/auth/mfa/factors",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: listFactors,
    },
    {
      method: "delete",
      path: "/api/v1/auth/mfa/factors/:uuid",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      handler: deleteFactor,
    },
    {
      method: "post",
      path: "/api/v1/auth/mfa/verify",
      permission: rbacHandler([Permission.PUBLIC]),
      middlewares: [validateBody(MfaLoginVerifySchema)],
      handler: verifyLogin,
    },
    {
      method: "post",
      path: "/api/v1/auth/mfa/step-up/initiate",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateBody(MfaStepUpInitiateSchema)],
      handler: stepUpInitiate,
    },
    {
      method: "post",
      path: "/api/v1/auth/mfa/step-up/verify",
      permission: rbacHandler([Permission.AUTHENTICATED_USER]),
      middlewares: [validateBody(MfaStepUpVerifySchema)],
      handler: stepUpVerify,
    },
  ]);

  return router;
}
