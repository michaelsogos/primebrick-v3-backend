/**
 * role-mappings.router — thin controller for role_mappings CRUD.
 *
 * Two endpoint sets coexist:
 *
 * 1. Entity-pattern endpoints (used by the FE EntityListTable), keyed by :uuid:
 *    GET    /api/v1/entities/role_mappings/meta           → entity metadata
 *    GET    /api/v1/entities/role_mappings/list            → paginated list
 *    GET    /api/v1/entities/role_mappings/:uuid           → single record
 *    POST   /api/v1/entities/role_mappings                 → create (Casdoor + local)
 *    PUT    /api/v1/entities/role_mappings/:uuid           → update (Casdoor + local)
 *    DELETE /api/v1/entities/role_mappings/:uuid           → delete (Casdoor + local)
 *    GET    /api/v1/entities/role_mappings/:uuid/audit     → audit history
 *
 * 2. Legacy system-path endpoints (used by the FE create/edit forms), keyed by
 *    :idp_role (the Casdoor role name):
 *    GET    /api/v1/system/role-mappings                   → list all roles
 *    GET    /api/v1/system/role-mappings/:idp_role         → single role
 *    POST   /api/v1/system/role-mappings                   → create (Casdoor + local)
 *    PUT    /api/v1/system/role-mappings/:idp_role         → update (Casdoor + local)
 *    DELETE /api/v1/system/role-mappings/:idp_role         → delete (Casdoor + local)
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 *
 * `idp_role` and `idp_org` are immutable on update — the Casdoor role identity
 * `(owner, name)` is fixed at creation.
 */

import type { RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission, isPermissionSentinel } from "@primebrick/sdk";
import { RoleService } from "../services/role.service.js";
import { roleMappingsMeta } from "../role-mappings.meta.js";
import type { RoleMappingListQuery } from "../role-mapping-repo.js";
import { ValidationError } from "../../../http/api-errors.js";

// idp_role: snake_case, lowercase letters / digits / underscores, 1-255 chars.
const idpRoleSchema = z
  .string()
  .min(1, { message: "validation.idpRoleRequired" })
  .max(255)
  .regex(/^[a-z0-9_]+$/, { message: "validation.idpRoleFormat" });

// idp_org: the Casdoor organization name (owner). Required on create.
const idpOrgSchema = z
  .string()
  .min(1, { message: "validation.idpOrgRequired" })
  .max(255);

// permissions: array of permission strings matching module.action.granularity.
// Sentinels (_public, _authenticated_user, _authenticated_admin) are rejected.
const permissionStringSchema = z
  .string()
  .regex(/^[a-z_]+\.[a-z_]+(\.[a-z_]+)*$/, { message: "validation.permissionFormat" })
  .refine((p) => !isPermissionSentinel(p), { message: "validation.permissionSentinelRejected" });

const CreateBodySchema = z.object({
  idp_role: idpRoleSchema,
  idp_org: idpOrgSchema,
  label_key: z.string().max(255).optional().or(z.literal("")),
  is_admin: z.boolean().default(false),
  permissions: z.array(permissionStringSchema).default([]),
});

// On update, the body MUST NOT contain idp_role or idp_org (both immutable).
// We use .strict() to reject unknown keys — but only for the two immutable ones.
const UpdateBodySchema = z
  .object({
    idp_role: z.never().optional(),
    idp_org: z.never().optional(),
    label_key: z.string().max(255).optional().or(z.literal("")),
    is_admin: z.boolean().optional(),
    permissions: z.array(permissionStringSchema).optional(),
  })
  .refine((data) => !("idp_role" in data) && !("idp_org" in data), {
    message: "idp_role and idp_org are immutable on update",
    path: ["idp_role"],
  });

export function roleMappingsRouter() {
  const router = makeProtectedRouter();
  const service = new RoleService();

  const list: RequestHandler = asyncHandler(async (_req, res) => {
    const roles = await service.listRoles();
    res.json({ roles });
  });

  const getSingle: RequestHandler = asyncHandler(async (req, res) => {
    const { idp_role } = req.params;
    const role = await service.getRole(idp_role as string);
    res.json(role);
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const actor = req.user?.id ?? "system";
    const role = await service.createRole(req.body as z.infer<typeof CreateBodySchema>, actor);
    res.status(201).json(role);
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { idp_role } = req.params;
    const actor = req.user?.id ?? "system";
    const role = await service.updateRole(idp_role as string, req.body as z.infer<typeof UpdateBodySchema>, actor);
    res.json(role);
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    const { idp_role } = req.params;
    const actor = req.user?.id ?? "system";
    await service.deleteRole(idp_role as string, actor);
    res.json({ deleted: true });
  });

  // --- Entity-pattern handlers (keyed by :uuid) -----------------------------

  const getMeta: RequestHandler = asyncHandler(async (_req, res) => {
    res.json(roleMappingsMeta);
  });

  const entityList: RequestHandler = asyncHandler(async (req, res) => {
    const { search, search_in, sort_key, sort_dir, page, page_size, filters, connector } = req.query;
    const query: RoleMappingListQuery = {
      search: search as string | undefined,
      search_in: search_in ? (search_in as string).split(",") : undefined,
      sort_key: sort_key as string | null,
      sort_dir: sort_dir as "asc" | "desc",
      page: page ? parseInt(page as string, 10) : 1,
      page_size: page_size ? parseInt(page_size as string, 10) : 25,
      filters: filters ? JSON.parse(filters as string) : undefined,
      connector: connector as "AND" | "OR",
    };
    const result = await service.listRoleMappings(query);
    res.json(result);
  });

  const entityGetSingle: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const role = await service.getRoleByUuid(uuid as string);
    res.json(role);
  });

  const entityCreate: RequestHandler = asyncHandler(async (req, res) => {
    const actor = req.user?.id ?? "system";
    const role = await service.createRole(req.body as z.infer<typeof CreateBodySchema>, actor);
    res.status(201).json({ success: true, role });
  });

  const entityUpdate: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const actor = req.user?.id ?? "system";
    await service.updateRoleByUuid(uuid as string, req.body as z.infer<typeof UpdateBodySchema>, actor);
    res.json({ success: true });
  });

  const entityRemove: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const actor = req.user?.id ?? "system";
    await service.deleteRoleByUuid(uuid as string, actor);
    res.json({ success: true });
  });

  const entityGetAudit: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const result = await service.getRoleAudit(uuid as string, page, limit);
    res.json(result);
  });

  registerRoutes(router, [
    // --- Entity-pattern routes (keyed by :uuid) ---
    {
      method: "get",
      path: "/api/v1/entities/role_mappings/meta",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_READ_ALL, Permission.ROLE_MAPPINGS_READ_SINGLE]),
      handler: getMeta,
    },
    {
      method: "get",
      path: "/api/v1/entities/role_mappings/list",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_READ_ALL]),
      handler: entityList,
    },
    {
      method: "get",
      path: "/api/v1/entities/role_mappings/:uuid",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_READ_SINGLE]),
      handler: entityGetSingle,
    },
    {
      method: "post",
      path: "/api/v1/entities/role_mappings",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_CREATE]),
      middlewares: [validateBody(CreateBodySchema)],
      handler: entityCreate,
    },
    {
      method: "put",
      path: "/api/v1/entities/role_mappings/:uuid",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_UPDATE]),
      middlewares: [validateBody(UpdateBodySchema)],
      handler: entityUpdate,
    },
    {
      method: "delete",
      path: "/api/v1/entities/role_mappings/:uuid",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_DELETE]),
      handler: entityRemove,
    },
    {
      method: "get",
      path: "/api/v1/entities/role_mappings/:uuid/audit",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_READ_AUDIT]),
      handler: entityGetAudit,
    },
    // --- Legacy system-path routes (keyed by :idp_role) ---
    {
      method: "get",
      path: "/api/v1/system/role-mappings",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_READ_ALL]),
      handler: list,
    },
    {
      method: "get",
      path: "/api/v1/system/role-mappings/:idp_role",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_READ_SINGLE]),
      handler: getSingle,
    },
    {
      method: "post",
      path: "/api/v1/system/role-mappings",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_CREATE]),
      middlewares: [validateBody(CreateBodySchema)],
      handler: create,
    },
    {
      method: "put",
      path: "/api/v1/system/role-mappings/:idp_role",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_UPDATE]),
      middlewares: [validateBody(UpdateBodySchema)],
      handler: update,
    },
    {
      method: "delete",
      path: "/api/v1/system/role-mappings/:idp_role",
      permission: rbacHandler([Permission.ROLE_MAPPINGS_DELETE]),
      handler: remove,
    },
  ]);

  return router;
}
