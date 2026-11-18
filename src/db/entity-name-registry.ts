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
import { logger, type EntityMeta } from "@primebrick/sdk";

const byClassName = new Map<string, string>();
const byTableName = new Map<string, string>();
/** Served-entity census — `{entityName, meta}` per mounted entity router.
 *  Feeds the api-gateway `endpoints.events`/`endpoints.entities`
 *  self-declaration: the wire emits for every governed write, the census
 *  is what makes a subject selectable as a trigger source. */
const servedEntities = new Map<string, { entityName: string; meta?: EntityMeta }>();

export function registerEntityName(
  entity: new () => unknown,
  entityName: string,
  meta?: EntityMeta,
): void {
  byClassName.set(entity.name, entityName);
  servedEntities.set(entity.name, meta === undefined ? { entityName } : { entityName, meta });
  try {
    byTableName.set(getEntityPersistenceMeta(entity as EntityClass).tableName, entityName);
  } catch {
    // non-persistence class — className key still registered
  }
}

/** Served-entity declaration for a class — `{entityName, meta}` when the
 *  entity was mounted through `makeEntityRouter`, `undefined` otherwise. */
export function servedEntityDecl(
  entity: new () => unknown,
): { entityName: string; meta?: EntityMeta } | undefined {
  return servedEntities.get(entity.name);
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
