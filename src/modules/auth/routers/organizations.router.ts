/**
 * organizations.router — thin controller for the `organization` entity.
 *
 * Endpoints:
 *   GET    /api/v1/entities/organization/meta              → entity metadata
 *   GET    /api/v1/entities/organization/list              → paginated list
 *   GET    /api/v1/entities/organization/check-availability → idp_code availability
 *   GET    /api/v1/entities/organization/:uuid             → single record
 *   POST   /api/v1/entities/organization                   → create (Casdoor + local)
 *   PUT    /api/v1/entities/organization/:uuid             → update
 *   DELETE /api/v1/entities/organization/:uuid             → delete
 *   POST   /api/v1/entities/organization/:uuid/restore     → restore
 *   GET    /api/v1/entities/organization/:uuid/audit       → audit history
 *
 * The router contains NO business logic. All errors are thrown as `ApiError`
 * subclasses and converted to RFC 7807 by the centralized `errorHandler`.
 *
 * NOTE: `check-availability` is registered before `:uuid` so it is not
 * matched as a UUID parameter (Express routes are order-sensitive).
 */

import type { RequestHandler } from "express";
import { z } from "zod";

import { makeProtectedRouter } from "../../../http/protected-router.js";
import { registerRoutes } from "../../../http/define-route.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { validateBody } from "../../../http/validation.js";
import { rbacHandler } from "../rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { organizationMeta } from "../organizations.meta.js";
import { OrganizationsService } from "../services/organizations.service.js";
import { ValidationError } from "../../../http/api-errors.js";
import type { OrganizationListQuery } from "../organizations_dal.js";
import { displayNameSchema, idpNameSchema } from "../validation.js";

const CreateBodySchema = z.object({
  idp_owner: z.string().min(1).max(255).optional().default("admin"),
  idp_name: idpNameSchema(z.string()),
  display_name: displayNameSchema(z.string()).optional(),
  website_url: z.string().url().max(2048).optional().or(z.literal("")),
});

const UpdateBodySchema = z.object({
  display_name: displayNameSchema(z.string()).optional(),
  website_url: z.string().url().max(2048).optional().or(z.literal("")),
});

export function organizationsRouter() {
  const router = makeProtectedRouter();
  const service = new OrganizationsService();

  const getMeta: RequestHandler = asyncHandler(async (_req, res) => {
    res.json(organizationMeta);
  });

  const list: RequestHandler = asyncHandler(async (req, res) => {
    const { search, search_in, sort_key, sort_dir, page, page_size, filters, connector, deleted_records } = req.query;
    const query: OrganizationListQuery = {
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
    const result = await service.listOrganizations(query);
    res.json(result);
  });

  const checkAvailability: RequestHandler = asyncHandler(async (req, res) => {
    const { idp_owner, idp_name } = req.query;
    if (!idp_owner || !idp_name) {
      throw new ValidationError("Both idp_owner and idp_name are required", {
        internal_code: "MISSING_PARAMETERS",
      });
    }
    const result = await service.checkAvailability(idp_owner as string, idp_name as string);
    res.json({
      available: result.available,
      idp_code: result.idpCode,
      ...(result.existingUuid ? { existing_uuid: result.existingUuid } : {}),
    });
  });

  const getSingle: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const org = await service.getOrganization(uuid as string);
    res.json(org);
  });

  const create: RequestHandler = asyncHandler(async (req, res) => {
    const organization = await service.createOrganization(req.body as z.infer<typeof CreateBodySchema>);
    res.status(201).json({ success: true, organization });
  });

  const update: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    await service.updateOrganization(uuid as string, req.body as z.infer<typeof UpdateBodySchema>);
    res.json({ success: true });
  });

  const remove: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    await service.deleteOrganization(uuid as string);
    res.json({ success: true });
  });

  const restore: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    await service.restoreOrganization(uuid as string);
    res.json({ success: true });
  });

  const getAudit: RequestHandler = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const result = await service.getOrganizationAudit(uuid as string, page, limit);
    res.json(result);
  });

  registerRoutes(router, [
    {
      method: "get",
      path: "/api/v1/entities/organization/meta",
      permission: rbacHandler([Permission.ORGANIZATIONS_READ_ALL, Permission.ORGANIZATIONS_READ_SINGLE]),
      handler: getMeta,
    },
    {
      method: "get",
      path: "/api/v1/entities/organization/list",
      permission: rbacHandler([Permission.ORGANIZATIONS_READ_ALL]),
      handler: list,
    },
    // check-availability MUST be registered before :uuid to avoid matching.
    {
      method: "get",
      path: "/api/v1/entities/organization/check-availability",
      permission: rbacHandler([Permission.ORGANIZATIONS_READ_ALL]),
      handler: checkAvailability,
    },
    {
      method: "get",
      path: "/api/v1/entities/organization/:uuid",
      permission: rbacHandler([Permission.ORGANIZATIONS_READ_SINGLE]),
      handler: getSingle,
    },
    {
      method: "post",
      path: "/api/v1/entities/organization",
      permission: rbacHandler([Permission.ORGANIZATIONS_CREATE_SINGLE]),
      middlewares: [validateBody(CreateBodySchema)],
      handler: create,
    },
    {
      method: "put",
      path: "/api/v1/entities/organization/:uuid",
      permission: rbacHandler([Permission.ORGANIZATIONS_UPDATE_SINGLE]),
      middlewares: [validateBody(UpdateBodySchema)],
      handler: update,
    },
    {
      method: "delete",
      path: "/api/v1/entities/organization/:uuid",
      permission: rbacHandler([Permission.ORGANIZATIONS_DELETE_SINGLE]),
      handler: remove,
    },
    {
      method: "post",
      path: "/api/v1/entities/organization/:uuid/restore",
      permission: rbacHandler([Permission.ORGANIZATIONS_RESTORE_SINGLE]),
      handler: restore,
    },
    {
      method: "get",
      path: "/api/v1/entities/organization/:uuid/audit",
      permission: rbacHandler([Permission.ORGANIZATIONS_READ_AUDIT]),
      handler: getAudit,
    },
  ]);

  return router;
}
