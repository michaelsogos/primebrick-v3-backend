import type { Pool } from "pg";

import {
  entityDateToApiIso,
  Repository,
  field, Filter, Sort, Join,
  buildAuditableJoins,
  buildAuditTrailJoins,
  AuditLogEntity, Project,
  type FilterExpr,
  type WithAuditableDisplayNames,
} from "@primebrick/dal-pg";

import { UserProfileEntity } from "./user_profile_entity.js";
import type { AuditService } from "../../lib/audit/audit-service.js";
import { requireActor } from "./session-context.js";
import { BeAuditPortAdapter } from "../../db/audit-port-adapter.js";
import { findAuditPage } from "../../db/audit-query-helper.js";

export type UserProfileDetailRow = WithAuditableDisplayNames<{
  uuid: string;
  idp_code: string;
  email?: string;
  display_name?: string;
  avatar_color?: string;
  avatar_initials?: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  email_verified: boolean;
  issuer?: string;
  roles?: string[];
  last_synced_at?: Date;
  idp_org?: string;
  idp_username?: string;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  version: number;
  deleted_at?: Date;
  deleted_by?: string;
}>;

export type UserProfileDetailDto = Omit<
  UserProfileDetailRow,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type UserListQuery = {
  search?: string;
  search_in?: string[];
  sort_key?: string | null;
  sort_dir?: "asc" | "desc";
  page?: number;
  page_size?: number;
  filters?: Array<{ field: string; op: string; value: unknown; connector?: "AND" | "OR" }>;
  connector?: "AND" | "OR";
  deleted_records?: "EXCLUDED" | "ONLY" | "INCLUDED";
};

export type UserListResponse = {
  rows: UserProfileDetailDto[];
  page: number;
  page_size: number;
  total: bigint;
};

export class UserProfilesDal {
  private repo: Repository;
  private auditPort: BeAuditPortAdapter;

  constructor(pool: Pool, _auditService?: AuditService) {
    this.repo = new Repository(pool);
    this.auditPort = new BeAuditPortAdapter(this.repo);
  }

  private toDto(r: UserProfileDetailRow): UserProfileDetailDto {
    return {
      ...r,
      created_at: entityDateToApiIso(r.created_at),
      updated_at: entityDateToApiIso(r.updated_at),
      deleted_at: r.deleted_at ? entityDateToApiIso(r.deleted_at) : undefined,
    };
  }

  async getByUuid(uuid: string): Promise<UserProfileDetailDto | null> {
    const row = await this.repo.find<any, any>(
      UserProfileEntity,
      null,
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
        joins: buildAuditableJoins(UserProfileEntity, UserProfileEntity),
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  async createProfile(data: {
    uuid: string;
    idp_code: string | null;
    email?: string | null;
    display_name?: string | null;
    idp_org?: string | null;
    idp_username?: string | null;
    avatar_color?: string;
    avatar_initials?: string;
    is_active: boolean;
    is_admin: boolean;
    is_verified: boolean;
    email_verified: boolean;
    issuer?: string | null;
    roles?: string[] | null;
    last_synced_at?: Date;
  }): Promise<void> {
    const actor = requireActor();
    await this.repo.add(
      UserProfileEntity,
      {
        uuid: data.uuid,
        idp_code: data.idp_code,
        email: data.email,
        display_name: data.display_name,
        idp_org: data.idp_org,
        idp_username: data.idp_username,
        avatar_color: data.avatar_color,
        avatar_initials: data.avatar_initials,
        is_active: data.is_active,
        is_admin: data.is_admin,
        is_verified: data.is_verified,
        email_verified: data.email_verified,
        issuer: data.issuer,
        roles: data.roles,
        last_synced_at: data.last_synced_at,
      },
      { actor, audit: this.auditPort }
    );
  }

  async updateProfile(
    uuid: string,
    body: { display_name?: string; email?: string; avatar_color?: string; is_active?: boolean; is_admin?: boolean; is_verified?: boolean; email_verified?: boolean; issuer?: string; roles?: string[]; last_synced_at?: Date; idp_code?: string }
  ): Promise<void> {
    await this.repo.update(UserProfileEntity, { ...body, uuid }, { actor: requireActor(), audit: this.auditPort });
  }

  async getByIdpCode(idpCode: string): Promise<UserProfileDetailDto | null> {
    const row = await this.repo.find<any, any>(
      UserProfileEntity,
      null,
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "idp_code" as any), "=", idpCode)] as any,
        joins: [
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "created_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "creator" }
          ),
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "updated_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "updater" }
          ),
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "deleted_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "deleter" }
          ),
        ],
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  async getByEmail(email: string): Promise<UserProfileDetailDto | null> {
    const row = await this.repo.find<any, any>(
      UserProfileEntity,
      null,
      {
        filters: [Filter.fieldValue(field(UserProfileEntity, "email" as any), "=", email)] as any,
        joins: [
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "created_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "creator" }
          ),
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "updated_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "updater" }
          ),
          Join.on(
            field(UserProfileEntity, "uuid" as any),
            field(UserProfileEntity, "deleted_by" as any),
            "LEFT",
            { castRightTo: "text", castLeftTo: "text", alias: "deleter" }
          ),
        ],
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  async softDelete(uuid: string): Promise<void> {
    await this.repo.delete(UserProfileEntity, { uuid }, { actor: requireActor(), audit: this.auditPort });
  }

  async restore(uuid: string): Promise<void> {
    await this.repo.restore(UserProfileEntity, { uuid }, { actor: requireActor(), audit: this.auditPort });
  }

  private enrichAuditDeltaWithDisplayNames(
    delta: Record<string, any>,
    changedByName: string | null
  ): Record<string, any> {
    const enriched = { ...delta };
    const auditFields = ['created_by', 'updated_by', 'deleted_by'];

    for (const f of auditFields) {
      if (f in enriched) {
        const change = enriched[f];

        // Add display_name alongside GUID if available
        if (changedByName && this.isUuid(change.new)) {
          change.new_display_name = changedByName;
        }
        if (changedByName && this.isUuid(change.old)) {
          change.old_display_name = changedByName;
        }
      }
    }

    return enriched;
  }

  private isUuid(value: any): boolean {
    return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
  }

  async getUserProfileAudit(uuid: string, page: number, limit: number) {
    const result = await findAuditPage(this.repo, {
      tableName: "user_profiles_audit",
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
        delta: this.enrichAuditDeltaWithDisplayNames(row.delta as Record<string, any>, row.changed_by_display_name),
      })),
      pagination: result.pagination,
    };
  }

  async listUsers(query: UserListQuery): Promise<UserListResponse> {
    const {
      search,
      search_in,
      sort_key,
      sort_dir = "asc",
      page = 1,
      page_size = 25,
      filters,
      connector = "AND",
      deleted_records = "EXCLUDED",
    } = query;

    // Build base filters
    const baseFilters: FilterExpr[] = [];

    // Deletion filter
    if (deleted_records === "ONLY") {
      baseFilters.push(Filter.fieldValue(field(UserProfileEntity, "deleted_at" as any), "IS NOT", null));
    } else if (deleted_records === "EXCLUDED") {
      baseFilters.push(Filter.fieldValue(field(UserProfileEntity, "deleted_at" as any), "IS", null));
    }

    // Search filter
    if (search && search.trim()) {
      const searchFields = search_in && search_in.length > 0 ? search_in : ["display_name", "email", "idp_code"];
      const searchFilters = searchFields.map((f) =>
        Filter.fieldValue(field(UserProfileEntity, f as any), "ILIKE", `%${search}%`)
      );
      baseFilters.push(Filter.group(searchFilters, "OR"));
    }

    // Custom filters
    if (filters && filters.length > 0) {
      const translatedFilters = this.translateFilterConditions(filters, connector);
      if (translatedFilters) {
        baseFilters.push(...translatedFilters);
      }
    }

    const sort_key_final = (sort_key ?? "created_at") as keyof UserProfileDetailRow & string;
    const sort_dir_final = (sort_dir ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sorting = [Sort.by(field(UserProfileEntity, sort_key_final as any), sort_dir_final as any)];

    const result = await this.repo.findByPage<UserProfileDetailRow, UserProfileDetailRow>(
      UserProfileEntity,
      page,
      page_size,
      null,
      {
        filters: baseFilters.length > 0 ? baseFilters : undefined,
        sorting,
        deletedRecords: deleted_records as any,
        joins: buildAuditableJoins(UserProfileEntity, UserProfileEntity),
      }
    );

    return {
      rows: result.entities.map((r) => this.toDto(r)),
      page,
      page_size,
      total: result.total_records,
    };
  }

  private translateFilterConditions(
    conditions: Array<{ field: string; op: string; value: unknown; connector?: "AND" | "OR" }>,
    connector: "AND" | "OR" = "AND"
  ): FilterExpr[] | null {
    if (!conditions || conditions.length === 0) return null;

    const validOps = new Set(["=", "!=", "<>", "<", "<=", ">=", ">=", "ILIKE", "LIKE", "IN", "NOT IN", "IS", "IS NOT"]);
    const allowedFields = new Set(["display_name", "email", "idp_code", "idp_username", "idp_org", "is_active", "is_admin", "is_verified"]);

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
          Filter.fieldValue(field(UserProfileEntity, cond.field as any), cond.op as any, value, cond.connector)
        );
      } else {
        filterExprs.push(
          Filter.fieldValue(field(UserProfileEntity, cond.field as any), cond.op as any, value, cond.connector)
        );
      }
    }

    if (filterExprs.length === 0) return null;

    if (filterExprs.length === 1) {
      return [Filter.group(filterExprs, "AND")];
    }

    return [Filter.group([Filter.group(filterExprs, connector)], "AND")];
  }
}
