import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import {
  entityDateToApiIso,
  Repository,
  field, Filter, Sort, Join, Project,
  buildAuditableJoins,
  type FilterExpr,
  type WithAuditableDisplayNames,
} from "@primebrick/dal-pg";

import { OrganizationEntity } from "./organization_entity.js";
import { UserProfileEntity } from "./user_profile_entity.js";
import type { AuditService } from "../../lib/audit/audit-service.js";
import { requireActor } from "@primebrick/sdk";
import { BeAuditPortAdapter } from "../../db/audit-port-adapter.js";
import { findAuditPage } from "../../db/audit-query-helper.js";
import { createRepository } from "../../db/repository-factory.js";

export type OrganizationDetailRow = WithAuditableDisplayNames<{
  uuid: string;
  idp_code: string;
  idp_owner?: string;
  idp_name?: string;
  display_name?: string;
  website_url?: string;
  avatar?: string;
  last_synced_at?: Date;
  user_count?: number;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  version: number;
  deleted_at?: Date;
  deleted_by?: string;
}>;

export type OrganizationDetailDto = Omit<
  OrganizationDetailRow,
  "created_at" | "updated_at" | "deleted_at" | "last_synced_at"
> & {
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  last_synced_at?: string;
};

export type OrganizationListQuery = {
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

export type OrganizationListResponse = {
  rows: OrganizationDetailDto[];
  page: number;
  page_size: number;
  total: bigint;
};

export class OrganizationsDal {
  private repo: Repository;
  private auditPort: BeAuditPortAdapter;

  constructor(pool: Pool, _auditService?: AuditService) {
    this.repo = createRepository(pool);
    this.auditPort = new BeAuditPortAdapter(this.repo);
  }

  private toDto(r: OrganizationDetailRow): OrganizationDetailDto {
    return {
      ...r,
      created_at: entityDateToApiIso(r.created_at),
      updated_at: entityDateToApiIso(r.updated_at),
      deleted_at: r.deleted_at ? entityDateToApiIso(r.deleted_at) : undefined,
      last_synced_at: r.last_synced_at ? entityDateToApiIso(r.last_synced_at) : undefined,
    };
  }

  async getByUuid(uuid: string): Promise<OrganizationDetailDto | null> {
    const row = await this.repo.find<any, any>(
      OrganizationEntity,
      null,
      {
        filters: [Filter.fieldValue(field(OrganizationEntity, "uuid" as any), "=", uuid)] as any,
        joins: buildAuditableJoins(OrganizationEntity, UserProfileEntity),
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  async getByIdpCode(idpCode: string): Promise<OrganizationDetailDto | null> {
    const row = await this.repo.find<any, any>(
      OrganizationEntity,
      null,
      {
        filters: [Filter.fieldValue(field(OrganizationEntity, "idp_code" as any), "=", idpCode)] as any,
        joins: buildAuditableJoins(OrganizationEntity, UserProfileEntity),
        throwIfNotFound: false,
      }
    );
    return row ? this.toDto(row) : null;
  }

  async listOrganizations(query: OrganizationListQuery): Promise<OrganizationListResponse> {
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
      baseFilters.push(Filter.fieldValue(field(OrganizationEntity, "deleted_at" as any), "IS NOT", null));
    } else if (deleted_records === "EXCLUDED") {
      baseFilters.push(Filter.fieldValue(field(OrganizationEntity, "deleted_at" as any), "IS", null));
    }

    // Search filter
    if (search && search.trim()) {
      const searchFields = search_in && search_in.length > 0 ? search_in : ["display_name", "idp_code"];
      const searchFilters = searchFields.map((f) =>
        Filter.fieldValue(field(OrganizationEntity, f as any), "ILIKE", `%${search}%`)
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

    const sort_key_final = (sort_key ?? "created_at") as keyof OrganizationDetailRow & string;
    const sort_dir_final = (sort_dir ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sorting = [Sort.by(field(OrganizationEntity, sort_key_final as any), sort_dir_final as any)];

    const result = await this.repo.findByPage<OrganizationDetailRow, OrganizationDetailRow>(
      OrganizationEntity,
      page,
      page_size,
      null,
      {
        filters: baseFilters.length > 0 ? baseFilters : undefined,
        sorting,
        deletedRecords: deleted_records as any,
        joins: buildAuditableJoins(OrganizationEntity, UserProfileEntity),
      }
    );

    // Add user count for each row
    const rowsWithCount = await Promise.all(
      result.entities.map(async (row: OrganizationDetailRow) => {
        const userCount = await this.getUserCountForOrganization(row.idp_code);
        return { ...row, user_count: userCount };
      })
    );

    return {
      rows: rowsWithCount.map((r) => this.toDto(r)),
      page,
      page_size,
      total: result.total_records,
    };
  }

  async createOrganization(data: {
    idp_code: string;
    idp_owner?: string;
    idp_name?: string;
    display_name?: string;
    website_url?: string;
  }): Promise<{ uuid: string }> {
    const uuid = randomUUID();
    const actor = requireActor();

    await this.repo.add(
      OrganizationEntity,
      {
        uuid,
        idp_code: data.idp_code,
        idp_owner: data.idp_owner,
        idp_name: data.idp_name,
        display_name: data.display_name,
        website_url: data.website_url,
      },
      { actor, audit: this.auditPort }
    );

    return { uuid };
  }

  async updateOrganization(
    uuid: string,
    data: { display_name?: string; website_url?: string; idp_owner?: string; idp_name?: string; last_synced_at?: Date }
  ): Promise<void> {
    await this.repo.update(OrganizationEntity, { ...data, uuid }, { actor: requireActor(), audit: this.auditPort });
  }

  async deleteOrganization(uuid: string): Promise<void> {
    await this.repo.delete(OrganizationEntity, { uuid }, { actor: requireActor(), audit: this.auditPort });
  }

  async restoreOrganization(uuid: string): Promise<void> {
    await this.repo.restore(OrganizationEntity, { uuid }, { actor: requireActor(), audit: this.auditPort });
  }

  async getUserCountForOrganization(idpCode: string): Promise<number> {
    const countResult = await this.repo.find<UserProfileEntity, { cnt: bigint }>(
      UserProfileEntity,
      [Project.expr("COUNT(*)", "cnt")],
      {
        filters: [
          Filter.fieldValue(field(UserProfileEntity, "idp_org" as any), "=", idpCode),
          Filter.fieldValue(field(UserProfileEntity, "deleted_at" as any), "IS", null),
          Filter.fieldValue(field(UserProfileEntity, "is_active" as any), "=", true),
        ],
        deletedRecords: "EXCLUDED",
        throwIfNotFound: false,
      }
    );
    return countResult ? Number(countResult.cnt) : 0;
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

  async getOrganizationAudit(uuid: string, page: number, limit: number) {
    const result = await findAuditPage(this.repo, {
      tableName: "organizations_audit",
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

  private translateFilterConditions(
    conditions: Array<{ field: string; op: string; value: unknown; connector?: "AND" | "OR" }>,
    connector: "AND" | "OR" = "AND"
  ): FilterExpr[] | null {
    if (!conditions || conditions.length === 0) return null;

    const validOps = new Set(["=", "!=", "<>", "<", "<=", ">=", ">=", "ILIKE", "LIKE", "IN", "NOT IN", "IS", "IS NOT"]);
    const allowedFields = new Set(["display_name", "idp_code", "website_url"]);

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
          Filter.fieldValue(field(OrganizationEntity, cond.field as any), cond.op as any, value, cond.connector)
        );
      } else {
        filterExprs.push(
          Filter.fieldValue(field(OrganizationEntity, cond.field as any), cond.op as any, value, cond.connector)
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
