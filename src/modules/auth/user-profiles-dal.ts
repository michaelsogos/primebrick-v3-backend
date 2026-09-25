import type { Pool, PoolClient } from "pg";

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
import { requireActor } from "@primebrick/sdk";
import { BeAuditPortAdapter } from "../../db/audit-port-adapter.js";
import { findAuditPage } from "../../db/audit-query-helper.js";
import { createRepository } from "../../db/repository-factory.js";
import { deriveSearchableKeys } from "../../lib/search-keys.js";
import { userProfileMeta } from "./user-profiles.meta.js";

const DEFAULT_SEARCH_KEYS = deriveSearchableKeys(userProfileMeta, UserProfileEntity);
const SEARCH_IN_ALLOWED = new Set([...DEFAULT_SEARCH_KEYS, "uuid"]);

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
    this.repo = createRepository(pool);
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
    body: { display_name?: string; email?: string; avatar_color?: string; is_active?: boolean; is_admin?: boolean; is_verified?: boolean; email_verified?: boolean; issuer?: string; roles?: string[]; last_synced_at?: Date; idp_code?: string; auth_method_enforcer_dismissed?: boolean; onboarding_completed?: boolean; version?: number },
    tx?: PoolClient
  ): Promise<UserProfileDetailDto> {
    const repo = tx ? new Repository(tx) : this.repo;
    // API path: `body.version` is the caller-observed version. If absent the
    // Repository.update() version guard throws ERR02 — we NEVER manufacture a
    // version by re-reading the row (that would elide the concurrency check).
    const row = await repo.update<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { ...body, uuid },
      { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    return this.toDto(row);
  }

  /**
   * INTERNAL write path — session/Casdoor sync stamps that do not carry a
   * caller-observed version. Reads the current row version DB-first, then
   * updates. NEVER call this from an API route.
   */
  async updateProfileInternal(
    uuid: string,
    body: { display_name?: string; email?: string; avatar_color?: string; is_active?: boolean; is_admin?: boolean; is_verified?: boolean; email_verified?: boolean; issuer?: string; roles?: string[]; last_synced_at?: Date; idp_code?: string; auth_method_enforcer_dismissed?: boolean; onboarding_completed?: boolean },
    tx?: PoolClient
  ): Promise<UserProfileDetailDto> {
    const repo = tx ? new Repository(tx) : this.repo;
    const version = (await this.freshRowByUuid(uuid, repo))!.version;
    const row = await repo.update<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { ...body, uuid, version },
      { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    return this.toDto(row);
  }

  /**
   * Update a user profile by its numeric id (alternative to `updateProfile` which
   * uses uuid). Used by flows that have the `id` from a foreign key (e.g.
   * `invitation.user_profile_id`).
   */
  async updateProfileById(
    id: bigint | number,
    body: { display_name?: string; email?: string; avatar_color?: string; is_active?: boolean; is_admin?: boolean; is_verified?: boolean; email_verified?: boolean; issuer?: string; roles?: string[]; last_synced_at?: Date; idp_code?: string; auth_method_enforcer_dismissed?: boolean; onboarding_completed?: boolean; version?: number }
  ): Promise<UserProfileDetailDto> {
    // Internal FK-driven write — the read below is the observation step of this
    // unit of work (the caller legitimately has `id`, not a prior version).
    const version = body.version ?? (await this.repo.find<UserProfileEntity, UserProfileEntity>(
      UserProfileEntity,
      null,
      { filters: [Filter.fieldValue(field(UserProfileEntity, "id" as any), "=", typeof id === "number" ? BigInt(id) : id)] as any, deletedRecords: "INCLUDED" }
    ))!.version;
    const row = await this.repo.update<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { ...body, id, version }, { actor: requireActor(), audit: this.auditPort }
    );
    return this.toDto(row);
  }

  // DB-first read — `findByUUID`/`findById` may serve a stale cached row
  // (@Cached entities) whose `version` would trip the optimistic-concurrency
  // guard (ERR01) on the write that follows.
  private async freshRowByUuid(uuid: string, repo?: Repository): Promise<UserProfileEntity> {
    return (await (repo ?? this.repo).find<UserProfileEntity, UserProfileEntity>(UserProfileEntity, null, {
      filters: [Filter.fieldValue(field(UserProfileEntity, "uuid" as any), "=", uuid)] as any,
      deletedRecords: "INCLUDED",
    }))!;
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

  async softDelete(uuid: string, version: number): Promise<UserProfileDetailDto> {
    const row = await this.repo.delete<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { uuid, version }, { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    return this.toDto(row);
  }

  async restore(uuid: string, version: number): Promise<UserProfileDetailDto> {
    const row = await this.repo.restore<UserProfileEntity, UserProfileDetailRow>(
      UserProfileEntity, { uuid, version }, { actor: requireActor(), audit: this.auditPort, matchBy: 'uuid' as any }
    );
    return this.toDto(row);
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
      const searchFields =
        search_in && search_in.length > 0
          ? search_in.filter((f) => SEARCH_IN_ALLOWED.has(f))
          : DEFAULT_SEARCH_KEYS;
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
