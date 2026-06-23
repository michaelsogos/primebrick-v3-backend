/**
 * users.router — thin controller for admin user management.
 *
 * Endpoints:
 *   POST   /api/v1/auth/users        → create user (Casdoor + local)
 *   PATCH  /api/v1/auth/users/:uuid  → update user
 *   DELETE /api/v1/auth/users/:uuid  → soft-delete user
 *
 * The router contains NO business logic: it parses the request, calls
 * `UserService`, and shapes the JSON response. All errors are thrown as
 * `ApiError` subclasses and converted to RFC 7807 by the centralized
 * `errorHandler`.
 */

import type { RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission } from "../permissions.js";
import { getPool } from "../../../db/pool.js";
import { AuditService } from "../../../lib/audit/audit-service.js";
import { UserProfilesDal } from "../user-profiles-dal.js";
import { CasdoorService } from "../services/casdoor.service.js";
import { UserService } from "../services/user.service.js";
import { CreateUserSchema, UpdateUserSchema } from "../dto.js";
import { ValidationError } from "../../../http/api-errors.js";

const UuidSchema = z.string().uuid();

function makeUserService(): UserService {
  const pool = getPool();
  const auditService = new AuditService(pool);
  const dal = new UserProfilesDal(pool, auditService);
  const casdoor = new CasdoorService(pool);
  return new UserService(pool, dal, casdoor);
}

function requireValidUuid(uuid: unknown): string {
  const parsed = UuidSchema.safeParse(uuid);
  if (!parsed.success) {
    throw new ValidationError("User UUID is required and must be a valid UUID", { internal_code: "INVALID_UUID" });
  }
  return parsed.data;
}

export function usersRouter() {
  const router = makeProtectedRouter();
  const service = makeUserService();

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const { profile } = await service.createUser(req.body as z.infer<typeof CreateUserSchema>);
    res.status(201).json({ success: true, profile });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const uuid = requireValidUuid(req.params.uuid);
    const profile = await service.updateUser(uuid, req.body as z.infer<typeof UpdateUserSchema>);
    res.json({ success: true, profile });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    const uuid = requireValidUuid(req.params.uuid);
    await service.deleteUser(uuid);
    res.json({ success: true });
  });

  registerRoutes(router, [
    {
      method: "post",
      path: "/api/v1/auth/users",
      permission: rbacHandler([Permission.USERS_CREATE_SINGLE]),
      middlewares: [validateBody(CreateUserSchema)],
      handler: create,
    },
    {
      method: "patch",
      path: "/api/v1/auth/users/:uuid",
      permission: rbacHandler([Permission.USERS_UPDATE_SINGLE]),
      middlewares: [validateBody(UpdateUserSchema)],
      handler: update,
    },
    {
      method: "delete",
      path: "/api/v1/auth/users/:uuid",
      permission: rbacHandler([Permission.USERS_DELETE_SINGLE]),
      handler: remove,
    },
  ]);

  return router;
}
