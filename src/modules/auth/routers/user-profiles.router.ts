/**
 * user-profiles.router — thin controller for the `user_profiles` entity CRUD
 * surface (admin).
 *
 * Endpoints (READ-ONLY surface):
 *   GET   /api/v1/entities/user_profile/meta           → entity metadata
 *   GET   /api/v1/entities/user_profile/list           → paginated list
 *   GET   /api/v1/entities/user_profile/:uuid          → single user
 *   GET   /api/v1/entities/user_profile/:uuid/audit    → audit history
 *
 * All lifecycle writes (create / update / delete / restore / change-password)
 * live under `/api/v1/auth/users` — the AUTH module owns Casdoor coordination.
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 */

import type { IRouter, RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { getPool } from "../../../db/pool.js";
import { UserProfilesDal, type UserListQuery } from "../user-profiles-dal.js";
import { CasdoorService } from "../services/casdoor.service.js";
import { UserService } from "../services/user.service.js";
import { userProfileMeta } from "../user-profiles.meta.js";
import { UserProfileEntity } from "../user_profile_entity.js";
import { assembleMeta } from "../../../http/meta-assembler.js";
import { deriveEntityActions } from "../../../http/entity-actions.js";
import {
  UuidParamSchema,
  UserProfileAuditQuerySchema,
  UserUpdateBodySchema,
  makeChangePasswordSchema,
  type ChangePasswordBody,
} from "../dto.js";
import { loadAuthConfigFromDb } from "../config-repo.js";

// Write-payload standard: `{entity, translations?}` (src/http/entity-write.ts)
const UserUpdateBodySchemaWrapped = entityWriteBody(UserUpdateBodySchema);
import { parsePasswordPolicy } from "../password-policy.js";
import { ValidationError } from "../../../http/api-errors.js";
import {
  entityWriteBody,
  assertTranslationsPermission,
  runEntityWrite,
} from "../../../http/entity-write.js";

function makeUserService(): UserService {
  const pool = getPool();
  const dal = new UserProfilesDal(pool);
  const casdoor = new CasdoorService(pool);
  return new UserService(pool, dal, casdoor);
}

export function userProfilesRouter(usersRoutes?: IRouter) {
  const router = makeProtectedRouter();
  const service = makeUserService();

  const getMeta: RequestHandler = asyncHandler(async (_req, res) => {
    res.json({
      ...assembleMeta(userProfileMeta, UserProfileEntity),
      actions: deriveEntityActions(
        router,
        "user_profile",
        userProfileMeta.actions_overrides,
        // create/update/delete live under /api/v1/auth/users (Casdoor-aware
        // user management) — same entity ops, non-standard prefix.
        usersRoutes ? [{ router: usersRoutes, prefix: "/api/v1/auth/users" }] : undefined,
      ),
    });
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



  registerRoutes(router, [
    {
      method: "get",
      path: "/api/v1/entities/user_profile/meta",
      permission: rbacHandler([Permission.USER_PROFILE_READ_ALL, Permission.USER_PROFILE_READ_SINGLE]),
      handler: getMeta,
    },
    {
      method: "get",
      path: "/api/v1/entities/user_profile/list",
      permission: rbacHandler([Permission.USER_PROFILE_READ_ALL]),
      handler: list,
    },
    {
      method: "get",
      path: "/api/v1/entities/user_profile/:uuid",
      permission: rbacHandler([Permission.USER_PROFILE_READ_SINGLE]),
      handler: getSingle,
    },
    {
      method: "get",
      path: "/api/v1/entities/user_profile/:uuid/audit",
      permission: rbacHandler([Permission.USER_PROFILE_READ_AUDIT]),
      middlewares: [validateAuditParams],
      handler: getAudit,
    },
  ]);

  return router;
}
