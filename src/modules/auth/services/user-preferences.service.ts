/**
 * `UserPreferencesService` — owns the `public.user_preferences` KV surface.
 *
 * Self-service ONLY: every operation is scoped to the caller's
 * `user_uuid` (`req.user.id`) — there is no cross-user or admin path.
 *
 * Cache chain (the consolidated preference chain):
 *   Redis  — `@Cached(300_000)` on the entity: `this.dal.*` reads/writes
 *            flow through the withCache repo (writes invalidate).
 *   ETag   — `getAll()` returns a `CacheEntry` for `etagMiddleware()`
 *            (304 on unchanged re-polls).
 *   sessionStorage — the FE `useUserPreferences` mirror (read-on-init,
 *            write-through on mutation, cleared on logout).
 *
 * `upsert` is banned by convention → `set` is read-then-insert/update,
 * guarded by the row `version` on the update path.
 */

import {
  field,
  Filter,
} from "@primebrick/dal-pg";
import { wrapCacheEntry, type CacheEntry } from "@primebrick/sdk";

import { DomainService } from "../../../db/domain-service.js";
import { NotFoundError } from "../../../http/api-errors.js";
import { UserPreferenceEntity } from "../user_preference_entity.js";

/** The public read shape — `{ [key]: value }`, shape-blind. */
export type UserPreferencesMap = Record<string, unknown>;

export class UserPreferencesService extends DomainService<Record<string, unknown>> {
  constructor() {
    super({
      entity: UserPreferenceEntity,
      list: {
        searchableKeys: ["key"],
        filterableKeys: new Set(["key", "user_uuid"]),
        defaultSort: { key: "key", dir: "asc" },
      },
    });
  }

  /**
   * All preferences of one user as a `{key: value}` map — the GET
   * `/me/preferences` payload, ETag-carried (`CacheEntry`).
   */
  async getAll(userUuid: string): Promise<CacheEntry<{ preferences: UserPreferencesMap }>> {
    const rows = await this.dal.findAll<UserPreferenceEntity, UserPreferenceEntity>(
      UserPreferenceEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserPreferenceEntity, "user_uuid"), "=", userUuid),
        ],
      },
    );
    const preferences: UserPreferencesMap = {};
    for (const row of rows as UserPreferenceEntity[]) {
      preferences[row.key] = row.value;
    }
    return wrapCacheEntry({ preferences });
  }

  /**
   * One preference as `{key, value}` — the GET `/me/preferences/:key`
   * payload, ETag-carried. 404 when the caller owns no row for `key`.
   */
  async getOne(userUuid: string, key: string): Promise<CacheEntry<{ key: string; value: unknown }>> {
    const row = await this.findByKey(userUuid, key);
    if (!row) {
      throw new NotFoundError(`Preference "${key}" not found`, {
        internal_code: "USER_PREFERENCE_NOT_FOUND",
      });
    }
    return wrapCacheEntry({ key: row.key, value: row.value });
  }

  /** One preference row for the caller, or null. */
  async findByKey(userUuid: string, key: string): Promise<UserPreferenceEntity | null> {
    return this.dal.find<UserPreferenceEntity, UserPreferenceEntity>(
      UserPreferenceEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(UserPreferenceEntity, "user_uuid"), "=", userUuid),
          Filter.fieldValue(field(UserPreferenceEntity, "key"), "=", key),
        ],
        throwIfNotFound: false,
      },
    );
  }

  /**
   * Read-then-insert/update — `upsert` is banned by convention. The update
   * path passes the observed `version` (optimistic-concurrency guard);
   * the insert path relies on the `(user_uuid, key)` unique index.
   */
  async set(userUuid: string, key: string, value: unknown, actor: string): Promise<UserPreferenceEntity> {
    const existing = await this.findByKey(userUuid, key);
    if (existing) {
      const row = await this.dal.update(
        UserPreferenceEntity,
        { uuid: existing.uuid, version: existing.version, value },
        { actor, audit: this.auditPort },
      );
      return row as UserPreferenceEntity;
    }
    const row = await this.dal.add(
      UserPreferenceEntity,
      {
        user_uuid: userUuid,
        key,
        value,
        created_by: actor,
        updated_by: actor,
      },
      { actor, audit: this.auditPort },
    );
    return row as UserPreferenceEntity;
  }

  /** Hard delete — 404 when the caller does not own a row for `key`. */
  async remove(userUuid: string, key: string, actor: string): Promise<void> {
    const existing = await this.findByKey(userUuid, key);
    if (!existing) {
      throw new NotFoundError(`Preference "${key}" not found`, {
        internal_code: "USER_PREFERENCE_NOT_FOUND",
      });
    }
    await this.dal.hardDelete(
      UserPreferenceEntity,
      { uuid: existing.uuid, version: existing.version },
      { actor, audit: this.auditPort },
    );
  }
}
