/**
 * organizations.router — thin controller for the `organization` entity.
 *
 * Standard entity CRUD via `makeEntityRouter` — mandatory chain (permission,
 * uuid/body/query validation, translations permission, version query,
 * runEntityWrite tx) is non-overridable.
 *
 *   GET    /api/v1/entities/organization/meta              → entity metadata
 *   GET    /api/v1/entities/organization/list              → paginated list
 *   GET    /api/v1/entities/organization/check-availability → idp_code availability (extra route)
 *   GET    /api/v1/entities/organization/:uuid             → single record
 *   POST   /api/v1/entities/organization                   → create (Casdoor + local)
 *   PUT    /api/v1/entities/organization/:uuid             → update
 *   DELETE /api/v1/entities/organization/:uuid             → delete (Casdoor + local, MFA step-up)
 *   POST   /api/v1/entities/organization/:uuid/restore     → restore
 *   GET    /api/v1/entities/organization/:uuid/audit       → audit history
 *
 * NO BULK ROUTES — architectural constraint, mandatory. Every write must
 * sync to Casdoor (IdP) BEFORE the local DB write (`OrganizationsService`),
 * and the sync is per-organization via `org.idp_code`. A real bulk op is an
 * atomic set operation (single DAL transaction, temp-table strategy) — it
 * cannot interleave N synchronous per-item IdP calls, and a mere loop of
 * single deletes is NOT a bulk op. Therefore `bulk-delete`, `bulk-restore`,
 * `duplicate`, and `export` can NEVER exist for this entity unless the
 * Casdoor sync contract itself changes — the factory simply never registers
 * them (their permissions are absent), and `meta.actions` correctly reports
 * no bulk ops so the FE hides those CTAs.
 *
 * NOTE: `check-availability` is an `extraRoute` — registered with the literal
 * routes, BEFORE `:uuid`, so it is not matched as a UUID parameter.
 */

import { z } from "zod";
import { Permission } from "@primebrick/sdk";

import { makeEntityRouter } from "../../../http/entity-router.js";
import { asyncHandler } from "../../../http/async-handler.js";
import { entityWriteBody } from "../../../http/entity-write.js";
import { zBoundedInt } from "../../../http/validation.js";
import { ValidationError } from "../../../http/api-errors.js";
import { rbacHandler } from "../../../modules/auth/rbac.middleware.js";
import { requireMfaStepUp } from "../../../modules/auth/mfa-step-up.middleware.js";
import { ListAuditQuerySchema } from "../../../http/list-query.js";
import { OrganizationListQuerySchema } from "../../../modules/auth/dto.js";
import { displayNameSchema, idpNameSchema } from "../../../modules/auth/validation.js";
import { organizationMeta } from "../../../modules/auth/organizations.meta.js";
import { OrganizationEntity } from "../../../modules/auth/organization_entity.js";
import { OrganizationsService } from "../../../modules/auth/services/organizations.service.js";

// Write-payload standard: `{entity, translations?}` (src/http/entity-write.ts)
const CreateBodySchema = entityWriteBody(z.object({
  idp_owner: z.string().min(1).max(255).optional().default("admin"),
  idp_name: idpNameSchema(z.string()),
  display_name: displayNameSchema(z.string()).optional(),
  website_url: z.string().url().max(2048).optional().or(z.literal("")),
}));

const UpdateBodySchema = entityWriteBody(z.object({
  display_name: displayNameSchema(z.string()).optional(),
  website_url: z.string().url().max(2048).optional().or(z.literal("")),
  version: zBoundedInt(0, Number.MAX_SAFE_INTEGER),
}));

export function organizationsRouter() {
  const service = new OrganizationsService();

  return makeEntityRouter({
    entityName: "organization",
    entity: OrganizationEntity,
    meta: organizationMeta,
    service,
    permissions: {
      meta: [Permission.ORGANIZATION_READ_ALL, Permission.ORGANIZATION_READ_SINGLE],
      list: [Permission.ORGANIZATION_READ_ALL],
      get: [Permission.ORGANIZATION_READ_SINGLE],
      create: [Permission.ORGANIZATION_CREATE_SINGLE],
      update: [Permission.ORGANIZATION_UPDATE_SINGLE],
      delete: [Permission.ORGANIZATION_DELETE_SINGLE],
      restore: [Permission.ORGANIZATION_RESTORE_SINGLE],
      audit: [Permission.ORGANIZATION_READ_AUDIT],
    },
    // E.8: duplicate is ON by default — explicitly disabled for this
    // IdP-synced / domain-lifecycle entity (cloning is meaningless).
    duplicate: false,
    schemas: {
      listQuery: OrganizationListQuerySchema,
      createBody: CreateBodySchema,
      updateBody: UpdateBodySchema,
      auditQuery: ListAuditQuerySchema,
    },
    methods: {
      list: "listOrganizations",
      get: "getOrganization",
      create: "createOrganization",
      update: "updateOrganization",
      delete: "deleteOrganization",
      restore: "restoreOrganization",
      audit: "getOrganizationAudit",
    },
    hooks: {
      actionMiddlewares: {
        delete: [requireMfaStepUp("delete", "organization")],
      },
    },
    extraRoutes: [
      // check-availability MUST register before :uuid (literal-route slot).
      {
        method: "get",
        path: "/api/v1/entities/organization/check-availability",
        permission: rbacHandler([Permission.ORGANIZATION_READ_ALL]),
        handler: asyncHandler(async (req, res) => {
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
        }),
      },
    ],
  });
}
