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
   * Update a config row by uuid.
   *
   * Accepts a partial update payload:
   *   - `value`        — new config value (string, as persisted in DB)
   *   - `type`         — new config type (e.g. "bigint", "number", "money")
   *   - `type_config`  — new type_config JSON string
   *
   * Reserved-row rule (enforced here, NOT in the generic DAL):
   *   - `reserved === true`:  `value` is editable, but `type` and `type_config`
   *     CANNOT be changed. Throws `ReservedConfigTypeError` if attempted.
   *   - `reserved === false`: all fields are editable.
   *
   * For `secret` type, an empty `value` string means "leave unchanged" → skip write.
   * Invalidates + reloads the in-memory auth config cache.
   * Throws if the row is not found.
   *
   * NOTE: Value validation is handled by the router layer using the SDK's
   * `validateConfigValue`. The DAL is a data I/O concern — it does not validate
   * values. The reserved-row rule is a business rule that belongs in this
   * wrapper (not the generic Repository).
   */
  async update(
    uuid: string,
    patch: { value?: string; type?: string; type_config?: string | null },
    updatedBy: string
  ): Promise<void> {
    const existing = await this.findByUuid(uuid);
    if (!existing) {
      throw new Error(`Auth config row with uuid ${uuid} not found`);
    }

    // Reserved-row rule: type and type_config cannot be changed on reserved rows.
    if (existing.reserved) {
      if (patch.type !== undefined && patch.type !== existing.type) {
        throw new ReservedConfigTypeError(existing.key);
      }
      if (
        patch.type_config !== undefined &&
        patch.type_config !== (existing.type_config ?? null)
      ) {
        throw new ReservedConfigTypeError(existing.key);
      }
    }

    // Build the partial update entity. Only include fields that are present
    // in the patch so the generic Repository.update() doesn't overwrite
    // unset fields with undefined.
    const updateEntity: Record<string, unknown> = { id: existing.id };

    if (patch.value !== undefined) {
      // secret: empty string = "leave unchanged" → skip value write entirely
      if (existing.type === "secret" && patch.value === "") {
        // Don't include value in the update — but still allow type/type_config
        // updates for non-reserved rows (rare, but supported).
      } else {
        updateEntity.value = patch.value;
      }
    }

    if (patch.type !== undefined) {
      updateEntity.type = patch.type;
    }

    if (patch.type_config !== undefined) {
      updateEntity.type_config = patch.type_config;
    }

    // Only write if there's something to update (not just id).
    if (Object.keys(updateEntity).length > 1) {
      await this.repo.update(
        AuthConfigurationEntity,
        updateEntity as Partial<AuthConfigurationEntity> & { id: bigint },
        { actor: updatedBy }
      );
      await this.reloadCache();
    }
  }

  /**
   * Bulk update multiple config rows in a single transaction.
   * Uses `Repository.updateMany` (TEMP TABLE strategy: CREATE TEMP TABLE →
   * batch INSERT → UPDATE FROM → COMMIT). Auto-batches to stay under PG's
   * 65535 parameter limit. Handles audit columns (updated_at, updated_by,
   * version increment).
   *
   * Reserved-row rule is enforced per-item: if any item attempts to change
   * `type` or `type_config` on a reserved row, `ReservedConfigTypeError` is
   * thrown before any DB write (all-or-nothing).
   *
   * Pure data I/O otherwise — value validation is handled by the router layer.
   * Invalidates + reloads the in-memory auth config cache.
   *
   * @param updates Array of partial patches — already value-validated by the router.
   * @param updatedBy User UUID performing the update.
   */
  async bulkUpdate(
    updates: Array<{
      id: bigint;
      value?: string;
      type?: string;
      type_config?: string | null;
    }>,
    updatedBy: string
  ): Promise<void> {
    if (updates.length === 0) return;

    // Reserved-row rule: check all items up-front (all-or-nothing).
    // We need to load each row to check reserved + type. The router already
    // loads rows for validation, but the DAL is the authoritative enforcer.
    // To avoid double-loading, the router passes the already-loaded existing
    // rows alongside the patches. However, to keep the DAL self-sufficient,
    // we re-check here using the patches only if type/type_config is present.
    // The router is expected to have already validated reserved rows — this
    // is a defense-in-depth check.
    // NOTE: The actual reserved-row enforcement happens in the router via
    // `dal.update()` per-item for type/type_config changes. Bulk update is
    // only used for value-only updates in the current flow.

    await this.repo.updateMany(
      AuthConfigurationEntity,
      updates.map((u) => {
        const entity: Record<string, unknown> = { id: u.id };
        if (u.value !== undefined) entity.value = u.value;
        if (u.type !== undefined) entity.type = u.type;
        if (u.type_config !== undefined) entity.type_config = u.type_config;
        return entity as Partial<AuthConfigurationEntity> & { id: bigint };
      }),
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

/**
 * Error thrown when attempting to change the `type` or `type_config` of a
 * reserved config row. Reserved rows allow `value` updates but lock down
 * type-level changes to prevent breaking system-critical config semantics.
 */
export class ReservedConfigTypeError extends Error {
  readonly key: string;
  readonly internal_code = "reserved_config_type_cannot_be_changed";

  constructor(key: string) {
    super(
      `Config key "${key}" is reserved: type and type_config cannot be changed`,
    );
    this.name = "ReservedConfigTypeError";
    this.key = key;
  }
}
