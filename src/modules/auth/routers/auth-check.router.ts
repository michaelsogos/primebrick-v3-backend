/**
 * auth-check.router — thin controller for user availability checks.
 *
 * Endpoints:
 *   GET /api/v1/auth/users/check-email     → is email already in use?
 *   GET /api/v1/auth/users/check-username  → is username taken within an org?
 *
 * The router contains NO business logic; it parses query params, calls
 * `UserService`, and shapes the JSON response. Errors are thrown as `ApiError`
 * subclasses.
 */

import type { RequestHandler } from "express";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { UserProfilesDal } from "../user-profiles-dal.js";
import { CasdoorService } from "../services/casdoor.service.js";
import { UserService } from "../services/user.service.js";
import { ValidationError } from "../../../http/api-errors.js";

function makeUserService(): UserService {
  const pool = getPool();
  const dal = new UserProfilesDal(pool);
  const casdoor = new CasdoorService(pool);
  return new UserService(pool, dal, casdoor);
}

export function authCheckRouter() {
  const router = makeProtectedRouter();
  const service = makeUserService();

  const checkEmail: RequestHandler = asyncHandler(async (req, res) => {
    const email = req.query.email;
    if (!email || typeof email !== "string") {
      throw new ValidationError("email parameter is required", { internal_code: "MISSING_PARAMETER" });
    }
    const result = await service.checkEmailAvailability(email);
    res.json({
      available: result.available,
      email,
      ...(result.existingUuid ? { existing_uuid: result.existingUuid } : {}),
    });
  });

  const checkUsername: RequestHandler = asyncHandler(async (req, res) => {
    const username = req.query.username;
    const idpOrg = req.query.idp_org;
    if (!username || !idpOrg || typeof username !== "string" || typeof idpOrg !== "string") {
      throw new ValidationError("Both username and idp_org are required", {
        internal_code: "MISSING_PARAMETERS",
      });
    }
    const result = await service.checkUsernameAvailability(username, idpOrg);
    res.json({
      available: result.available,
      username,
      idp_org: idpOrg,
      ...(result.existingUuid ? { existing_uuid: result.existingUuid } : {}),
      ...(result.existsInCasdoor ? { exists_in_casdoor: true } : {}),
    });
  });

  registerRoutes(router, [
    {
      method: "get",
      path: "/api/v1/auth/users/check-email",
      permission: rbacHandler([Permission.USERS_READ_ALL]),
      handler: checkEmail,
    },
    {
      method: "get",
      path: "/api/v1/auth/users/check-username",
      permission: rbacHandler([Permission.USERS_READ_ALL]),
      handler: checkUsername,
    },
  ]);

  return router;
}
