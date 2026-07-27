/**
 * DAL for `auth_configurations` — key/value store for all auth config.
 *
 * Wraps the `Repository` from `@primebrick/dal-pg`. Exposes standard CRUD/finder
 * methods only — no custom non-standard finders, no raw SQL strings.
 */

import type { Pool } from "pg";
import { Repository, field, Filter } from "@primebrick/dal-pg";
import { AuthConfigurationEntity } from "./auth_configuration_entity.js";

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
