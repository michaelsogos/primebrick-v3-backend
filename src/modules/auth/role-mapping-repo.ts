import type { Pool } from "pg";
import {
  Repository,
  Project,
  field,
  Filter,
  Sort,
  entityDateToApiIso,
  type FilterExpr,
} from "@primebrick/dal-pg";
import { RoleMappingEntity } from "./role_mapping_entity.js";
import { UserProfileEntity } from "./user_profile_entity.js";
import { buildAuditableJoinsSelective } from "@primebrick/dal-pg";
import { BeAuditPortAdapter } from "../../db/audit-port-adapter.js";
import { findAuditPage } from "../../db/audit-query-helper.js";
import type { AuditService } from "../../lib/audit/audit-service.js";

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

function toDto(r: RoleMappingDetailed): RoleMappingDto {
  const { id: _id, ...rest } = r;
  return {
    ...rest,
    created_at: entityDateToApiIso(r.created_at),
    updated_at: entityDateToApiIso(r.updated_at),
    last_synced_at: r.last_synced_at ? entityDateToApiIso(r.last_synced_at) : undefined,
  };
}

/**
 * Repository for loading role-to-permission mappings from the database.
 *
 * This is the single source of truth for role permissions. The auth middleware
 * uses this to expand a user's IDP roles into a set of granted permission patterns.
 */
export class RoleMappingRepo {
  private repo: Repository;
  private auditPort: BeAuditPortAdapter;

  constructor(pool: Pool, _auditService?: AuditService) {
    this.repo = new Repository(pool);
    this.auditPort = new BeAuditPortAdapter(this.repo);
  }

  /**
   * Load all role mappings from the database.
   * Returns a map of idp_role → { permissions, is_admin, label_key }.
   */
  async loadAllMappings(): Promise<Map<string, { permissions: string[]; is_admin: boolean; label_key?: string }>> {
    const rows = await this.repo.findAll<RoleMappingEntity, RoleMappingRow>(
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
    const rows = await this.repo.findAll<RoleMappingEntity, RoleMappingDetailed>(
      RoleMappingEntity,
      [
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
      ],
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
    const row = await this.repo.find<RoleMappingEntity, RoleMappingDetailed>(
      RoleMappingEntity,
      [
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
      ],
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
    const row = await this.repo.find<RoleMappingEntity, RoleMappingDetailed>(
      RoleMappingEntity,
      [
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
      ],
      {
        filters: [Filter.fieldValue(field(RoleMappingEntity, "uuid" as any), "=", uuid)],
        throwIfNotFound: false,
      },
    );
    return (row as RoleMappingDetailed | null) ?? null;
  }

  /**
   * Paginated list with search/sort/filter — mirrors OrganizationsDal.listOrganizations.
   * Uses the generic DAL `findByPage` helper. Hard delete only (no deletedRecords).
   */
  async listPaged(query: RoleMappingListQuery): Promise<RoleMappingListResponse> {
    const {
      search,
      search_in,
      sort_key,
      sort_dir = "asc",
      page = 1,
      page_size = 25,
      filters,
      connector = "AND",
    } = query;

    const baseFilters: FilterExpr[] = [];

    // Search filter
    if (search && search.trim()) {
      const searchFields = search_in && search_in.length > 0 ? search_in : ["idp_role", "idp_org", "label_key"];
      const searchFilters = searchFields.map((f) =>
        Filter.fieldValue(field(RoleMappingEntity, f as any), "ILIKE", `%${search}%`)
      );
      baseFilters.push(Filter.group(searchFilters, "OR"));
    }

    // Custom filters
    if (filters && filters.length > 0) {
      const translated = this.translateFilterConditions(filters, connector);
      if (translated) {
        baseFilters.push(...translated);
      }
    }

    const sort_key_final = (sort_key ?? "idp_role") as keyof RoleMappingDetailed & string;
    const sort_dir_final = (sort_dir ?? "asc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sorting = [Sort.by(field(RoleMappingEntity, sort_key_final as any), sort_dir_final as any)];

    const result = await this.repo.findByPage<RoleMappingDetailed, RoleMappingDetailed>(
      RoleMappingEntity,
      page,
      page_size,
      null,
      {
        filters: baseFilters.length > 0 ? baseFilters : undefined,
        sorting,
        joins: buildAuditableJoinsSelective(RoleMappingEntity, UserProfileEntity, { includeDeleter: false }),
      }
    );

    return {
      rows: (result.entities as RoleMappingDetailed[]).map((r) => toDto(r)),
      page,
      page_size,
      total: result.total_records,
    };
  }

  /**
   * Audit history for a single role mapping (by uuid).
   * Mirrors OrganizationsDal.getOrganizationAudit.
   */
  async getRoleAudit(uuid: string, page: number, limit: number) {
    const result = await findAuditPage(this.repo, {
      tableName: "role_mappings_audit",
      entityUuid: uuid,
      page,
      limit,
    });

    return {
      data: result.data.map((row) => ({
        id: row.id.toString(),
        entity_uuid: row.entity_uuid,
        action: row.action,
        changed_at: row.changed_at,
        changed_by: row.changed_by,
        changed_by_name: row.changed_by_display_name,
        version: row.version,
        delta: row.delta,
      })),
      pagination: result.pagination,
    };
  }

  getAuditPort(): BeAuditPortAdapter {
    return this.auditPort;
  }

  private translateFilterConditions(
    conditions: Array<{ field: string; op: string; value: unknown; connector?: "AND" | "OR" }>,
    connector: "AND" | "OR" = "AND"
  ): FilterExpr[] | null {
    if (!conditions || conditions.length === 0) return null;
    const validOps = new Set(["=", "!=", "<>", "<", "<=", ">=", ">=", "ILIKE", "LIKE", "IN", "NOT IN", "IS", "IS NOT"]);
    const allowedFields = new Set(["idp_role", "idp_org", "label_key", "is_admin"]);

    const filterExprs: FilterExpr[] = [];
    for (const cond of conditions) {
      if (!validOps.has(cond.op)) continue;
      if (!allowedFields.has(cond.field)) continue;

      let value = cond.value;
      if ((cond.op === "ILIKE" || cond.op === "LIKE") && typeof value === "string") {
        if (!value.includes("%")) {
          value = `%${value}%`;
        }
      }

      if ((cond.op === "IN" || cond.op === "NOT IN") && Array.isArray(value)) {
        filterExprs.push(
          Filter.fieldValue(field(RoleMappingEntity, cond.field as any), cond.op as any, value, cond.connector)
        );
      } else {
        filterExprs.push(
          Filter.fieldValue(field(RoleMappingEntity, cond.field as any), cond.op as any, value, cond.connector)
        );
      }
    }

    if (filterExprs.length === 0) return null;
    if (filterExprs.length === 1) return [Filter.group(filterExprs, "AND")];
    return [Filter.group([Filter.group(filterExprs, connector)], "AND")];
  }

  /**
   * Create or update a role mapping.
   * Pass `idp_org` and `last_synced_at` for Casdoor-synced roles.
   */
  async upsertMapping(
    idpRole: string,
    permissions: string[],
    isAdmin: boolean,
    labelKey?: string,
    extras?: { idp_org?: string; last_synced_at?: Date; actor?: string }
  ): Promise<void> {
    await this.repo.upsert(
      RoleMappingEntity,
      {
        idp_role: idpRole,
        idp_org: extras?.idp_org,
        label_key: labelKey,
        permissions,
        is_admin: isAdmin,
        last_synced_at: extras?.last_synced_at,
      },
      { actor: extras?.actor ?? "system", conflictTarget: "idp_role" }
    );
  }

  /**
   * Delete a role mapping.
   */
  async deleteMapping(idpRole: string, actor?: string): Promise<void> {
    await this.repo.hardDelete(
      RoleMappingEntity,
      { idp_role: idpRole },
      { actor: actor ?? "system", matchBy: "idp_role" }
    );
  }
}
