import type { Pool } from "pg";

import { entityDateToApiIso } from "../../domain/entities/entity-meta.js";
import { Repository } from "../../db/repository/repository.js";
import { field, Filter, Sort, Join, type FilterExpr } from "../../db/repository/dsl.js";
import { buildAuditableJoins } from "../../db/repository/auditable-joins.js";
import { WithAuditableDisplayNames } from "../../db/repository/auditable-types.js";
import { getAuditUserJoinSql, getAuditSelectWithDisplayName } from "../../db/repository/audit-join-helper.js";

import { UserProfileEntity } from "./user_profile_entity.js";
import type { AuditService } from "../../lib/audit/audit-service.js";
import { requireActor } from "./session-context.js";

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
  total: number;
};

export class UserProfilesDal {
  private repo: Repository;
  private pool: Pool;

  constructor(pool: Pool, auditService?: AuditService) {
    this.repo = new Repository(pool, auditService);
    this.pool = pool;
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
        joins: buildAuditableJoins(UserProfileEntity),
      }
    );
    return row ? this.toDto(row) : null;
  }

  async updateProfile(
    uuid: string,
    body: { display_name?: string; email?: string; avatar_color?: string; is_active?: boolean; is_admin?: boolean; is_verified?: boolean; email_verified?: boolean; issuer?: string; roles?: string[]; last_synced_at?: Date; idp_code?: string }
  ): Promise<void> {
    await this.repo.update(UserProfileEntity, uuid, body, requireActor());
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
      }
    );
    return row ? this.toDto(row) : null;
  }

  async getByUsernameAndOrg(username: string, idpOrg: string): Promise<UserProfileDetailDto | null> {
    const result = await this.pool.query(
      `SELECT * FROM public.user_profiles WHERE idp_username = $1 AND idp_org = $2 AND deleted_at IS NULL LIMIT 1`,
      [username, idpOrg]
    );
    if (result.rows.length === 0) return null;
    return this.toDto(result.rows[0]);
  }

  async softDelete(uuid: string): Promise<void> {
    await this.repo.delete(UserProfileEntity, uuid, requireActor());
  }

  async restore(uuid: string): Promise<void> {
    await this.repo.restore(UserProfileEntity, uuid, requireActor());
  }

  private enrichAuditDeltaWithDisplayNames(
    delta: Record<string, any>,
    changedByName: string | null
  ): Record<string, any> {
    const enriched = { ...delta };
    const auditFields = ['created_by', 'updated_by', 'deleted_by'];
    
    for (const field of auditFields) {
      if (field in enriched) {
        const change = enriched[field];
        
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
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM public.user_profiles_audit
      WHERE entity_uuid = $1
    `;

    const countResult = await this.pool.query(countQuery, [uuid]);
    const total = parseInt(countResult.rows[0].total, 10);

    const query = `
      SELECT ${getAuditSelectWithDisplayName()}
      FROM public.user_profiles_audit audit
      ${getAuditUserJoinSql()}
      WHERE audit.entity_uuid = $1
      ORDER BY audit.changed_at DESC, audit.id DESC
      LIMIT $2 OFFSET $3
    `;

    console.log('[User Profile Audit] SQL Query:', query);
    console.log('[User Profile Audit] Parameters:', [uuid, limit, offset]);

    const result = await this.pool.query(query, [uuid, limit, offset]);

    return {
      data: result.rows.map((row: any) => ({
        id: row.id.toString(),
        entity_uuid: row.entity_uuid,
        action: row.action,
        changed_at: row.changed_at.toISOString(),
        changed_by: row.changed_by,
        changed_by_name: row.changed_by_name,
        version: row.version,
        delta: this.enrichAuditDeltaWithDisplayNames(row.delta, row.changed_by_name),
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total,
      },
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
        joins: buildAuditableJoins(UserProfileEntity),
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
    const allowedFields = new Set(["display_name", "email", "idp_code", "is_active", "is_admin", "is_verified"]);

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
