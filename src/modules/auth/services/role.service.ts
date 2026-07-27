/**
 * RoleService — business logic for role_mappings CRUD.
 *
 * Coordinates the local `role_mappings` table with Casdoor role management.
 * The service is request-context-free: it takes plain parameters and never
 * touches `req`/`res`. The actor is passed explicitly from the router via
 * `req.user.id` (the user_profiles uuid).
 *
 * Sync policy (non-best-effort on ALL operations — confirmed with user):
 *   - Create:  Casdoor `addRole` succeeds → local `upsertMapping` with
 *              `last_synced_at = now()`. Casdoor fails → error, NO local write.
 *   - Update:  Casdoor `updateRole` succeeds → local update with
 *              `last_synced_at = now()`. Casdoor fails → error, NO local write.
 *   - Delete:  Casdoor `deleteRole` succeeds → local `deleteMapping`.
 *              Casdoor fails → error, NO local delete.
 *
 * `permissions[]` is NEVER sent to Casdoor — it is Primebrick-local. The
 * Casdoor role object only carries `owner` (= `idp_org`), `name` (= `idp_role`),
 * and `displayName` (from `label_key`).
 *
 * `idp_role` and `idp_org` are immutable on update — the Casdoor role identity
 * `(owner, name)` is fixed at creation.
 *
 * Errors are thrown as `ApiError` subclasses so the centralized `errorHandler`
 * can convert them to RFC 7807 JSON.
 */

import { getPool } from "../../../db/pool.js";
import {
  RoleMappingRepo,
  type RoleMappingDetailed,
  type RoleMappingDto,
  type RoleMappingListQuery,
  type RoleMappingListResponse,
} from "../role-mapping-repo.js";
import { CasdoorService } from "./casdoor.service.js";
import { getAuthConfig } from "../config.js";
import { ApiError, NotFoundError } from "../../../http/api-errors.js";

export interface CreateRoleInput {
  idp_role: string;
  idp_org: string;
  label_key?: string;
  is_admin: boolean;
  permissions: string[];
}

export interface UpdateRoleInput {
  label_key?: string;
  is_admin?: boolean;
  permissions?: string[];
}

export class RoleService {
  private repo: RoleMappingRepo | null = null;
  private casdoor: CasdoorService | null = null;

  private getRepo(): RoleMappingRepo {
    if (!this.repo) this.repo = new RoleMappingRepo(getPool());
    return this.repo;
  }

  private getCasdoor(): CasdoorService {
    if (!this.casdoor) this.casdoor = new CasdoorService(getPool());
    return this.casdoor;
  }

  // --- List -----------------------------------------------------------------

  async listRoles(): Promise<RoleMappingDetailed[]> {
    return this.getRepo().listAllDetailed();
  }

  // --- Get ------------------------------------------------------------------

  async getRole(idpRole: string): Promise<RoleMappingDetailed> {
    const role = await this.getRepo().findByIdpRole(idpRole);
    if (!role) {
      throw new NotFoundError(
        `Role "${idpRole}" not found`,
        { internal_code: "ROLE_NOT_FOUND" },
      );
    }
    return role;
  }

  // --- Create ---------------------------------------------------------------

  async createRole(input: CreateRoleInput, actor: string): Promise<RoleMappingDetailed> {
    const { idp_role, idp_org, label_key, is_admin, permissions } = input;

    // 1. Casdoor must be configured.
    const cd = await this.getCasdoor().getClient();
    if (!cd) {
      throw new ApiError(
        "/errors/service-unavailable",
        "Casdoor™ not configured",
        503,
        "Casdoor™ is not configured; cannot create role via API. Configure casdoor_builtin_client_id and casdoor_builtin_client_secret to enable role management.",
        {
          instance: "/api/v1/system/role-mappings",
          internal_code: "CASDOOR_NOT_CONFIGURED",
          severity: "MEDIUM",
        },
      );
    }

    // 2. Check if the role already exists in Casdoor (409 conflict, do NOT overwrite).
    const existingCasdoor = await cd.getRole(idp_role, idp_org);
    if (existingCasdoor) {
      throw new ApiError(
        "/errors/conflict",
        "Role already exists in Casdoor™",
        409,
        `A role with name "${idp_role}" already exists in Casdoor™ organization "${idp_org}".`,
        {
          instance: "/api/v1/system/role-mappings",
          internal_code: "ROLE_ALREADY_EXISTS_CASDOOR",
          severity: "MEDIUM",
        },
      );
    }

    // 3. Also check local DB (a local row without a Casdoor role is a stale seed).
    const existingLocal = await this.getRepo().findByIdpRole(idp_role);
    if (existingLocal) {
      throw new ApiError(
        "/errors/conflict",
        "Role already exists",
        409,
        `A role mapping with idp_role "${idp_role}" already exists in the local database.`,
        {
          instance: "/api/v1/system/role-mappings",
          internal_code: "ROLE_ALREADY_EXISTS_LOCAL",
          severity: "MEDIUM",
        },
      );
    }

    // 4. Create in Casdoor (non-best-effort).
    const created = await cd.addRole({
      owner: idp_org,
      name: idp_role,
      displayName: label_key || idp_role,
      isEnabled: true,
    });
    if (!created) {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ role creation failed",
        502,
        `Casdoor™ addRole did not return a role for "${idp_role}" in organization "${idp_org}".`,
        {
          instance: "/api/v1/system/role-mappings",
          internal_code: "CASDOOR_ADD_ROLE_FAILED",
          severity: "HIGH",
        },
      );
    }

    // 5. Create in local DB.
    const now = new Date();
    await this.getRepo().upsertMapping(idp_role, permissions, is_admin, label_key, {
      idp_org,
      last_synced_at: now,
      actor,
    });

    // 6. Return the created row.
    const row = await this.getRepo().findByIdpRole(idp_role);
    if (!row) {
      throw new NotFoundError("Role not found after create", {
        internal_code: "ROLE_NOT_FOUND_AFTER_CREATE",
      });
    }
    return row;
  }

  // --- Update ---------------------------------------------------------------

  async updateRole(idpRole: string, input: UpdateRoleInput, actor: string): Promise<RoleMappingDetailed> {
    const { label_key, is_admin, permissions } = input;

    // 1. Load existing row to get idp_org (the Casdoor owner).
    const existing = await this.getRepo().findByIdpRole(idpRole);
    if (!existing) {
      throw new NotFoundError(
        `Role "${idpRole}" not found`,
        { internal_code: "ROLE_NOT_FOUND" },
      );
    }

    // 2. Casdoor must be configured.
    const cd = await this.getCasdoor().getClient();
    if (!cd) {
      throw new ApiError(
        "/errors/service-unavailable",
        "Casdoor™ not configured",
        503,
        "Casdoor™ is not configured; cannot update role via API. Configure casdoor_builtin_client_id and casdoor_builtin_client_secret to enable role management.",
        {
          instance: `/api/v1/system/role-mappings/${idpRole}`,
          internal_code: "CASDOOR_NOT_CONFIGURED",
          severity: "MEDIUM",
        },
      );
    }

    // 3. Resolve the Casdoor owner: existing.idp_org, or fallback to cfg.casdoor_organization.
    const cfg = await getAuthConfig();
    const owner = existing.idp_org || cfg.casdoor_organization!;
    if (!owner) {
      throw new ApiError(
        "/errors/internal-error",
        "Cannot resolve Casdoor™ owner",
        500,
        `Role "${idpRole}" has no idp_org and casdoor_organization is not configured. Cannot sync to Casdoor™.`,
        {
          instance: `/api/v1/system/role-mappings/${idpRole}`,
          internal_code: "CASDOOR_OWNER_UNRESOLVED",
          severity: "HIGH",
        },
      );
    }

    // 4. Sync to Casdoor (non-best-effort: only displayName is updatable).
    const syncSuccess = await cd.updateRole({
      owner,
      name: idpRole,
      displayName: label_key || existing.label_key || idpRole,
    });
    if (!syncSuccess) {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ sync failed",
        502,
        `Failed to update role "${idpRole}" in Casdoor™ organization "${owner}".`,
        {
          instance: `/api/v1/system/role-mappings/${idpRole}`,
          internal_code: "CASDOOR_SYNC_FAILED",
          severity: "HIGH",
        },
      );
    }

    // 5. Update local DB.
    const now = new Date();
    await this.getRepo().upsertMapping(
      idpRole,
      permissions ?? existing.permissions,
      is_admin ?? existing.is_admin,
      label_key ?? existing.label_key,
      {
        idp_org: existing.idp_org,
        last_synced_at: now,
        actor,
      },
    );

    // 6. Return the updated row.
    const row = await this.getRepo().findByIdpRole(idpRole);
    if (!row) {
      throw new NotFoundError("Role not found after update", {
        internal_code: "ROLE_NOT_FOUND_AFTER_UPDATE",
      });
    }
    return row;
  }

  // --- Delete ---------------------------------------------------------------

  async deleteRole(idpRole: string, actor: string): Promise<void> {
    // 1. Load existing row to get idp_org (the Casdoor owner).
    const existing = await this.getRepo().findByIdpRole(idpRole);
    if (!existing) {
      throw new NotFoundError(
        `Role "${idpRole}" not found`,
        { internal_code: "ROLE_NOT_FOUND" },
      );
    }

    // 2. Casdoor must be configured.
    const cd = await this.getCasdoor().getClient();
    if (!cd) {
      throw new ApiError(
        "/errors/service-unavailable",
        "Casdoor™ not configured",
        503,
        "Casdoor™ is not configured; cannot delete role via API. Configure casdoor_builtin_client_id and casdoor_builtin_client_secret to enable role management.",
        {
          instance: `/api/v1/system/role-mappings/${idpRole}`,
          internal_code: "CASDOOR_NOT_CONFIGURED",
          severity: "MEDIUM",
        },
      );
    }

    // 3. Resolve the Casdoor owner.
    const cfg = await getAuthConfig();
    const owner = existing.idp_org || cfg.casdoor_organization!;
    if (!owner) {
      throw new ApiError(
        "/errors/internal-error",
        "Cannot resolve Casdoor™ owner",
        500,
        `Role "${idpRole}" has no idp_org and casdoor_organization is not configured. Cannot sync to Casdoor™.`,
        {
          instance: `/api/v1/system/role-mappings/${idpRole}`,
          internal_code: "CASDOOR_OWNER_UNRESOLVED",
          severity: "HIGH",
        },
      );
    }

    // 4. Delete in Casdoor first (non-best-effort: do NOT delete locally if Casdoor fails).
    const syncSuccess = await cd.deleteRole(idpRole, owner);
    if (!syncSuccess) {
      throw new ApiError(
        "/errors/internal-error",
        "Casdoor™ delete failed",
        502,
        `Failed to delete role "${idpRole}" in Casdoor™ organization "${owner}". The role may still be assigned to users — unassign it first in Casdoor™.`,
        {
          instance: `/api/v1/system/role-mappings/${idpRole}`,
          internal_code: "CASDOOR_DELETE_FAILED",
          severity: "HIGH",
        },
      );
    }

    // 5. Delete in local DB.
    await this.getRepo().deleteMapping(idpRole, actor);
  }

  // --- Entity-pattern methods (keyed by uuid) -------------------------------
  // These back the `/api/v1/entities/role_mappings/...` endpoints used by the
  // FE EntityListTable. The Casdoor-coupled create/update/delete flows above
  // remain keyed by idp_role (the Casdoor identity); the entity-pattern
  // delete/put handlers below resolve uuid → idp_role then delegate to the
  // existing Casdoor-syncing methods.

  async listRoleMappings(query: RoleMappingListQuery): Promise<RoleMappingListResponse> {
    return this.getRepo().listPaged(query);
  }

  async getRoleByUuid(uuid: string): Promise<RoleMappingDetailed> {
    const role = await this.getRepo().findByUuid(uuid);
    if (!role) {
      throw new NotFoundError(`Role with uuid "${uuid}" not found`, {
        internal_code: "ROLE_NOT_FOUND",
      });
    }
    return role;
  }

  async updateRoleByUuid(uuid: string, input: UpdateRoleInput, actor: string): Promise<RoleMappingDetailed> {
    const existing = await this.getRepo().findByUuid(uuid);
    if (!existing) {
      throw new NotFoundError(`Role with uuid "${uuid}" not found`, {
        internal_code: "ROLE_NOT_FOUND",
      });
    }
    return this.updateRole(existing.idp_role, input, actor);
  }

  async deleteRoleByUuid(uuid: string, actor: string): Promise<void> {
    const existing = await this.getRepo().findByUuid(uuid);
    if (!existing) {
      throw new NotFoundError(`Role with uuid "${uuid}" not found`, {
        internal_code: "ROLE_NOT_FOUND",
      });
    }
    return this.deleteRole(existing.idp_role, actor);
  }

  async getRoleAudit(uuid: string, page: number, limit: number) {
    // Verify the role exists (404 if not).
    await this.getRoleByUuid(uuid);
    return this.getRepo().getRoleAudit(uuid, page, limit);
  }
}
