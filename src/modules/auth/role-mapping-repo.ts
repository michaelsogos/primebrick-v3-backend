import { Pool } from "pg";
import { Repository } from "../../db/repository/repository.js";
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
    const rows = await this.repo.rawSql<RoleMappingRow>(
      `SELECT idp_role, label_key, permissions, is_admin FROM role_mappings`
    );

    const map = new Map<string, { permissions: string[]; is_admin: boolean; label_key?: string }>();
    for (const row of rows) {
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
    const existing = await this.repo.rawSql<{ id: number }>(
      `SELECT id FROM role_mappings WHERE idp_role = $1`,
      [idpRole]
    );

    if (existing.length === 0) {
      await this.repo.insertMany(RoleMappingEntity, [
        {
          idp_role: idpRole,
          label_key: labelKey,
          permissions,
          is_admin: isAdmin,
        },
      ]);
    } else {
      await this.repo.rawSql(
        `UPDATE role_mappings SET permissions = $1, is_admin = $2, label_key = $3, updated_at = CURRENT_TIMESTAMP WHERE idp_role = $4`,
        [permissions, isAdmin, labelKey || null, idpRole]
      );
    }
  }

  /**
   * Delete a role mapping.
   */
  async deleteMapping(idpRole: string): Promise<void> {
    await this.repo.rawSql(
      `DELETE FROM role_mappings WHERE idp_role = $1`,
      [idpRole]
    );
  }
}
