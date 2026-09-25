/**
 * Meta assembler — injects `collaboration` metadata into entity meta responses.
 *
 * Each entity module has its own static meta file (e.g. `customers.meta.ts`).
 * This utility wraps the static meta with a `collaboration` fragment that
 * tells the FE whether the entity supports real-time collaboration (presence,
 * entity-changed awareness, conflict resolution).
 *
 * `collaboration.enabled` is derived from `getEntityPersistenceMeta(ctor).isAuditable`
 * — only auditable entities (those with `@AuditTrail()`) get collaboration,
 * because the entity-changed hook fires from the audit port adapter.
 */

import { getEntityPersistenceMeta } from "@primebrick/dal-pg";
import type { CollaborationMeta, EntityMeta } from "./entity-meta.types.js";

/**
 * Inject the runtime fragments into an entity meta object:
 *
 * - `display_name`: materialized as `"${" + display_field + "}"` when the
 *   static meta does not declare an explicit template — the response always
 *   carries a display expression.
 * - `collaboration: { enabled, expose_editing_value }`: `enabled` is derived
 *   from `getEntityPersistenceMeta(ctor).isAuditable` — only auditable
 *   entities get collaboration; `expose_editing_value` controls whether the
 *   FE shows the value being edited by another user in the avatar tooltip.
 *
 * @param meta The static entity meta object (e.g. `customerMeta`)
 * @param entityClass The entity class (e.g. `CustomerEntity`)
 * @returns The meta with `display_name` + `collaboration` appended
 */
export function assembleMeta(
  meta: EntityMeta,
  entityClass: new () => unknown,
): EntityMeta & { display_name: string; collaboration: CollaborationMeta } {
  const persistenceMeta = getEntityPersistenceMeta(entityClass as unknown as Parameters<typeof getEntityPersistenceMeta>[0]);
  const isAuditable = persistenceMeta.isAuditable === true;

  return {
    ...meta,
    display_name: meta.display_name ?? `\${${meta.display_field}}`,
    collaboration: {
      enabled: isAuditable,
      expose_editing_value: true,
    },
  };
}
