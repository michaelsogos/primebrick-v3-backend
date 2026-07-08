import type { Pool } from "pg";
import type { EntityClass } from "@primebrick/dal-pg";
import { Repository, AuditLogEntity, getTableName } from "@primebrick/dal-pg";
import { AuditAction } from "./audit-types.js";

export class AuditService {
  private repo: Repository;

  constructor(private pool: Pool) {
    this.repo = new Repository(pool);
  }

  async writeAudit<T extends object>(
    entityClass: EntityClass,
    entityId: bigint,
    entityUuid: string,
    action: AuditAction,
    changedAt: Date,
    version: number,
    delta: Record<string, { old: unknown; new: unknown }>,
    changedBy: string = "system"
  ): Promise<void> {
    const auditTableName = `${getTableName(entityClass)}_audit`;

    await this.repo.add(
      AuditLogEntity,
      {
        entity_id: entityId,
        entity_uuid: entityUuid,
        action,
        changed_at: changedAt,
        changed_by: changedBy,
        version,
        delta,
      },
      { tableName: auditTableName }
    );
  }
}
