/**
 * DAL for `auth_configurations` — key/value store for all auth config.
 *
 * Wraps the `Repository` from `@primebrick/dal-pg`. Exposes standard CRUD/finder
 * methods only — no custom non-standard finders, no raw SQL strings.
 */

import type { Pool } from "pg";
import { Repository, field, Filter, Sort, buildAuditableJoinsSelective } from "@primebrick/dal-pg";
import { AuthConfigurationEntity } from "./auth_configuration_entity.js";
import { UserProfileEntity } from "./user_profile_entity.js";

export class AuthConfigurationsDal {
  private repo: Repository;
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
    this.repo = new Repository(pool);
  }

  /**
   * Load all auth config rows (excluding soft-deleted).
   * Returns the raw entity rows — the caller reduces them into a key/value map.
   */
  async findAll(): Promise<AuthConfigurationEntity[]> {
    const rows = await this.repo.findAll<AuthConfigurationEntity, AuthConfigurationEntity>(
      AuthConfigurationEntity,
      null,
      {
        deletedRecords: "EXCLUDED",
        sorting: [
          Sort.by(field(AuthConfigurationEntity, "group_key" as any), "ASC"),
          Sort.by(field(AuthConfigurationEntity, "key" as any), "ASC"),
        ],
        joins: buildAuditableJoinsSelective(AuthConfigurationEntity, UserProfileEntity, {
          includeCreator: false,
          includeUpdater: true,
          includeDeleter: false,
        }),
      }
    );
    return rows as AuthConfigurationEntity[];
  }

  /**
   * Find a single config row by key.
   * Returns `null` if not found.
   */
  async findByKey(key: string): Promise<AuthConfigurationEntity | null> {
    return this.repo.find<AuthConfigurationEntity, AuthConfigurationEntity>(
      AuthConfigurationEntity,
      null,
      {
        filters: [
          Filter.fieldValue(
            field(AuthConfigurationEntity, "key" as any),
            "=",
            key
          ),
        ],
        deletedRecords: "EXCLUDED",
        throwIfNotFound: false,
      }
    );
  }

  /**
   * Find a single config row by uuid.
   * Returns `null` if not found.
   */
  async findByUuid(uuid: string): Promise<AuthConfigurationEntity | null> {
    return this.repo.findByUUID<AuthConfigurationEntity, AuthConfigurationEntity>(
      AuthConfigurationEntity,
      uuid,
      { deletedRecords: "EXCLUDED", throwIfNotFound: false }
    );
  }

  /**
   * Insert a new config row with full metadata.
   * Invalidates + reloads the in-memory auth config cache so the change
   * is visible immediately to all hot-path readers (getAuthConfig()).
   *
   * NOTE: Validation is handled by the router layer using the SDK's
   * `validateConfigValue`. The DAL is a data I/O concern — it does not validate.
   */
  async add(
    params: {
      key: string;
      value: string;
      type: string;
      type_config?: string | null;
      label_key?: string | null;
      description_key?: string | null;
      group_key?: string | null;
      reserved?: boolean;
    },
    updatedBy: string
  ): Promise<AuthConfigurationEntity> {
    const row = await this.repo.add(
      AuthConfigurationEntity,
      {
        key: params.key,
        value: params.value,
        type: params.type,
        type_config: params.type_config ?? null,
        label_key: params.label_key ?? null,
        description_key: params.description_key ?? null,
        group_key: params.group_key ?? null,
        reserved: params.reserved ?? false,
        created_by: updatedBy,
        updated_by: updatedBy,
      },
      { actor: updatedBy }
    );
    await this.reloadCache();
    return row as AuthConfigurationEntity;
  }

  /**
   * Insert or update a config row by key.
   * If the key exists, updates the value; otherwise inserts a new row.
   * Invalidates + reloads the in-memory auth config cache so the change
   * is visible immediately to all hot-path readers (getAuthConfig()).
   */
  async upsert(
    key: string,
    value: string,
    updatedBy: string
  ): Promise<void> {
    const existing = await this.findByKey(key);
    if (!existing) {
      await this.repo.add(
        AuthConfigurationEntity,
        {
          key,
          value,
          created_by: updatedBy,
          updated_by: updatedBy,
        },
        { actor: updatedBy }
      );
    } else {
      await this.repo.update(
        AuthConfigurationEntity,
        {
          id: existing.id,
          value,
        },
        { actor: updatedBy }
      );
    }
    await this.reloadCache();
  }

  /**
   * Update a config row's value by uuid.
   * For `secret` type, an empty string means "leave unchanged" → skip write.
   * Invalidates + reloads the in-memory auth config cache.
   * Throws if the row is not found.
   *
   * NOTE: Validation is handled by the router layer using the SDK's
   * `validateConfigValue`. The DAL is a data I/O concern — it does not validate.
   */
  async update(
    uuid: string,
    value: string,
    updatedBy: string
  ): Promise<void> {
    const existing = await this.findByUuid(uuid);
    if (!existing) {
      throw new Error(`Auth config row with uuid ${uuid} not found`);
    }

    // secret: empty string = "leave unchanged"
    if (existing.type === "secret" && value === "") {
      return;
    }

    await this.repo.update(
      AuthConfigurationEntity,
      {
        id: existing.id,
        value,
      },
      { actor: updatedBy }
    );
    await this.reloadCache();
  }

  /**
   * Bulk update multiple config rows in a single transaction.
   * Uses `Repository.updateMany` (TEMP TABLE strategy: CREATE TEMP TABLE →
   * batch INSERT → UPDATE FROM → COMMIT). Auto-batches to stay under PG's
   * 65535 parameter limit. Handles audit columns (updated_at, updated_by,
   * version increment).
   *
   * Pure data I/O — no validation. The router layer validates before calling.
   * Invalidates + reloads the in-memory auth config cache.
   *
   * @param updates Array of { id, value } — already validated by the router.
   * @param updatedBy User UUID performing the update.
   */
  async bulkUpdate(
    updates: Array<{ id: bigint; value: string }>,
    updatedBy: string
  ): Promise<void> {
    if (updates.length === 0) return;

    await this.repo.updateMany(
      AuthConfigurationEntity,
      updates.map((u) => ({ id: u.id, value: u.value })),
      { actor: updatedBy, matchBy: "id" }
    );

    await this.reloadCache();
  }

  /**
   * Soft-delete a config row by uuid.
   * Rejects reserved rows (they are system-critical and cannot be deleted).
   * Invalidates + reloads the in-memory auth config cache.
   * Throws if the row is not found or is reserved.
   */
  async softDelete(uuid: string, deletedBy: string): Promise<void> {
    const existing = await this.findByUuid(uuid);
    if (!existing) {
      throw new Error(`Auth config row with uuid ${uuid} not found`);
    }
    if (existing.reserved) {
      throw new ReservedConfigError(existing.key);
    }
    await this.repo.delete(
      AuthConfigurationEntity,
      { id: existing.id },
      { actor: deletedBy }
    );
    await this.reloadCache();
  }

  /**
   * Soft-delete multiple config rows by uuid.
   * Rejects the entire batch if any row is reserved (all-or-nothing).
   * Invalidates + reloads the in-memory auth config cache.
   * Throws if any row is not found or is reserved.
   */
  async bulkSoftDelete(uuids: string[], deletedBy: string): Promise<void> {
    const rows: AuthConfigurationEntity[] = [];
    for (const uuid of uuids) {
      const row = await this.findByUuid(uuid);
      if (!row) {
        throw new Error(`Auth config row with uuid ${uuid} not found`);
      }
      if (row.reserved) {
        throw new ReservedConfigError(row.key);
      }
      rows.push(row);
    }
    for (const row of rows) {
      await this.repo.delete(
        AuthConfigurationEntity,
        { id: row.id },
        { actor: deletedBy }
      );
    }
    await this.reloadCache();
  }

  /**
   * Restore a soft-deleted config row by uuid.
   * Invalidates + reloads the in-memory auth config cache.
   * Throws if the row is not found.
   */
  async restore(uuid: string, updatedBy: string): Promise<void> {
    const existing = await this.repo.findByUUID<AuthConfigurationEntity, AuthConfigurationEntity>(
      AuthConfigurationEntity,
      uuid,
      { deletedRecords: "INCLUDED", throwIfNotFound: false }
    );
    if (!existing) {
      throw new Error(`Auth config row with uuid ${uuid} not found`);
    }
    await this.repo.restore(
      AuthConfigurationEntity,
      { id: existing.id },
      { actor: updatedBy }
    );
    await this.reloadCache();
  }

  /**
   * Reload the SDK's in-memory auth config cache from the DB.
   *
   * Uses a dynamic import to break the static circular dependency:
   *   auth_configurations_dal.ts → config.ts → sdk-auth-ports.ts
   *     → config-repo.ts → auth_configurations_dal.ts
   *
   * If the reload fails, the previous cache is left intact (loadAuthConfig
   * only overwrites `cached` on success), so the server keeps running with
   * the stale config rather than throwing on every getAuthConfig() call.
   */
  private async reloadCache(): Promise<void> {
    try {
      const { loadAuthConfig } = await import("./config.js");
      await loadAuthConfig(this.pool);
    } catch (err) {
      console.warn(
        "[AuthConfigurationsDal] Failed to reload auth config cache after write. " +
          "The DB was updated but the in-memory cache is stale — restart the server to pick up the change.",
        err,
      );
    }
  }
}

/**
 * Error thrown when attempting to delete a reserved config row.
 * Reserved rows are system-critical: editable but not deletable.
 */
export class ReservedConfigError extends Error {
  readonly key: string;
  readonly internal_code = "reserved_config_cannot_be_deleted";

  constructor(key: string) {
    super(`Config key "${key}" is reserved and cannot be deleted`);
    this.name = "ReservedConfigError";
    this.key = key;
  }
}
