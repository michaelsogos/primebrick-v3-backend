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
    body: { display_name?: string; email?: string; avatar_color?: string }
  ): Promise<void> {
    await this.repo.update(UserProfileEntity, uuid, body, requireActor());
  }
}
