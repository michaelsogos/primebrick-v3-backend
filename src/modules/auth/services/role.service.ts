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

import { isAccessGrantLegal, logger } from "@primebrick/sdk";
import {
  type Repository,
  Project,
  field,
  Filter,
  Sort,
  type FilterExpr,
} from "@primebrick/dal-pg";
import { DomainService } from "../../../db/domain-service.js";
import { EntityAuditPort } from "../../../db/entity-audit-port.js";
import { getCachePort } from "../../../cache/cache-port-holder.js";
import { deriveSearchableKeys } from "../../../lib/search-keys.js";
import { roleMappingsMeta } from "../role-mappings.meta.js";
import { RoleMappingEntity } from "../role_mapping_entity.js";
import { CasdoorService } from "./casdoor.service.js";
import { getAuthConfig } from "../config.js";
import { ApiError, NotFoundError } from "../../../http/api-errors.js";
import { collectAccessLeafKeys } from "../../system/access-inventory.js";

const ROLE_MAPPINGS_CACHE_KEY = "be:role_mappings:all";
export const ROLE_MAPPING_FILTERABLE_FIELDS = new Set(["idp_role", "idp_org", "label_key", "is_admin"]);

interface RoleMappingRow {
  idp_role: string;
  label_key?: string;
  permissions: string[];
  is_admin: boolean;
}

/** Full role_mappings row shape (used by the CRUD router / RoleService). */
export interface RoleMappingDetailed {
  id: bigint;
  uuid: string;
  idp_role: string;
  idp_org?: string;
  label_key?: string;
  permissions: string[];
  is_admin: boolean;
  last_synced_at?: Date;
  version: number;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
}

/** API-facing DTO — dates converted to ISO strings (real type conversion). */
export type RoleMappingDto = Omit<
  RoleMappingDetailed,
  "created_at" | "updated_at" | "last_synced_at" | "id"
> & {
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
};

export type RoleMappingListQuery = {
  search?: string;
  search_in?: string[];
  sort_key?: string | null;
  sort_dir?: "asc" | "desc";
  page?: number;
  page_size?: number;
  filters?: Array<{ field: string; op: string; value: unknown; connector?: "AND" | "OR" }>;
  connector?: "AND" | "OR";
};

export type RoleMappingListResponse = {
  rows: RoleMappingDto[];
  page: number;
  page_size: number;
  total: bigint;
};

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
  /** Caller's observed row version — required for the optimistic-concurrency guard. */
  version?: number;
}

const ROLE_MAPPING_PROJECTED_FIELDS = [
  Project.field(field(RoleMappingEntity, "id" as any)),
  Project.field(field(RoleMappingEntity, "uuid" as any)),
  Project.field(field(RoleMappingEntity, "idp_role" as any)),
  Project.field(field(RoleMappingEntity, "idp_org" as any)),
  Project.field(field(RoleMappingEntity, "label_key" as any)),
  Project.field(field(RoleMappingEntity, "permissions" as any)),
  Project.field(field(RoleMappingEntity, "is_admin" as any)),
  Project.field(field(RoleMappingEntity, "last_synced_at" as any)),
  Project.field(field(RoleMappingEntity, "version" as any)),
  Project.field(field(RoleMappingEntity, "created_at" as any)),
  Project.field(field(RoleMappingEntity, "created_by" as any)),
  Project.field(field(RoleMappingEntity, "updated_at" as any)),
  Project.field(field(RoleMappingEntity, "updated_by" as any)),
];

export class RoleService extends DomainService<RoleMappingDto> {
  private casdoor: CasdoorService | null = null;

  // Read surface (list/get/audit) comes from the inherited `svc` — the
  // custom queries below only cover the Casdoor-coupled write path and the
  // auth-middleware mapping load. Role_mapping is hard-delete-only: the
  // generic layer emits no `deleted_at` predicate and no deleter join for it.
  constructor() {
    super({
      entity: RoleMappingEntity,
      list: {
        searchableKeys: deriveSearchableKeys(roleMappingsMeta, RoleMappingEntity),
        filterableKeys: ROLE_MAPPING_FILTERABLE_FIELDS,
        defaultSort: { key: "idp_role", dir: "asc" },
      },
    });
  }

  /** Post-commit cache invalidation hook — passed to `runEntityWrite`. */
  async invalidateCache(): Promise<void> {
    await this.invalidateMappingsCache();
  }

  private getCasdoor(): CasdoorService {
    if (!this.casdoor) this.casdoor = new CasdoorService();
    return this.casdoor;
  }

  // --- role_mappings queries (absorbed from role-mapping-repo.ts) -----------

  /**
   * Load all role mappings from the database — the single source of truth
   * for role permissions. The auth middleware uses this to expand a user's
   * IDP roles into a set of granted permission patterns.
   * Returns a map of idp_role → { permissions, is_admin, label_key }.
   */
  async loadAllMappings(): Promise<Map<string, { permissions: string[]; is_admin: boolean; label_key?: string }>> {
    const rows = await this.dal.findAll<RoleMappingEntity, RoleMappingRow>(
      RoleMappingEntity,
      [
        Project.field(field(RoleMappingEntity, "idp_role" as any)),
        Project.field(field(RoleMappingEntity, "label_key" as any)),
        Project.field(field(RoleMappingEntity, "permissions" as any)),
        Project.field(field(RoleMappingEntity, "is_admin" as any)),
      ],
    );
    const list = rows as RoleMappingRow[];

    const map = new Map<string, { permissions: string[]; is_admin: boolean; label_key?: string }>();
    for (const row of list) {
      map.set(row.idp_role, {
        permissions: row.permissions || [],
        is_admin: row.is_admin || false,
        label_key: row.label_key,
      });
    }

    return map;
  }

  /**
   * List all role mappings with the full row shape (for the CRUD router).
   * Sorted by idp_role ascending.
   */
  async listAllDetailed(): Promise<RoleMappingDetailed[]> {
    const rows = await this.dal.findAll<RoleMappingEntity, RoleMappingDetailed>(
      RoleMappingEntity,
      ROLE_MAPPING_PROJECTED_FIELDS,
      {
        sorting: [Sort.by(field(RoleMappingEntity, "idp_role" as any), "ASC")],
      },
    );
    return (rows as RoleMappingDetailed[]) ?? [];
  }

  /**
   * Find a single role mapping by idp_role (full row shape).
   * Returns null when not found (does NOT throw).
   */
  async findByIdpRole(idpRole: string): Promise<RoleMappingDetailed | null> {
    const row = await this.dal.find<RoleMappingEntity, RoleMappingDetailed>(
      RoleMappingEntity,
      ROLE_MAPPING_PROJECTED_FIELDS,
      {
        filters: [Filter.fieldValue(field(RoleMappingEntity, "idp_role" as any), "=", idpRole)],
        throwIfNotFound: false,
      },
    );
    return (row as RoleMappingDetailed | null) ?? null;
  }

  /**
   * Find a single role mapping by uuid (full row shape).
   * Returns null when not found (does NOT throw).
   */
  async findByUuid(uuid: string): Promise<RoleMappingDetailed | null> {
    const row = await this.dal.find<RoleMappingEntity, RoleMappingDetailed>(
      RoleMappingEntity,
      ROLE_MAPPING_PROJECTED_FIELDS,
      {
        filters: [Filter.fieldValue(field(RoleMappingEntity, "uuid" as any), "=", uuid)],
        throwIfNotFound: false,
      },
    );
    return (row as RoleMappingDetailed | null) ?? null;
  }

  getAuditPort(): EntityAuditPort {
    return this.auditPort;
  }

  /**
   * Create a role mapping — caller expects the row to be absent.
   * A conflict raises a unique violation: visible, correct.
   */
  async createMapping(
    idpRole: string,
    permissions: string[],
    isAdmin: boolean,
    labelKey?: string,
    extras?: { idp_org?: string; last_synced_at?: Date; actor?: string; tx?: Repository }
  ): Promise<void> {
    const repo = extras?.tx ?? this.dal;
    await repo.add(
      RoleMappingEntity,
      {
        idp_role: idpRole,
        idp_org: extras?.idp_org,
        label_key: labelKey,
        permissions,
        is_admin: isAdmin,
        last_synced_at: extras?.last_synced_at,
      },
      { actor: extras?.actor ?? "system", audit: new EntityAuditPort(repo) }
    );
    if (!extras?.tx) await this.invalidateRoleMappingsCache();
  }

  /**
   * Update a role mapping — `version` is the caller's observed version
   * (client-provided on API paths; optimistic concurrency guard).
   */
  async updateMapping(
    uuid: string,
    permissions: string[],
    isAdmin: boolean,
    labelKey: string | undefined,
    version: number,
    extras?: { last_synced_at?: Date; actor?: string; tx?: Repository }
  ): Promise<void> {
    const repo = extras?.tx ?? this.dal;
    await repo.update(
      RoleMappingEntity,
      {
        uuid,
        label_key: labelKey,
        permissions,
        is_admin: isAdmin,
        last_synced_at: extras?.last_synced_at,
        version,
      },
      { actor: extras?.actor ?? "system", matchBy: "uuid" as any, audit: new EntityAuditPort(repo) }
    );
    if (!extras?.tx) await this.invalidateRoleMappingsCache();
  }

  /**
   * Public cache invalidation — for callers that ran writes inside a
   * transaction (invalidation must happen post-commit).
   */
  async invalidateMappingsCache(): Promise<void> {
    await this.invalidateRoleMappingsCache();
  }

  /**
   * Delete a role mapping.
   */
  async deleteMapping(uuid: string, actor?: string, version?: number): Promise<void> {
    await this.dal.hardDelete(
      RoleMappingEntity,
      { uuid, version },
      { actor: actor ?? "system", matchBy: "uuid", audit: this.auditPort }
    );
    await this.invalidateRoleMappingsCache();
  }

  /**
   * Invalidate the role_mappings Redis cache after a write.
   * Best-effort — if Redis is down, the cache TTL (5 min) bounds staleness.
   */
  private async invalidateRoleMappingsCache(): Promise<void> {
    const port = getCachePort();
    if (port) {
      try {
        await port.del(ROLE_MAPPINGS_CACHE_KEY);
      } catch (e) {
        logger.warn(`role_mappings invalidate failed: ${e}`, { tags: ["auth"] });
      }
    }
  }

  /**
   * Access-axis guard — `access.*` grants carry illegality rules a plain
   * permission string cannot express: `access`/`access.*` are banned
   * outright, bare namespaces mean nothing, and an exact leaf must name
   * a REAL leaf from the derived inventory. Enforced here — the single
   * API write funnel — so an illegal grant can never be persisted.
   */
  private async assertAccessGrantsLegal(permissions: string[]): Promise<void> {
    const accessGrants = permissions.filter(
      (p) => p === "access" || p.startsWith("access."),
    );
    if (accessGrants.length === 0) return;
    const leafKeys = await collectAccessLeafKeys();
    const illegal = accessGrants.filter((g) => !isAccessGrantLegal(g, leafKeys));
    if (illegal.length === 0) return;
    throw new ApiError(
      "/errors/validation",
      "Illegal access grant",
      422,
      `Access grants must be an exact existing leaf or a scoped wildcard ('access.<path>.*') — rejected: ${illegal.join(", ")}`,
      {
        instance: "/api/v1/entities/role_mapping",
        internal_code: "ILLEGAL_ACCESS_GRANT",
        severity: "MEDIUM",
      },
    );
  }

  // --- Create ---------------------------------------------------------------

  async createRole(input: CreateRoleInput, actor: string, tx?: Repository): Promise<RoleMappingDetailed> {
    const { idp_role, idp_org, label_key, is_admin, permissions } = input;

    // 0. Access-axis grants must be legal before any side effect.
    await this.assertAccessGrantsLegal(permissions);

    // 1. Casdoor must be configured.
    const cd = await this.getCasdoor().getClient();
    if (!cd) {
      throw new ApiError(
        "/errors/service-unavailable",
        "Casdoor™ not configured",
        503,
        "Casdoor™ is not configured; cannot create role via API. Configure idp_client_id and idp_client_secret to enable role management.",
        {
          instance: "/api/v1/entities/role_mapping",
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
          instance: "/api/v1/entities/role_mapping",
          internal_code: "ROLE_ALREADY_EXISTS_CASDOOR",
          severity: "MEDIUM",
        },
      );
    }

    // 3. Also check local DB (a local row without a Casdoor role is a stale seed).
    const existingLocal = await this.findByIdpRole(idp_role);
    if (existingLocal) {
      throw new ApiError(
        "/errors/conflict",
        "Role already exists",
        409,
        `A role mapping with idp_role "${idp_role}" already exists in the local database.`,
        {
          instance: "/api/v1/entities/role_mapping",
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
          instance: "/api/v1/entities/role_mapping",
          internal_code: "CASDOOR_ADD_ROLE_FAILED",
          severity: "HIGH",
        },
      );
    }

    // 5. Create in local DB.
    const now = new Date();
    await this.createMapping(idp_role, permissions, is_admin, label_key, {
      idp_org,
      last_synced_at: now,
      actor,
      tx,
    });

    // 6. Return the created row.
    const row = await this.findByIdpRole(idp_role);
    if (!row) {
      throw new NotFoundError("Role not found after create", {
        internal_code: "ROLE_NOT_FOUND_AFTER_CREATE",
      });
    }
    return row;
  }

  // --- Update ---------------------------------------------------------------

  /**
   * Update a role mapping — takes the ALREADY-LOADED row (the ByUuid wrapper
   * fetches by uuid once). `existing.idp_role`/`idp_org` feed the Casdoor
   * identity; the local write matches by `uuid`.
   */
  async updateRole(existing: RoleMappingDto, input: UpdateRoleInput, actor: string, tx?: Repository): Promise<RoleMappingDetailed> {
    const { label_key, is_admin, permissions } = input;
    const idpRole = existing.idp_role;

    // 1. Access-axis grants must be legal before any side effect.
    await this.assertAccessGrantsLegal(permissions ?? []);

    // 2. Casdoor must be configured.
    const cd = await this.getCasdoor().getClient();
    if (!cd) {
      throw new ApiError(
        "/errors/service-unavailable",
        "Casdoor™ not configured",
        503,
        "Casdoor™ is not configured; cannot update role via API. Configure idp_client_id and idp_client_secret to enable role management.",
        {
          instance: `/api/v1/entities/role_mapping/${idpRole}`,
          internal_code: "CASDOOR_NOT_CONFIGURED",
          severity: "MEDIUM",
        },
      );
    }

    // 3. Resolve the Casdoor owner: existing.idp_org, or fallback to cfg.idp_organization.
    const cfg = await getAuthConfig();
    const owner = existing.idp_org || cfg.idp_organization!;
    if (!owner) {
      throw new ApiError(
        "/errors/internal-error",
        "Cannot resolve Casdoor™ owner",
        500,
        `Role "${idpRole}" has no idp_org and idp_organization is not configured. Cannot sync to Casdoor™.`,
        {
          instance: `/api/v1/entities/role_mapping/${idpRole}`,
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
          instance: `/api/v1/entities/role_mapping/${idpRole}`,
          internal_code: "CASDOOR_SYNC_FAILED",
          severity: "HIGH",
        },
      );
    }

    // 5. Update local DB — matched by uuid; guarded by the caller's observed
    // version (client).
    const now = new Date();
    await this.updateMapping(
      existing.uuid,
      permissions ?? existing.permissions,
      is_admin ?? existing.is_admin,
      label_key ?? existing.label_key,
      input.version!,
      {
        last_synced_at: now,
        actor,
        tx,
      },
    );

    // 6. Return the updated row.
    const row = await this.findByUuid(existing.uuid);
    if (!row) {
      throw new NotFoundError("Role not found after update", {
        internal_code: "ROLE_NOT_FOUND_AFTER_UPDATE",
      });
    }
    return row;
  }

  // --- Delete ---------------------------------------------------------------

  /**
   * Delete a role mapping — takes the ALREADY-LOADED row (fetched by uuid).
   * `idp_role`/`idp_org` drive the Casdoor delete; the local hard-delete
   * matches by `uuid`.
   */
  async deleteRole(existing: RoleMappingDto, actor: string, version: number): Promise<void> {
    const idpRole = existing.idp_role;

    // 2. Casdoor must be configured.
    const cd = await this.getCasdoor().getClient();
    if (!cd) {
      throw new ApiError(
        "/errors/service-unavailable",
        "Casdoor™ not configured",
        503,
        "Casdoor™ is not configured; cannot delete role via API. Configure idp_client_id and idp_client_secret to enable role management.",
        {
          instance: `/api/v1/entities/role_mapping/${idpRole}`,
          internal_code: "CASDOOR_NOT_CONFIGURED",
          severity: "MEDIUM",
        },
      );
    }

    // 3. Resolve the Casdoor owner.
    const cfg = await getAuthConfig();
    const owner = existing.idp_org || cfg.idp_organization!;
    if (!owner) {
      throw new ApiError(
        "/errors/internal-error",
        "Cannot resolve Casdoor™ owner",
        500,
        `Role "${idpRole}" has no idp_org and idp_organization is not configured. Cannot sync to Casdoor™.`,
        {
          instance: `/api/v1/entities/role_mapping/${idpRole}`,
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
          instance: `/api/v1/entities/role_mapping/${idpRole}`,
          internal_code: "CASDOOR_DELETE_FAILED",
          severity: "HIGH",
        },
      );
    }

    // 5. Delete in local DB — matched by uuid; version is the
    // caller-observed version (optimistic concurrency guard).
    await this.deleteMapping(existing.uuid, actor, version);
  }

  // --- Entity-pattern methods (keyed by uuid) -------------------------------
  // These back the `/api/v1/entities/role_mapping/...` endpoints used by the
  // FE EntityListTable. The ByUuid handlers fetch the row once and delegate
  // to the Casdoor-coupled flows above, which take the loaded row:
  // `idp_role`/`idp_org` feed the IdP-side identity, while every LOCAL write
  // matches by `uuid` (the canonical wire identity).

  async listRoleMappings(query: RoleMappingListQuery): Promise<RoleMappingListResponse> {
    return this.svc.list({ ...query, sort_key: query.sort_key ?? undefined }) as Promise<RoleMappingListResponse>;
  }

  async getRoleByUuid(uuid: string): Promise<RoleMappingDto> {
    const role = await this.svc.get(uuid);
    if (!role) {
      throw new NotFoundError(`Role with uuid "${uuid}" not found`, {
        internal_code: "ROLE_NOT_FOUND",
      });
    }
    return role;
  }

  async updateRoleByUuid(uuid: string, input: UpdateRoleInput, actor: string, tx?: Repository): Promise<RoleMappingDetailed> {
    const existing = await this.getRoleByUuid(uuid);
    return this.updateRole(existing, input, actor, tx);
  }

  async deleteRoleByUuid(uuid: string, actor: string, version: number): Promise<RoleMappingDto> {
    const existing = await this.getRoleByUuid(uuid);
    await this.deleteRole(existing, actor, version);
    return existing;
  }

  async getRoleAudit(uuid: string, page: number, limit: number) {
    // Verify the role exists (404 if not).
    await this.getRoleByUuid(uuid);
    return this.svc.audit(uuid, page, limit);
  }
}

let instance: RoleService | undefined;

/**
 * Lazy singleton accessor — the first call happens inside request handling,
 * always post-bootstrap, so `getDal()` is already initialized. A module-level
 * `new` would crash the import graph before `initDal()` runs.
 */
export function getRoleService(): RoleService {
  return (instance ??= new RoleService());
}
