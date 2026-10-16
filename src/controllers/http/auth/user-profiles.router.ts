/**
 * user-profiles.router — thin controller for the `user_profile` entity
 * READ-ONLY surface (admin).
 *
 * Standard entity router via `makeEntityRouter` — only meta/list/get/audit
 * permissions are declared, so only those routes exist. All lifecycle writes
 * (create / update / delete / restore / change-password) live under
 * `/api/v1/auth/users` — the AUTH module owns Casdoor coordination; those are
 * RPC lifecycle endpoints, not pure entity CRUD. `metaExtraScans` makes
 * `deriveEntityActions` report them in `meta.actions`.
 *
 *   GET   /api/v1/entities/user_profile/meta           → entity metadata
 *   GET   /api/v1/entities/user_profile/list           → paginated list
 *   GET   /api/v1/entities/user_profile/:uuid          → single user
 *   GET   /api/v1/entities/user_profile/:uuid/audit    → audit history
 */

import type { IRouter } from "express";
import { Permission } from "@primebrick/sdk";

import { makeEntityRouter } from "../../../http/entity-router.js";
import { makeUserService } from "./wiring.js";
import { userProfileMeta } from "../../../modules/auth/user-profiles.meta.js";
import { UserProfileEntity } from "../../../modules/auth/user_profile_entity.js";
import {
  UserProfileAuditQuerySchema,
  UserProfileListQuerySchema,
} from "../../../modules/auth/dto.js";

export function userProfilesRouter(usersRoutes?: IRouter) {
  const service = makeUserService();

  return makeEntityRouter({
    entityName: "user_profile",
    entity: UserProfileEntity,
    meta: userProfileMeta,
    // create/update/delete live under /api/v1/auth/users (Casdoor-aware
    // user management) — same entity ops, non-standard prefix.
    metaExtraScans: usersRoutes ? [{ router: usersRoutes, prefix: "/api/v1/auth/users" }] : undefined,
    service,
    permissions: {
      meta: [Permission.USER_PROFILE_READ_ALL, Permission.USER_PROFILE_READ_SINGLE],
      list: [Permission.USER_PROFILE_READ_ALL],
      get: [Permission.USER_PROFILE_READ_SINGLE],
      audit: [Permission.USER_PROFILE_READ_AUDIT],
    },
    // E.8: duplicate is ON by default — explicitly disabled for this
    // IdP-synced / domain-lifecycle entity (cloning is meaningless).
    duplicate: false,
    schemas: {
      listQuery: UserProfileListQuerySchema,
      auditQuery: UserProfileAuditQuerySchema,
    },
    methods: {
      list: "listUsers",
      get: "getUserByUuid",
      audit: "getUserProfileAudit",
    },
  });
}
