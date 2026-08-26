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
   * Insert a new config row.
   * Invalidates + reloads the in-memory auth config cache so the change
   * is visible immediately to all hot-path readers (getAuthConfig()).
   */
  async add(
    key: string,
    value: string,
    updatedBy: string
  ): Promise<void> {
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
    await this.reloadCache();
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
   * Validates the incoming string against `type` / `type_config` before writing.
   * For `secret` type, an empty string means "leave unchanged" → skip write.
   * Invalidates + reloads the in-memory auth config cache.
   * Throws if the row is not found or the value fails type validation.
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

    validateConfigValue(existing.type, existing.type_config, value);

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
 * Validate a config value string against its type / type_config.
 * Throws on invalid values. Used by the DAL `update` method.
 */
export function validateConfigValue(
  type: string,
  type_config: string | null | undefined,
  value: string
): void {
  switch (type) {
    case "boolean":
      if (value !== "true" && value !== "false") {
        throw new Error(`Invalid boolean value: "${value}" (expected "true" or "false")`);
      }
      break;
    case "integer": {
      const n = Number(value);
      if (!Number.isInteger(n)) {
        throw new Error(`Invalid integer value: "${value}"`);
      }
      break;
    }
    case "number": {
      const n = Number(value);
      if (isNaN(n)) {
        throw new Error(`Invalid number value: "${value}"`);
      }
      break;
    }
    case "badge": {
      if (!type_config) {
        throw new Error(`badge type requires type_config`);
      }
      const config = JSON.parse(type_config);
      if (!config.values || typeof config.values !== "object") {
        throw new Error(`badge type_config must contain a "values" object`);
      }
      if (!(value in config.values)) {
        throw new Error(`Invalid badge value: "${value}" (not in type_config.values)`);
      }
      break;
    }
    case "url": {
      try {
        new URL(value);
      } catch {
        throw new Error(`Invalid URL value: "${value}"`);
      }
      break;
    }
    case "json": {
      try {
        JSON.parse(value);
      } catch {
        throw new Error(`Invalid JSON value: "${value}"`);
      }
      break;
    }
    // string, text, secret, list, date, datetime, time: no validation at write path
    // (list is validated by the BE's own catalog code; date/datetime/time format
    // validation is handled by the FE wheel datepicker + SDK coercion).
    default:
      break;
  }
}
