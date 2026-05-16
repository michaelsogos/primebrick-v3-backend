import type { Pool } from "pg";
import type { EntityClass } from "../../domain/entities/entity-meta.js";
import { getTableName } from "../../domain/entities/entity-meta.js";
import { AuditAction } from "./audit-types.js";

export class AuditService {
  constructor(private pool: Pool) {}

  async writeAudit<T extends object>(
    entityClass: EntityClass,
    entityId: number,
    entityUuid: string,
    action: AuditAction,
    changedAt: Date,
    version: number,
    delta: Record<string, { old: unknown; new: unknown }>
  ): Promise<void> {
    const tableName = `${getTableName(entityClass)}_audit`;

    const sql = `
      INSERT INTO "public"."${tableName}" 
      (entity_id, entity_uuid, action, changed_at, version, delta)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await this.pool.query(sql, [
      entityId,
      entityUuid,
      action,
      changedAt,
      version,
      JSON.stringify(delta)
    ]);
  }
}
