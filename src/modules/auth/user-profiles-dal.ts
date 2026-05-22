import type { Pool } from "pg";

import { entityDateToApiIso } from "../../domain/entities/entity-meta.js";
import { Repository } from "../../db/repository/repository.js";
import { field, Filter, Join } from "../../db/repository/dsl.js";

import { UserProfileEntity } from "./user_profile_entity.js";
import type { AuditService } from "../../lib/audit/audit-service.js";
import { requireActor } from "./session-context.js";

export type UserProfileDetailRow = {
  uuid: string;
  idp_code: string;
  email?: string;
  display_name?: string;
  avatar_color?: string;
  avatar_initials?: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  issuer?: string;
  roles?: string[];
  last_synced_at?: Date;
  idp_org?: string;
  idp_username?: string;
  created_at: Date;
  created_by: string;
  created_by_name?: string;
  updated_at: Date;
  updated_by: string;
  updated_by_name?: string;
  version: number;
  deleted_at?: Date;
  deleted_by?: string;
  deleted_by_name?: string;
};

export type UserProfileDetailDto = Omit<
  UserProfileDetailRow,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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
        joins: [
          // Use table aliases to join user_profiles three times
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

  async updateProfile(
    uuid: string,
    body: { display_name?: string; email?: string; avatar_color?: string; is_active?: boolean; is_admin?: boolean; is_verified?: boolean; issuer?: string; roles?: string[]; last_synced_at?: Date; idp_code?: string }
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

  async softDelete(uuid: string): Promise<void> {
    await this.repo.delete(UserProfileEntity, uuid, requireActor());
  }

  async restore(uuid: string): Promise<void> {
    await this.repo.restore(UserProfileEntity, uuid, requireActor());
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
      SELECT
        audit.id,
        audit.entity_uuid,
        audit.action,
        audit.changed_at,
        audit.changed_by,
        creator.display_name as changed_by_name,
        audit.version,
        audit.delta
      FROM public.user_profiles_audit audit
      LEFT JOIN public.user_profiles creator
        ON audit.changed_by ~ '^[0-9a-fA-F-]{36}$'
       AND creator.uuid::text = audit.changed_by
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
        delta: row.delta,
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total,
      },
    };
  }
}
