/**
 * user-profiles.router — thin controller for the `user_profiles` entity CRUD
 * surface (admin).
 *
 * Endpoints:
 *   GET   /api/v1/entities/user_profiles/meta           → entity metadata
 *   GET   /api/v1/entities/user_profiles/list           → paginated list
 *   GET   /api/v1/entities/user_profiles/:uuid          → single user
 *   POST  /api/v1/entities/user_profiles/:uuid/restore  → restore soft-deleted
 *   GET   /api/v1/entities/user_profiles/:uuid/audit    → audit history
 *   PUT   /api/v1/entities/user_profiles/:uuid          → admin profile update
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
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
import { UserProfilesDal, type UserListQuery } from "../user-profiles-dal.js";
import { CasdoorService } from "../services/casdoor.service.js";
import { UserService } from "../services/user.service.js";
import { userProfileMeta } from "../user-profiles.meta.js";
import {
  UuidParamSchema,
  UserProfileAuditQuerySchema,
  UserUpdateBodySchema,
  makeChangePasswordSchema,
  type ChangePasswordBody,
} from "../dto.js";
import { loadAuthConfigFromDb } from "../config-repo.js";
import { parsePasswordPolicy } from "../password-policy.js";
import { ValidationError } from "../../../http/api-errors.js";

function makeUserService(): UserService {
  const pool = getPool();
  const auditService = new AuditService(pool);
  const dal = new UserProfilesDal(pool, auditService);
  const casdoor = new CasdoorService(pool);
  return new UserService(pool, dal, casdoor);
}

export function userProfilesRouter() {
  const router = makeProtectedRouter();
  const service = makeUserService();

  const getMeta: RequestHandler = asyncHandler(async (_req, res) => {
    res.json(userProfileMeta);
  });

  const list: RequestHandler = asyncHandler(async (req, res) => {
    const { search, search_in, sort_key, sort_dir, page, page_size, filters, connector, deleted_records } = req.query;
    const query: UserListQuery = {
      search: search as string | undefined,
      search_in: search_in ? (search_in as string).split(",") : undefined,
      sort_key: sort_key as string | null,
      sort_dir: sort_dir as "asc" | "desc",
      page: page ? parseInt(page as string, 10) : 1,
      page_size: page_size ? parseInt(page_size as string, 10) : 25,
      filters: filters ? JSON.parse(filters as string) : undefined,
      connector: connector as "AND" | "OR",
      deleted_records: (deleted_records as "EXCLUDED" | "ONLY" | "INCLUDED") || "EXCLUDED",
    };
    const result = await service.listUsers(query);
    res.json(result);
  });

  const getSingle: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const user = await service.getUserByUuid(uuid as string);
    res.json(user);
  });

  const restore: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    await service.restoreUser(uuid as string);
    res.json({ success: true });
  });

  /** Inline param + query validation for the audit endpoint. */
  const validateAuditParams: RequestHandler = (req, res, next) => {
    const r = UuidParamSchema.safeParse(req.params);
    if (!r.success) {
      throw new ValidationError("Request validation failed", { internal_code: "VALIDATION_ERROR" });
    }
    (req as any).params = r.data;
    next();
  };

  const getAudit: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params as unknown as z.infer<typeof UuidParamSchema>;
    const { page, limit } = req.query as unknown as z.infer<typeof UserProfileAuditQuerySchema>;
    const result = await service.getUserProfileAudit(uuid, page, limit);
    res.json(result);
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const updated = await service.updateUserProfile(uuid as string, req.body as z.infer<typeof UserUpdateBodySchema>);
    res.json(updated);
  });

  const changePassword: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    // Load the active password policy from DB and build the schema dynamically.
    const cfg = await loadAuthConfigFromDb(getPool());
    const policy = parsePasswordPolicy(cfg.password_policy!);
    const schema = makeChangePasswordSchema(policy);
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        type: '/errors/validation-error',
        title: 'Validation error',
        status: 400,
        detail: 'Request validation failed',
        severity: 'HIGH' as const,
        internal_code: 'VALIDATION_ERROR',
        instance: req.path,
        extra: {
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            code: i.code,
            message: i.message,
          })),
        },
      });
      return;
    }
    const { newPassword } = parsed.data as ChangePasswordBody;
    const result = await service.changePassword(uuid as string, newPassword);
    res.json(result);
  });

  registerRoutes(router, [
    {
      method: "get",
      path: "/api/v1/entities/user_profiles/meta",
      permission: rbacHandler([Permission.USERS_READ_ALL, Permission.USERS_READ_SINGLE]),
      handler: getMeta,
    },
    {
      method: "get",
      path: "/api/v1/entities/user_profiles/list",
      permission: rbacHandler([Permission.USERS_READ_ALL]),
      handler: list,
    },
    {
      method: "get",
      path: "/api/v1/entities/user_profiles/:uuid",
      permission: rbacHandler([Permission.USERS_READ_SINGLE]),
      handler: getSingle,
    },
    {
      method: "post",
      path: "/api/v1/entities/user_profiles/:uuid/restore",
      permission: rbacHandler([Permission.USERS_RESTORE_SINGLE]),
      handler: restore,
    },
    {
      method: "get",
      path: "/api/v1/entities/user_profiles/:uuid/audit",
      permission: rbacHandler([Permission.USER_PROFILE_READ_AUDIT]),
      middlewares: [validateAuditParams],
      handler: getAudit,
    },
    {
      method: "put",
      path: "/api/v1/entities/user_profiles/:uuid",
      permission: rbacHandler([Permission.USERS_UPDATE_SINGLE]),
      middlewares: [validateBody(UserUpdateBodySchema)],
      handler: update,
    },
    {
      method: "post",
      path: "/api/v1/entities/user_profiles/:uuid/change-password",
      permission: rbacHandler([Permission.USERS_UPDATE_SINGLE]),
      handler: changePassword,
    },
  ]);

  return router;
}
