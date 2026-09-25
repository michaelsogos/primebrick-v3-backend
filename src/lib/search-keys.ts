/**
 * deriveSearchableKeys — default search scope for an entity list, derived
 * from the canonical meta × the entity's physical column types.
 *
 * Rule: `meta.columns` entries with `searchable !== false` AND UI type
 * `"text"`, restricted to columns whose physical PG type is ILIKE-safe
 * (`character varying`, `varchar`, `text`, `uuid` — uuid is searched via the
 * `CAST(col AS text)` already applied by the query-builder).
 *
 * This replaces the hand-maintained fallback arrays that used to live in the
 * auth DALs — meta `searchable` expresses product intent, the entity
 * decorators express physical reality, and the two cannot diverge.
 */

import { getEntityPersistenceMeta, type EntityClass } from "@primebrick/dal-pg";
import type { EntityMeta } from "../http/entity-meta.types.js";

const TEXTLIKE_PG_TYPES = new Set([
  "character varying",
  "varchar",
  "character",
  "char",
  "text",
  "citext",
  "name",
  "uuid",
]);

export function deriveSearchableKeys(meta: EntityMeta, entityClass: EntityClass): string[] {
  const persistence = getEntityPersistenceMeta(entityClass);
  const pgTypeByProp = new Map<string, string>();
  for (const col of Object.values(persistence.columns)) {
    pgTypeByProp.set(col.propertyKey, (col.pgType ?? col.inferredPgType).toLowerCase());
  }

  return meta.columns
    .filter((c) => c.searchable !== false && c.type === "text")
    .map((c) => c.key)
    .filter((key) => {
      const t = pgTypeByProp.get(key);
      return t !== undefined && TEXTLIKE_PG_TYPES.has(t);
    });
}
