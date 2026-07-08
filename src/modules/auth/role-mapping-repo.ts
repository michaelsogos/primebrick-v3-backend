import type { Pool } from "pg";
import { Repository, Project, field, Filter } from "@primebrick/dal-pg";
import { RoleMappingEntity } from "./role_mapping_entity.js";

interface RoleMappingRow {
  idp_role: string;
  label_key?: string;
  permissions: string[];
  is_admin: boolean;
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
   * Create or update a role mapping.
   */
  async upsertMapping(
    idpRole: string,
    permissions: string[],
    isAdmin: boolean,
    labelKey?: string
  ): Promise<void> {
    await this.repo.upsert(
      RoleMappingEntity,
      {
        idp_role: idpRole,
        label_key: labelKey,
        permissions,
        is_admin: isAdmin,
      },
      { actor: "system", conflictTarget: "idp_role" }
    );
  }

  /**
   * Delete a role mapping.
   */
  async deleteMapping(idpRole: string): Promise<void> {
    await this.repo.hardDelete(
      RoleMappingEntity,
      { idp_role: idpRole },
      { actor: "system", matchBy: "idp_role" }
    );
  }
}
