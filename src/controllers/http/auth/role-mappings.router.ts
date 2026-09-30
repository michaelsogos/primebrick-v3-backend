/**
 * role-mappings.router — thin controller for the `role_mapping` entity.
 *
 * Standard entity CRUD via `makeEntityRouter` — mandatory chain (permission,
 * uuid/body/query validation) is non-overridable. The create/update/delete
 * handler BODIES are overridden because this entity writes through Casdoor
 * and needs the actor (`req.user.id`) + cache invalidation; the mandatory
 * middleware chain still applies around them.
 *
 *   GET    /api/v1/entities/role_mapping/meta           → entity metadata
 *   GET    /api/v1/entities/role_mapping/list            → paginated list
 *   GET    /api/v1/entities/role_mapping/:uuid           → single record
 *   POST   /api/v1/entities/role_mapping                 → create (Casdoor + local)
 *   PUT    /api/v1/entities/role_mapping/:uuid           → update (Casdoor + local)
 *   DELETE /api/v1/entities/role_mapping/:uuid/purge     → hard delete (Casdoor + local, MFA step-up)
 *   GET    /api/v1/entities/role_mapping/:uuid/audit     → audit history
 *
 * The legacy `/api/v1/system/role-mappings*` route set (keyed by :idp_role)
 * was removed — it was a pre-entity-pattern duplicate with no callers left
 * (`useRoleMappings` migrated to the entity endpoints). The unrelated
 * `GET /api/v1/system/roles/active` dropdown endpoint lives elsewhere.
 *
 * `idp_role` and `idp_org` are immutable on update — the Casdoor role identity
 * `(owner, name)` is fixed at creation.
 *
 * NOTE: role delete is a Casdoor-synced HARD delete — registered as `purge`
 * (DELETE /:uuid/purge) with NO soft `DELETE /:uuid` route. It still takes
 * the caller-observed `?version=` (optimistic-concurrency guard passed down
 * to `hardDelete`), like every other entity.
 */

import type { RequestHandler } from "express";
import { z } from "zod";
import { zBoundedInt } from "../../../http/validation.js";

import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { makeEntityRouter } from "../../../http/entity-router.js";
import { ListAuditQuerySchema } from "../../../http/list-query.js";
import { rbacHandler } from "../../../modules/auth/rbac.middleware.js";
import { Permission, isPermissionSentinel } from "@primebrick/sdk";
import { requireMfaStepUp } from "../../../modules/auth/mfa-step-up.middleware.js";
import { RoleService } from "../../../modules/auth/services/role.service.js";
import { RoleMappingListQuerySchema } from "../../../modules/auth/dto.js";
import { roleMappingsMeta } from "../../../modules/auth/role-mappings.meta.js";
import { RoleMappingEntity } from "../../../modules/auth/role_mapping_entity.js";
import { getPool } from "../../../db/pool.js";
import {
  entityWriteBody,
  assertTranslationsPermission,
  requireVersionQuery,
  runEntityWrite,
} from "../../../http/entity-write.js";

// idp_role: snake_case, lowercase letters / digits / underscores, 1-255 chars.
const idpRoleSchema = z
  .string()
  .min(1, { message: "system.settings.roles.validation.idpRoleRequired" })
  .max(255)
  .regex(/^[a-z0-9_]+$/, { message: "system.settings.roles.validation.idpRoleFormat" });

// idp_org: the Casdoor organization name (owner). Required on create.
const idpOrgSchema = z
  .string()
  .min(1, { message: "system.settings.roles.validation.idpOrgRequired" })
  .max(255);

// permissions: array of permission strings matching module.action.granularity.
// Sentinels (_public, _authenticated_user, _authenticated_admin) are rejected.
const permissionStringSchema = z
  .string()
  .regex(/^[a-z_]+\.[a-z_]+(\.[a-z_]+)*$/, { message: "system.settings.roles.validation.permissionFormat" })
  .refine((p) => !isPermissionSentinel(p), { message: "system.settings.roles.validation.permissionSentinelRejected" });

// Write-payload standard: `{entity, translations?}` (src/http/entity-write.ts)
const CreateBodySchema = entityWriteBody(z.object({
  idp_role: idpRoleSchema,
  idp_org: idpOrgSchema,
  label_key: z.string().max(255).optional().or(z.literal("")),
  is_admin: z.boolean().default(false),
  permissions: z.array(permissionStringSchema).default([]),
}));

// On update, the body MUST NOT contain idp_role or idp_org (both immutable).
// We use .strict() to reject unknown keys — but only for the two immutable ones.
const UpdateBodySchema = entityWriteBody(z
  .object({
    idp_role: z.never().optional(),
    idp_org: z.never().optional(),
    label_key: z.string().max(255).optional().or(z.literal("")),
    is_admin: z.boolean().optional(),
    permissions: z.array(permissionStringSchema).optional(),
    version: zBoundedInt(0, Number.MAX_SAFE_INTEGER),
  })
  .refine((data) => !("idp_role" in data) && !("idp_org" in data), {
    message: "idp_role and idp_org are immutable on update",
    path: ["idp_role"],
  }));

export function roleMappingsRouter() {
  const service = new RoleService();
  const invalidateRolesCache = () => service.invalidateCache();
  const actor = (req: Parameters<RequestHandler>[0]) => req.user?.id ?? "system";

  // --- Overridden bodies (actor + Casdoor-synced writes + cache invalidate) --

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof CreateBodySchema>;
    assertTranslationsPermission(req, body.translations);
    const role = await runEntityWrite(
      getPool(),
      body.translations,
      (tx) => service.createRole(body.entity, actor(req), tx),
      invalidateRolesCache,
    );
    res.status(201).json(role);
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof UpdateBodySchema>;
    assertTranslationsPermission(req, body.translations);
    const role = await runEntityWrite(
      getPool(),
      body.translations,
      (tx) => service.updateRoleByUuid(req.params.uuid as string, body.entity, actor(req), tx),
      invalidateRolesCache,
    );
    res.json(role);
  });

  // Casdoor-synced hard delete — actor + caller-observed version guard
  // (same optimistic-concurrency contract as soft-delete entities; the FE
  // EntityListTable already sends `?version=` for every entity).
  const purge: RequestHandler = asyncHandler(async (req, res) => {
    const version = requireVersionQuery(req);
    const deleted = await service.deleteRoleByUuid(req.params.uuid as string, actor(req), version);
    res.json(deleted);
  });

  return makeEntityRouter({
    entityName: "role_mapping",
    entity: RoleMappingEntity,
    meta: roleMappingsMeta,
    service,
    permissions: {
      meta: [Permission.ROLE_MAPPING_READ_ALL, Permission.ROLE_MAPPING_READ_SINGLE],
      list: [Permission.ROLE_MAPPING_READ_ALL],
      get: [Permission.ROLE_MAPPING_READ_SINGLE],
      create: [Permission.ROLE_MAPPING_CREATE_SINGLE],
      update: [Permission.ROLE_MAPPING_UPDATE_SINGLE],
      // Hard-delete-only entity: `purge` without `delete` → the soft route
      // `DELETE /:uuid` is never registered (404), only `DELETE /:uuid/purge`.
      purge: [Permission.ROLE_MAPPING_DELETE_SINGLE],
      audit: [Permission.ROLE_MAPPING_READ_AUDIT],
    },
    schemas: {
      listQuery: RoleMappingListQuerySchema,
      createBody: CreateBodySchema,
      updateBody: UpdateBodySchema,
      auditQuery: ListAuditQuerySchema,
    },
    methods: {
      list: "listRoleMappings",
      get: "getRoleByUuid",
      audit: "getRoleAudit",
    },
    handlers: {
      create,
      update,
      purge,
    },
    hooks: {
      actionMiddlewares: {
        purge: [requireMfaStepUp("delete", "role_mapping")],
      },
    },
  });
}
