import type { Repository } from "@primebrick/dal-pg";
import { AuditLogEntity, Project, Filter, Sort, field, buildAuditTrailJoins } from "@primebrick/dal-pg";
import { UserProfileEntity } from "../modules/auth/user_profile_entity.js";

export interface AuditPageOptions {
  tableName: string;  // e.g. "customers_audit", "organizations_audit", "user_profiles_audit"
  entityUuid: string;
  page: number;
  limit: number;
}

export interface AuditRow {
  id: bigint;
  entity_id: bigint;
  entity_uuid: string;
  action: string;
  changed_at: string;       // ISO string
  changed_by: string;
  changed_by_display_name: string | null;
  changed_by_idp_code: string | null;
  version: number;
  delta: Record<string, unknown>;
}

export interface AuditPageResult {
  data: AuditRow[];
  pagination: {
    page: number;
    limit: number;
    total: bigint;
    hasMore: boolean;
  };
}

// Helper to convert Date to ISO string (consistent with BE's existing audit helpers)
function entityDateToApiIso(date: Date): string {
  return date.toISOString();
}

const { joins, projections: joinProjections } = buildAuditTrailJoins(AuditLogEntity, UserProfileEntity);

const AUDIT_PROJECTIONS = [
  Project.field(field(AuditLogEntity, "id")),
  Project.field(field(AuditLogEntity, "entity_id")),
  Project.field(field(AuditLogEntity, "entity_uuid")),
  Project.field(field(AuditLogEntity, "action")),
  Project.field(field(AuditLogEntity, "changed_at")),
  Project.field(field(AuditLogEntity, "changed_by")),
  Project.field(field(AuditLogEntity, "version")),
  Project.field(field(AuditLogEntity, "delta")),
  ...joinProjections,  // changed_by_display_name, changed_by_idp_code
];

/**
 * Fetch a paginated audit trail for a specific entity UUID.
 * Uses AuditLogEntity + tableName override + buildAuditTrailJoins.
 * No raw SQL — fully typed via DAL-pg query DSL.
 */
export async function findAuditPage(repo: Repository, opts: AuditPageOptions): Promise<AuditPageResult> {
  // Count query
  const countResult = await repo.find<AuditLogEntity, { total: bigint }>(
    AuditLogEntity,
    [Project.expr("COUNT(*)", "total")],
    {
      tableName: opts.tableName,
      filters: [Filter.fieldValue(field(AuditLogEntity, "entity_uuid"), "=", opts.entityUuid)],
    }
  );
  const total = countResult?.total ?? 0n;

  // Data query
  const page = await repo.findByPage<AuditLogEntity>(
    AuditLogEntity,
    opts.page,
    opts.limit,
    AUDIT_PROJECTIONS,
    {
      tableName: opts.tableName,
      joins,
      filters: [Filter.fieldValue(field(AuditLogEntity, "entity_uuid"), "=", opts.entityUuid)],
      sorting: [
        Sort.by(field(AuditLogEntity, "changed_at"), "DESC"),
        Sort.by(field(AuditLogEntity, "id"), "DESC"),
      ],
    }
  );

  return {
    data: page.entities.map((row) => ({
      id: row.id,
      entity_id: row.entity_id,
      entity_uuid: row.entity_uuid,
      action: row.action,
      changed_at: entityDateToApiIso(row.changed_at),
      changed_by: row.changed_by,
      changed_by_display_name: (row as any).changed_by_display_name ?? null,
      changed_by_idp_code: (row as any).changed_by_idp_code ?? null,
      version: row.version,
      delta: row.delta ?? {},
    })),
    pagination: {
      page: opts.page,
      limit: opts.limit,
      total,
      hasMore: opts.page * opts.limit < Number(total),
    },
  };
}
