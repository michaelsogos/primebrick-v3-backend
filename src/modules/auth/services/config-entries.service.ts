/**
 * ConfigEntriesService — business logic for the `config_entries` entity.
 *
 * Owns: secret masking (DTO shaping), duplicate-key checks, typed-value
 * serialization (`serializeConfigValue`) and validation (`validateConfigValue`),
 * the reserved-row rules surfaced as ApiError, per-item bulk validation, audit
 * paging, and post-commit cache refresh.
 *
 * The service is request-context-free: it never touches `req`/`res`.
 * Controllers keep transport concerns only (validation schemas, RBAC,
 * `runEntityWrite` orchestration, HTTP status codes). Errors are thrown as
 * `ApiError` subclasses so `errorHandler` converts them to RFC 7807.
 */

import type { PoolClient } from "pg";
import {
  validateConfigValue,
  coerceConfigValue,
  serializeConfigValue,
  ConfigValidationError,
  type ConfigType,
  type CacheEntry,
} from "@primebrick/sdk";
import { Repository } from "@primebrick/dal-pg";

import { getPool } from "../../../db/pool.js";
import { findAuditPage } from "../../../db/audit-query-helper.js";
import { ApiError, ValidationError } from "../../../http/api-errors.js";
import {
  ConfigEntriesDal,
  ReservedConfigError,
  ReservedConfigTypeError,
} from "../config_entries_dal.js";
import type { ConfigEntryEntity } from "../config_entry_entity.js";

/** Row shape accepted by `create` — mirrors the create schema entity. */
export interface ConfigEntryCreateInput {
  key: string;
  value: string | number | bigint;
  type: string;
  type_config?: string | null;
  label_key?: string | null;
  description_key?: string | null;
  group_key?: string | null;
  reserved?: boolean;
}

/** Row shape accepted by `update` / bulk items. */
export interface ConfigEntryUpdateInput {
  value?: string | number | bigint;
  type?: string;
  type_config?: string | null;
}

export class ConfigEntriesService {
  private dal: ConfigEntriesDal | null = null;

  private getDal(): ConfigEntriesDal {
    if (this.dal) return this.dal;
    this.dal = new ConfigEntriesDal(getPool());
    return this.dal;
  }

  // --- DTO shaping ----------------------------------------------------------

  /**
   * Mask secret values in a config row before returning it to the FE.
   * Secret values are replaced with `null` — the FE renders a Password input
   * with a placeholder and only sends a value when the user types a new one.
   * An empty PUT body for a secret means "leave unchanged".
   *
   * Typed values are coerced to their native JS type before serialization:
   *   - `bigint`  → native `bigint` (preserved by extJsonMiddleware on response)
   *   - `number`  → native `number`
   *   - `money`   → native `number` (amount only; currency is in `type_config`)
   *   - other     → string (as stored in DB)
   */
  maskSecretValue(row: ConfigEntryEntity): Record<string, unknown> {
    let coercedValue: unknown = row.value;
    if (row.type !== "secret" && row.value !== null && row.value !== undefined) {
      try {
        coercedValue = coerceConfigValue(
          row.type as ConfigType,
          row.value,
          row.type_config ?? undefined,
        );
      } catch {
        // If coercion fails (e.g. stale DB value), fall back to the raw string.
        coercedValue = row.value;
      }
    } else if (row.type === "secret") {
      coercedValue = null;
    }

    return {
      uuid: row.uuid,
      key: row.key,
      value: coercedValue,
      type: row.type,
      type_config: row.type_config ?? null,
      label_key: row.label_key ?? null,
      description_key: row.description_key ?? null,
      group_key: row.group_key ?? null,
      reserved: row.reserved,
      version: row.version,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      updated_by_name: (row as any).updated_by_name ?? null,
    };
  }

  // --- Reads ----------------------------------------------------------------

  /** Full list with cache entry (etag support). Controller handles 304. */
  async list(): Promise<CacheEntry<ConfigEntryEntity[]>> {
    return this.getDal().findAllWithCache();
  }

  async getByUuid(uuid: string): Promise<ConfigEntryEntity> {
    const row = await this.getDal().findByUuid(uuid);
    if (!row) throw this.notFound(uuid);
    return row;
  }

  async getAudit(uuid: string, page: number, limit: number) {
    await this.getByUuid(uuid); // verifies the config entry exists
    const repo = new Repository(getPool());
    return findAuditPage(repo, {
      tableName: "config_entries_audit",
      entityUuid: uuid,
      page,
      limit,
    });
  }

  // --- Writes ---------------------------------------------------------------

  /**
   * Pre-write checks for create: duplicate key + value serialization +
   * validation. Returns the DB-shaped params to persist.
   */
  async prepareCreate(entity: ConfigEntryCreateInput) {
    const existing = await this.getDal().findByKey(entity.key);
    if (existing) {
      throw new ValidationError(`Config key "${entity.key}" already exists`, {
        internal_code: "DUPLICATE_KEY",
      });
    }
    const valueStr = serializeConfigValue(entity.type as ConfigType, entity.value);
    this.assertValidValue(entity.type as ConfigType, entity.type_config ?? undefined, valueStr, entity.key);
    return {
      key: entity.key,
      value: valueStr,
      type: entity.type,
      type_config: entity.type_config ?? null,
      label_key: entity.label_key ?? null,
      description_key: entity.description_key ?? null,
      group_key: entity.group_key ?? null,
      reserved: entity.reserved ?? false,
    };
  }

  /** Tx-capable insert — the caller wraps this in `runEntityWrite`. */
  async create(
    params: Parameters<ConfigEntriesDal["add"]>[0],
    userUuid: string,
    tx?: PoolClient,
  ): Promise<ConfigEntryEntity> {
    return this.getDal().add(params, userUuid, tx);
  }

  /**
   * Pre-write checks for update: fetch existing, resolve effective type,
   * serialize + validate value, return the DAL patch.
   */
  async prepareUpdate(uuid: string, entity: ConfigEntryUpdateInput) {
    const existing = await this.getByUuid(uuid);
    const effectiveType = (entity.type ?? existing.type) as ConfigType;
    const effectiveTypeConfig =
      entity.type_config !== undefined ? entity.type_config : existing.type_config;

    let valueStr: string;
    if (entity.value !== undefined) {
      valueStr = serializeConfigValue(effectiveType, entity.value);
    } else {
      valueStr = existing.value ?? "";
    }

    // secret: empty string = "leave unchanged" → skip validation
    if (!(effectiveType === "secret" && valueStr === "")) {
      this.assertValidValue(effectiveType, effectiveTypeConfig, valueStr, existing.key);
    }

    return {
      value: entity.value !== undefined ? valueStr : undefined,
      type: entity.type,
      type_config: entity.type_config,
    };
  }

  /** Tx-capable update — the caller wraps this in `runEntityWrite`. */
  async update(
    uuid: string,
    patch: { value?: string; type?: string; type_config?: string | null; version?: number | bigint },
    userUuid: string,
    tx?: PoolClient,
  ): Promise<void> {
    try {
      await this.getDal().update(uuid, patch, userUuid, tx);
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  /**
   * Bulk update: per-item validation + reserved-row rule, then a single
   * transactional `bulkUpdate` (temp-table strategy). Returns affected count.
   */
  async bulkUpdate(
    items: Array<ConfigEntryUpdateInput & { uuid: string; version: number | bigint }>,
    userUuid: string,
  ): Promise<number> {
    const dal = this.getDal();
    const validUpdates: Array<{
      uuid: string;
      version: number;
      value?: string;
      type?: string;
      type_config?: string | null;
    }> = [];

    for (const item of items) {
      const existing = await dal.findByUuid(item.uuid);
      if (!existing) throw this.notFound(item.uuid);

      // Optimistic concurrency is enforced atomically by the DAL updateMany
      // version guard (ERR01 with per-row detail) — no manual check here.

      // Reserved-row rule: type and type_config cannot be changed on reserved rows.
      if (existing.reserved) {
        const typeChanged = item.type !== undefined && item.type !== existing.type;
        const typeConfigChanged =
          item.type_config !== undefined && item.type_config !== (existing.type_config ?? null);
        if (typeChanged || typeConfigChanged) {
          throw new ApiError(
            "/errors/reserved-config-type-cannot-be-changed",
            "Reserved config type cannot be changed",
            403,
            `Config key "${existing.key}" is reserved: type and type_config cannot be changed`,
            {
              internal_code: "reserved_config_type_cannot_be_changed",
              severity: "MEDIUM",
              extra: { key: existing.key },
            },
          );
        }
      }

      const effectiveType = (item.type ?? existing.type) as ConfigType;
      const effectiveTypeConfig =
        item.type_config !== undefined ? item.type_config : existing.type_config;

      let valueStr: string | undefined;
      if (item.value !== undefined) {
        valueStr = serializeConfigValue(effectiveType, item.value);
      }

      // secret: empty string = "leave unchanged" → skip value validation + write
      if (effectiveType === "secret" && valueStr === "") {
        validUpdates.push({
          uuid: item.uuid,
          version: Number(item.version),
          type: item.type,
          type_config: item.type_config,
        });
        continue;
      }

      if (valueStr !== undefined) {
        this.assertValidValue(effectiveType, effectiveTypeConfig, valueStr, existing.key);
      }

      validUpdates.push({
        uuid: item.uuid,
        version: Number(item.version),
        value: valueStr,
        type: item.type,
        type_config: item.type_config,
      });
    }

    if (validUpdates.length > 0) {
      await dal.bulkUpdate(validUpdates, userUuid);
    }
    return validUpdates.length;
  }

  async softDelete(uuid: string, version: number, userUuid: string): Promise<ConfigEntryEntity> {
    try {
      return await this.getDal().softDelete(uuid, version, userUuid);
    } catch (err) {
      throw this.mapDeleteError(err);
    }
  }

  async bulkDelete(
    items: Array<{ uuid: string; version: number | bigint }>,
    userUuid: string,
  ): Promise<{ received: number; affected: number }> {
    try {
      return await this.getDal().bulkSoftDelete(
        items.map((i) => ({ uuid: i.uuid, version: Number(i.version) })),
        userUuid,
      );
    } catch (err) {
      throw this.mapDeleteError(err);
    }
  }

  async restore(uuid: string, version: number, userUuid: string): Promise<ConfigEntryEntity> {
    try {
      return await this.getDal().restore(uuid, version, userUuid);
    } catch (err) {
      if (err instanceof Error && err.message.includes("not found")) {
        throw new ApiError("/errors/not-found", "Config entry not found", 404, err.message, {
          internal_code: "NOT_FOUND",
        });
      }
      throw err;
    }
  }

  /** Post-commit cache refresh — passed to `runEntityWrite`. */
  async refreshCache(): Promise<void> {
    await this.getDal().refreshCache();
  }

  // --- Internals ------------------------------------------------------------

  private assertValidValue(
    type: ConfigType,
    typeConfig: string | null | undefined,
    valueStr: string,
    key: string,
  ): void {
    try {
      validateConfigValue(type, typeConfig ?? undefined, valueStr, key);
    } catch (err) {
      if (err instanceof ConfigValidationError) {
        throw new ValidationError(err.error_label_key, { internal_code: "VALIDATION_ERROR" });
      }
      throw new ValidationError(err instanceof Error ? err.message : "Invalid value", {
        internal_code: "VALIDATION_ERROR",
      });
    }
  }

  private notFound(uuid: string): ApiError {
    return new ApiError("/errors/not-found", "Config entry not found", 404,
      `Config entry with uuid ${uuid} not found`, { internal_code: "NOT_FOUND" });
  }

  private mapWriteError(err: unknown): unknown {
    if (err instanceof ReservedConfigTypeError) {
      return new ApiError(
        "/errors/reserved-config-type-cannot-be-changed",
        "Reserved config type cannot be changed",
        403,
        err.message,
        { internal_code: err.internal_code, severity: "MEDIUM", extra: { key: err.key } },
      );
    }
    if (err instanceof Error && err.message.includes("not found")) {
      return new ApiError("/errors/not-found", "Config entry not found", 404, err.message, {
        internal_code: "NOT_FOUND",
      });
    }
    return err;
  }

  private mapDeleteError(err: unknown): unknown {
    if (err instanceof ReservedConfigError) {
      return new ApiError(
        "/errors/reserved-config-cannot-be-deleted",
        "Reserved config cannot be deleted",
        403,
        err.message,
        { internal_code: err.internal_code, severity: "MEDIUM", extra: { key: err.key } },
      );
    }
    return this.mapWriteError(err);
  }
}
