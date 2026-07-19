import type { Pool } from "pg";
import { Repository, Project, field, Filter, Sort } from "@primebrick/dal-pg";
import { RoleMappingEntity } from "./role_mapping_entity.js";

interface RoleMappingRow {
  idp_role: string;
  label_key?: string;
  permissions: string[];
  is_admin: boolean;
}

/** Full role_mappings row shape (used by the CRUD router / RoleService). */
export interface RoleMappingDetailed {
  id: bigint;
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

/**
 * Repository for loading role-to-permission mappings from the database.
 *
 * This is the single source of truth for role permissions. The auth middleware
 * uses this to expand a user's IDP roles into a set of granted permission patterns.
 */
export class RoleMappingRepo {
  private repo: Repository;

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
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
