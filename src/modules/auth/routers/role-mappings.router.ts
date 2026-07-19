/**
 * role-mappings.router — thin controller for role_mappings CRUD.
 *
 * Endpoints:
 *   GET    /api/v1/system/role-mappings            → list all roles
 *   GET    /api/v1/system/role-mappings/:idp_role  → single role
 *   POST   /api/v1/system/role-mappings            → create (Casdoor + local)
 *   PUT    /api/v1/system/role-mappings/:idp_role  → update (Casdoor + local)
 *   DELETE /api/v1/system/role-mappings/:idp_role  → delete (Casdoor + local)
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 *
 * `idp_role` is the URL parameter (the Casdoor role name). On update, the body
 * MUST NOT contain `idp_role` or `idp_org` — both are immutable (the Casdoor
 * role identity `(owner, name)` is fixed at creation).
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

  registerRoutes(router, [
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
