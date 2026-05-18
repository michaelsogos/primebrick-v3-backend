import { Pool } from "pg";
import { Repository } from "../../db/repository/repository.js";
import { RoleMappingEntity } from "./role_mapping_entity.js";

interface RoleMappingRow {
  idp_role: string;
  permissions: string[];
  is_admin: boolean;
}

/**
 * Repository for loading role-to-permission mappings from the database.
 *
 * This is the single source of truth for role permissions. The auth middleware
 * uses this to expand a user's IDP roles into a set of granted permissions.
 */
export class RoleMappingRepo {
  private repo: Repository;

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
  }

  /**
   * Load all role mappings from the database.
   * Returns a map of idp_role → { permissions, is_admin }.
   */
  async loadAllMappings(): Promise<Map<string, { permissions: string[]; is_admin: boolean }>> {
    const rows = await this.repo.rawSql<RoleMappingRow>(
      `SELECT idp_role, permissions, is_admin FROM role_mappings`
    );

    const map = new Map<string, { permissions: string[]; is_admin: boolean }>();
    for (const row of rows) {
      map.set(row.idp_role, {
        permissions: row.permissions || [],
        is_admin: row.is_admin || false,
      });
    }

    return map;
  }

  /**
   * Get all known permissions in the system.
   * This is useful for the frontend role-permission mapping UI.
   */
  async getAllPermissions(): Promise<string[]> {
    // Collect all unique permissions from all role mappings
    const rows = await this.repo.rawSql<{ permission: string }>(
      `SELECT DISTINCT unnest(permissions) as permission FROM role_mappings WHERE permissions IS NOT NULL`
    );

    return rows.map((r) => r.permission);
  }

  /**
   * Create or update a role mapping.
   */
  async upsertMapping(
    idpRole: string,
    permissions: string[],
    isAdmin: boolean
  ): Promise<void> {
    const existing = await this.repo.rawSql<{ id: number }>(
      `SELECT id FROM role_mappings WHERE idp_role = $1`,
      [idpRole]
    );

    if (existing.length === 0) {
      await this.repo.insertMany(RoleMappingEntity, [
        {
          idp_role: idpRole,
          permissions,
          is_admin: isAdmin,
        },
      ]);
    } else {
      await this.repo.rawSql(
        `UPDATE role_mappings SET permissions = $1, is_admin = $2, updated_at = CURRENT_TIMESTAMP WHERE idp_role = $3`,
        [permissions, isAdmin, idpRole]
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
