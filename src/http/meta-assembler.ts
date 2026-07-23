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

/**
 * Inject `collaboration: { enabled, expose_editing_value }` into an entity
 * meta object. The `expose_editing_value` flag controls whether the FE shows
 * the value being edited by another user in the avatar tooltip.
 *
 * @param meta The static entity meta object (e.g. `customerMeta`)
 * @param entityClass The entity class (e.g. `CustomerEntity`)
 * @returns The meta object with `collaboration` fragment appended
 */
export function assembleMeta<T extends Record<string, unknown>>(
  meta: T,
  entityClass: new () => unknown,
): T & { collaboration: { enabled: boolean; expose_editing_value: boolean } } {
  const persistenceMeta = getEntityPersistenceMeta(entityClass as unknown as Parameters<typeof getEntityPersistenceMeta>[0]);
  const isAuditable = persistenceMeta.isAuditable === true;

  return {
    ...meta,
    collaboration: {
      enabled: isAuditable,
      expose_editing_value: true,
    },
  };
}
