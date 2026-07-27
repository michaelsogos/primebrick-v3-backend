/**
 * Step-up MFA middleware.
 *
 * Protects sensitive endpoints by requiring a fresh MFA verification.
 * The client must first call POST /api/v1/auth/mfa/step-up/initiate +
 * POST /api/v1/auth/mfa/step-up/verify to obtain an action authorization
 * token, then send it in the `X-MFA-Action-Authorization` header when
 * calling the protected endpoint.
 *
 * Usage:
 *   import { requireMfaStepUp } from "./mfa-step-up.middleware.js";
 *   router.delete(
 *     "/api/v1/organizations/:uuid",
 *     requireMfaStepUp("delete", "organizations"),
 *     handler,
 *   );
 *
 * The middleware validates + consumes the action authorization token
 * (single-use). If the token is missing, invalid, expired, or already
 * used, it returns 403 with `mfa_step_up_required: true` (in `extra`)
 * so the FE can trigger the step-up flow.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getPool } from "../../db/pool.js";
import { CasdoorService } from "./services/casdoor.service.js";
import { MfaService } from "./services/mfa.service.js";
import { ApiError } from "../../http/api-errors.js";

const HEADER_NAME = "x-mfa-action-authorization";

/**
 * Express middleware that requires a valid step-up MFA action authorization
 * token for the given action + target resource.
 *
 * On success, calls next(). On failure, throws an ApiError with
 * `mfa_step_up_required: true` (in `extra`) so the FE can detect it and
 * trigger the step-up flow.
 */
export function requireMfaStepUp(
  action: string,
  targetResource: string,
): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers[HEADER_NAME] as string | undefined;
    if (!token) {
      throw new ApiError(
        "/errors/mfa-step-up-required",
        "MFA step-up verification required",
        403,
        "This action requires MFA step-up verification. Call POST /api/v1/auth/mfa/step-up/initiate first.",
        {
          internal_code: "MFA_STEP_UP_REQUIRED",
          severity: "MEDIUM",
          extra: {
            mfa_step_up_required: true,
            action,
            target_resource: targetResource,
          },
        },
      );
    }

    const pool = getPool();
    const casdoor = new CasdoorService(pool);
    const mfaService = new MfaService(pool, casdoor);

    try {
      await mfaService.consumeActionAuthorization(token, action, targetResource);
      next();
    } catch (err) {
      // Re-throw with mfa_step_up_required flag so the FE can detect it
      if (err instanceof ApiError) {
        throw new ApiError(
          err.instance || "/errors/mfa-step-up-invalid",
          err.title || "MFA step-up verification failed",
          403,
          err.detail || "The MFA action authorization token is invalid, expired, or already used.",
          {
            internal_code: err.internal_code || "MFA_STEP_UP_INVALID",
            severity: "MEDIUM",
            extra: {
              mfa_step_up_required: true,
              action,
              target_resource: targetResource,
            },
          },
        );
      }
      throw err;
    }
  };
}
