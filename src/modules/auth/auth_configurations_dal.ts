/**
 * DAL for `auth_configurations` — key/value store for all auth config.
 *
 * Wraps the `Repository` base class. Exposes standard CRUD/finder methods
 * only — no custom non-standard finders, no raw SQL strings.
 */

import type { Pool } from "pg";
import { Repository } from "../../db/repository/repository.js";
import { field, Filter } from "../../db/repository/dsl.js";
import { AuthConfigurationEntity } from "./auth_configuration_entity.js";

export class AuthConfigurationsDal {
  private repo: Repository;

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
  }

  /**
   * Load all auth config rows (excluding soft-deleted).
   * Returns the raw entity rows — the caller reduces them into a key/value map.
   */
  async findAll(): Promise<AuthConfigurationEntity[]> {
    return this.repo.findAll<AuthConfigurationEntity, AuthConfigurationEntity>(
      AuthConfigurationEntity,
      null,
      {
        deletedRecords: "EXCLUDED",
      }
    );
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
      }
    );
  }

  /**
   * Insert a new config row.
   */
  async add(
    key: string,
    value: string,
    updatedBy: string
  ): Promise<void> {
    await this.repo.insertMany(AuthConfigurationEntity, [
      {
        key,
        value,
        created_by: updatedBy,
        updated_by: updatedBy,
      },
    ]);
  }

  /**
   * Insert or update a config row by key.
   * If the key exists, updates the value; otherwise inserts a new row.
   */
  async upsert(
    key: string,
    value: string,
    updatedBy: string
  ): Promise<void> {
    const existing = await this.findByKey(key);
    if (!existing) {
      await this.add(key, value, updatedBy);
    } else {
      await this.repo.update(
        AuthConfigurationEntity,
        existing.uuid,
        { value, updated_by: updatedBy },
        updatedBy
      );
    }
  }
}
