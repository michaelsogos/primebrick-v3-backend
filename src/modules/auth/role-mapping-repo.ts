import { logger } from "@primebrick/sdk";
import type { Pool, PoolClient } from "pg";
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
import { BeAuditPortAdapter } from "../../db/audit-port-adapter.js";
import type { AuditService } from "../../lib/audit/audit-service.js";
import { getCachePort } from "../../cache/cache-port-holder.js";


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

  getAuditPort(): BeAuditPortAdapter {
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
    extras?: { idp_org?: string; last_synced_at?: Date; actor?: string; tx?: PoolClient }
  ): Promise<void> {
    const repo = extras?.tx ? new Repository(extras.tx) : this.repo;
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
      { actor: extras?.actor ?? "system" }
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
    extras?: { last_synced_at?: Date; actor?: string; tx?: PoolClient }
  ): Promise<void> {
    const repo = extras?.tx ? new Repository(extras.tx) : this.repo;
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
      { actor: extras?.actor ?? "system", matchBy: "uuid" as any }
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
    await this.repo.hardDelete(
      RoleMappingEntity,
      { uuid, version },
      { actor: actor ?? "system", matchBy: "uuid" }
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
}
