/**
 * entity-name-registry — maps entity class names (and physical table names)
 * to the API entity name (`/api/v1/entities/:entity` segment, singular).
 *
 * Populated by `makeEntityRouter` at mount time — the router config is the
 * single place that already carries BOTH sides (`entity` class + `entityName`
 * string), so the mapping can never drift from the served routes.
 *
 * Consumed by `EntityAuditPort`: `AuditParams.tableName`/`entityClassName`
 * are physical (`user_profiles`, `UserProfileEntity`) while presence keys,
 * NATS subjects and URLs are namespaced by the API name — the marker must
 * carry the API name or it publishes to a subject nobody subscribes to.
 */

import { getEntityPersistenceMeta, type EntityClass } from "@primebrick/dal-pg";
import { logger } from "@primebrick/sdk";

const byClassName = new Map<string, string>();
const byTableName = new Map<string, string>();

export function registerEntityName(entity: new () => unknown, entityName: string): void {
  byClassName.set(entity.name, entityName);
  try {
    byTableName.set(getEntityPersistenceMeta(entity as EntityClass).tableName, entityName);
  } catch {
    // non-persistence class — className key still registered
  }
}

/**
 * Resolve the API entity name for audit params (`entityClassName` first —
 * unambiguous; `tableName` as fallback). Returns `undefined` when unmapped —
 * callers skip marker publication but still write the audit row.
 */
export function resolveEntityName(entityClassName: string, tableName: string): string | undefined {
  const name = byClassName.get(entityClassName) ?? byTableName.get(tableName);
  if (!name) {
    logger.warn(
      `collaboration marker skipped — no API entity name registered for ${entityClassName} (table ${tableName})`,
      { tags: ["collaborativity-feature"] },
    );
  }
  return name;
}
