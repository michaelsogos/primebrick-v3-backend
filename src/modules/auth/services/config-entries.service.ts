/**
 * ConfigEntriesService — the worker service that owns `config_entries`.
 *
 * `config_entries` is the key/value store for ALL configuration (auth +
 * gateway + telemetry + feature flags) — the sole source of truth, no
 * env-var fallbacks.
 *
 * Owns: secret masking (DTO shaping), duplicate-key checks, typed-value
 * serialization (`serializeConfigValue`) and validation (`validateConfigValue`),
 * the reserved-row rules, per-item bulk validation, audit paging, the manual
 * list cache (Redis + ETag) and post-commit cache refresh — plus
 * `loadAuthConfigOnly()`, the auth-scoped projection used by bootstrap
 * (`initAuthPorts`, `loadAuthConfig`) and `getAuthConfig`.
 *
 * Absorbs the former `config_entries_dal.ts` + `config-repo.ts` wrappers —
 * the class IS the service layer: CONTROLLER → WORKER SERVICE → DAL lib → DB.
 *
 * The service is request-context-free: it never touches `req`/`res`.
 * Controllers keep transport concerns only (validation schemas, RBAC,
 * `runEntityWrite` orchestration, HTTP status codes). Errors are thrown as
 * `ApiError` subclasses so `errorHandler` converts them to RFC 7807.
 */

import type { Repository } from "@primebrick/dal-pg";
import {
  field,
  Filter,
  Sort,
  buildAuditableJoinsSelective,
  trustedUUID,
} from "@primebrick/dal-pg";
import {
  validateConfigValue,
  coerceConfigValue,
  serializeConfigValue,
  ConfigValidationError,
  AuthMode,
  logger,
  type ConfigType,
  type CacheEntry,
  wrapCacheEntry,
} from "@primebrick/sdk";

import { DomainService } from "../../../db/domain-service.js";
import { EntityAuditPort } from "../../../db/entity-audit-port.js";
import { getCachePort } from "../../../cache/cache-port-holder.js";
import { findAuditPage } from "../../../db/audit-query-helper.js";
import { ApiError, ValidationError } from "../../../http/api-errors.js";
import { ConfigEntryEntity } from "../config_entry_entity.js";
import { UserProfileEntity } from "../user_profile_entity.js";

const LIST_CACHE_KEY = "dal:config_entries:list";
const LIST_CACHE_TTL = 300_000; // 5 min — same as entity TTL

// ─── Types ───────────────────────────────────────────────────────────────────

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

/**
 * Auth-scoped projection of `config_entries` — the subset the auth module
 * needs. Loaded by `loadAuthConfigOnly()` from the FULL table (auth keys
 * live alongside every other config key — they are not a separate store).
 *
 * ALL field names are snake_case — matching the DB keys exactly. No DTO
 * renaming. Values are exactly what the DB has: `undefined` if the key is
 * missing, `null` if the row exists but value is NULL, `string` if present.
 * NO fallback defaults — mandatory-field checks throw in the loader.
 */
export interface AuthConfigDb {
  // --- IDP / OIDC config ---
  idp_endpoint?: string;
  idp_organization?: string;
  idp_client_id?: string;
  idp_client_secret?: string;
  oidc_issuer_url?: string;
  idp_type?: string;
  oidc_client_id?: string;
  oidc_client_secret?: string;
  oidc_audience?: string;
  enable_email_verification_check: boolean; // parsed from "true"/"false"
  enable_webauthn: boolean; // parsed from "true"/"false"
  passkey_required: boolean; // parsed from "true"/"false"
  password_policy?: string;

  // --- MFA / 2FA config ---
  enable_mfa: boolean; // parsed from "true"/"false"
  mfa_challenge_token_ttl_seconds: number; // parsed from string → number
  mfa_challenge_signing_secret?: string; // auto-generated if empty

  // --- Auth mode + roles path ---
  auth_mode: AuthMode; // validated + normalized to uppercase
  auth_roles_path?: string;

  // --- Gateway config (only required in GATEWAY mode) ---
  service_client_shield_secret?: string;
  service_client_shield_secret_header?: string;
  gateway_public_secret?: string;
  gateway_public_secret_header?: string;
  gateway_header_user_id?: string;
  gateway_header_email?: string;
  gateway_header_name?: string;
  gateway_header_roles?: string;
  gateway_header_idp_code?: string;
  gateway_header_idp_org?: string;
  gateway_header_idp_username?: string;

  // --- Redis cache (optional) ---
  // Empty or undefined = cache disabled (best-effort, system valid without it).
  // Set to a Redis URL (e.g. "redis://redis:6379" or "redis://external-redis:6379")
  // to enable the cache layer. Configured by the admin in the config_entries table.
  redis_url?: string;
}

// ─── Errors ──────────────────────────────────────────────────────────────────

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

// ─── Service ─────────────────────────────────────────────────────────────────

export class ConfigEntriesService extends DomainService<
  Record<string, unknown>
> {
  constructor() {
    super({
      entity: ConfigEntryEntity,
      list: {
        searchableKeys: ["key", "label_key"],
        filterableKeys: new Set(["key", "type", "group_key", "reserved"]),
        defaultSort: { key: "key", dir: "asc" },
      },
    });
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

  /**
   * Load all config rows (excluding soft-deleted) — raw entity rows.
   * Uses the manual list cache (Redis) with ETag support.
   */
  async findAll(): Promise<ConfigEntryEntity[]> {
    const entry = await this.findAllWithCache();
    return entry.data;
  }

  /**
   * Same as `findAll` but returns the full `CacheEntry` (data + etag).
   * Used by the ETag middleware to answer conditional GET requests.
   */
  async findAllWithCache(): Promise<CacheEntry<ConfigEntryEntity[]>> {
    const port = getCachePort();
    if (port) {
      try {
        const cached = await port.get<CacheEntry<ConfigEntryEntity[]>>(LIST_CACHE_KEY);
        if (cached && typeof cached === "object" && "data" in cached && "etag" in cached) {
          return cached;
        }
      } catch { /* best-effort — fall through to DB */ }
    }

    const rows = await this.dal.findAll<ConfigEntryEntity, ConfigEntryEntity>(
      ConfigEntryEntity,
      null,
      {
        sorting: [
          Sort.by(field(ConfigEntryEntity, "group_key" as any), "ASC"),
          Sort.by(field(ConfigEntryEntity, "key" as any), "ASC"),
        ],
        joins: buildAuditableJoinsSelective(ConfigEntryEntity, UserProfileEntity, {
          includeCreator: false,
          includeUpdater: true,
          includeDeleter: false,
        }),
      }
    );
    const result = rows as ConfigEntryEntity[];
    const entry = wrapCacheEntry(result);
    if (port) {
      try {
        await port.set(LIST_CACHE_KEY, entry, LIST_CACHE_TTL);
      } catch { /* best-effort */ }
    }
    return entry;
  }

  /** Find a single config row by key. Returns `null` if not found. */
  async findByKey(key: string): Promise<ConfigEntryEntity | null> {
    return this.dal.find<ConfigEntryEntity, ConfigEntryEntity>(
      ConfigEntryEntity,
      null,
      {
        filters: [
          Filter.fieldValue(field(ConfigEntryEntity, "key" as any), "=", key),
        ],
        throwIfNotFound: false,
      }
    );
  }

  /** Find a single config row by uuid. Returns `null` if not found. */
  async findByUuid(uuid: string): Promise<ConfigEntryEntity | null> {
    return this.dal.findByUUID<ConfigEntryEntity, ConfigEntryEntity>(
      ConfigEntryEntity,
      uuid,
      { throwIfNotFound: false }
    );
  }

  async getByUuid(uuid: string): Promise<ConfigEntryEntity> {
    const row = await this.findByUuid(uuid);
    if (!row) throw this.notFound(uuid);
    return row;
  }

  async getAudit(uuid: string, page: number, limit: number) {
    await this.getByUuid(uuid); // verifies the config entry exists
    return findAuditPage(this.dal, {
      tableName: "config_entries_audit",
      entityUuid: uuid,
      page,
      limit,
    });
  }

  /**
   * Load the auth-scoped projection of `config_entries` (was
   * `loadAuthConfigFromDb` in `config-repo.ts`).
   *
   * Reads the FULL table via `findAll()` — auth keys are regular config
   * rows, not a separate store. Mandatory-field checks throw before the
   * return. The only transformations are TYPE conversions:
   *   - `enable_*` / `passkey_required` / `enable_mfa`: string → boolean
   *   - `mfa_challenge_token_ttl_seconds`: string → number
   *   - `auth_mode`: validated + normalized to uppercase
   * NO lowercasing, NO fallback defaults, NO field-by-field DTO mapping.
   */
  async loadAuthConfigOnly(): Promise<AuthConfigDb> {
    const rows = await this.findAll();

    // Reduce typed entity rows into a key/value map. Snake_case keys preserved
    // from the DB — NO renaming. Values are exactly what the DB has:
    //   - undefined if the key doesn't exist in the DB
    //   - null if the row exists but value is NULL
    //   - string if the row exists with a value
    // NO coercion to "" — that would mix real data with fake defaults.
    const settings = rows.reduce((acc, row) => {
      acc[row.key] = row.value ?? null;
      return acc;
    }, {} as Record<string, string | null>);

    // --- Mandatory-field checks (fail loud, no silent defaults) ---
    if (!settings.auth_mode) {
      throw new Error("[auth] auth_mode is missing in config_entries table");
    }
    const mode = settings.auth_mode.toUpperCase();
    if (mode !== AuthMode.STANDALONE && mode !== AuthMode.GATEWAY) {
      throw new Error(
        `[auth] auth_mode must be "${AuthMode.STANDALONE}" or "${AuthMode.GATEWAY}", got: "${mode}"`
      );
    }

    // auth_roles_path is mandatory in all modes — used to extract roles from JWT.
    if (!settings.auth_roles_path) {
      throw new Error("[auth] auth_roles_path is missing in config_entries table");
    }

    // In GATEWAY mode, ALL gateway fields are mandatory — no fake defaults.
    if (mode === AuthMode.GATEWAY) {
      const requiredGatewayFields = [
        "service_client_shield_secret",
        "service_client_shield_secret_header",
        "gateway_public_secret",
        "gateway_public_secret_header",
        "gateway_header_user_id",
        "gateway_header_email",
        "gateway_header_name",
        "gateway_header_roles",
        "gateway_header_idp_code",
        "gateway_header_idp_org",
        "gateway_header_idp_username",
      ];
      for (const key of requiredGatewayFields) {
        if (!settings[key]) {
          throw new Error(
            `[auth] ${key} is missing or empty in config_entries table (required in GATEWAY mode)`
          );
        }
      }
    }

    // In STANDALONE mode, OIDC fields are mandatory — no fake defaults.
    if (mode === AuthMode.STANDALONE) {
      const requiredOidcFields = [
        "oidc_issuer_url",
        "oidc_client_id",
        "oidc_client_secret",
        "idp_type",
      ];
      for (const key of requiredOidcFields) {
        if (!settings[key]) {
          throw new Error(
            `[auth] ${key} is missing or empty in config_entries table (required in STANDALONE mode)`
          );
        }
      }
    }

    // Spread the key/value map AS-IS. Override ONLY the fields that need a
    // real TYPE transformation. auth_mode is normalized to uppercase for enum
    // comparison.
    // NO lowercasing — data quality is enforced at the upsert path.
    // NO field-by-field DTO mapping. NO fallback defaults.
    // Form auth (username/password) is an invariant — always available, not
    // configurable. There is no enable_formauth flag.
    return {
      ...settings,
      enable_email_verification_check: settings.enable_email_verification_check === "true",
      enable_webauthn: settings.enable_webauthn === "true",
      passkey_required: settings.passkey_required === "true",
      enable_mfa: settings.enable_mfa === "true",
      mfa_challenge_token_ttl_seconds: settings.mfa_challenge_token_ttl_seconds
        ? parseInt(settings.mfa_challenge_token_ttl_seconds, 10)
        : 300,
      mfa_challenge_signing_secret: settings.mfa_challenge_signing_secret ?? undefined,
      auth_mode: mode, // normalized to uppercase, already validated above
    } as AuthConfigDb;
  }

  // --- Writes ---------------------------------------------------------------

  /**
   * Pre-write checks for create: duplicate key + value serialization +
   * validation. Returns the DB-shaped params to persist.
   */
  async prepareCreate(entity: ConfigEntryCreateInput) {
    const existing = await this.findByKey(entity.key);
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

  /**
   * Insert a new config row with full metadata.
   * Invalidates + reloads the in-memory auth config cache so the change
   * is visible immediately to all hot-path readers (getAuthConfig()).
   *
   * NOTE: Value validation is handled by the router/service layer using the
   * SDK's `validateConfigValue` (see `prepareCreate`) — this write does not
   * validate.
   */
  async createEntry(
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
    updatedBy: string,
    tx?: Repository
  ): Promise<ConfigEntryEntity> {
    // When tx is provided, the write is appended to the open transaction and
    // the cache reload is deferred — the caller must run it post-commit.
    const repo = tx ?? this.dal;
    const row = await repo.add(
      ConfigEntryEntity,
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
      { actor: updatedBy, audit: new EntityAuditPort(repo) }
    );
    if (!tx) await this.reloadCache();
    return row as ConfigEntryEntity;
  }

  /**
   * Pre-write checks for update: fetch existing, resolve effective type,
   * serialize + validate value, return the patch.
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

  /**
   * Update a config row by uuid.
   *
   * Reserved-row rule (enforced here, NOT in the generic DAL):
   *   - `reserved === true`:  `value` is editable, but `type` and `type_config`
   *     CANNOT be changed. Throws `ReservedConfigTypeError` if attempted.
   *   - `reserved === false`: all fields are editable.
   *
   * For `secret` type, an empty `value` string means "leave unchanged" → skip write.
   * Invalidates + reloads the in-memory auth config cache.
   * Throws if the row is not found.
   */
  async updateEntry(
    uuid: string,
    patch: { value?: string; type?: string; type_config?: string | null; version?: number | bigint },
    updatedBy: string,
    tx?: Repository
  ): Promise<void> {
    try {
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
        if (!(existing.type === "secret" && patch.value === "")) {
          updateEntity.value = patch.value;
        }
      }

      if (patch.type !== undefined) {
        updateEntity.type = patch.type;
      }

      if (patch.type_config !== undefined) {
        updateEntity.type_config = patch.type_config;
      }

      // Optimistic concurrency — the auditable write requires `version`.
      if (patch.version !== undefined) {
        updateEntity.version = Number(patch.version);
      }

      // Only write if there's something to update (not just id).
      if (Object.keys(updateEntity).length > 1) {
        // When tx is provided, the write is appended to the open transaction
        // and the cache reload is deferred to the caller (post-commit).
        const repo = tx ?? this.dal;
        await repo.update(
          ConfigEntryEntity,
          updateEntity as Partial<ConfigEntryEntity> & { id: bigint },
          { actor: updatedBy, audit: new EntityAuditPort(repo) }
        );
        if (!tx) await this.reloadCache();
      }
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  /**
   * Bulk update: per-item validation + reserved-row rule, then a single
   * transactional `updateMany` (temp-table strategy). Returns affected count.
   */
  async bulkUpdate(
    items: Array<ConfigEntryUpdateInput & { uuid: string; version: number | bigint }>,
    userUuid: string,
  ): Promise<number> {
    const validUpdates: Array<{
      uuid: string;
      version: number;
      value?: string;
      type?: string;
      type_config?: string | null;
    }> = [];

    for (const item of items) {
      const existing = await this.findByUuid(item.uuid);
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
      // `updateMany` (TEMP TABLE strategy) — `version` is the caller-observed
      // per-row optimistic-concurrency guard (never a SET column).
      await this.dal.updateMany(
        ConfigEntryEntity,
        validUpdates.map((u) => {
          const entity: Record<string, unknown> = { uuid: u.uuid, version: u.version };
          if (u.value !== undefined) entity.value = u.value;
          if (u.type !== undefined) entity.type = u.type;
          if (u.type_config !== undefined) entity.type_config = u.type_config;
          return entity as Partial<ConfigEntryEntity> & { uuid: string };
        }),
        { actor: userUuid, matchBy: "uuid" }
      );
      await this.reloadCache();
    }
    return validUpdates.length;
  }

  /**
   * Soft-delete a config row by uuid.
   * Rejects reserved rows (they are system-critical and cannot be deleted).
   * Invalidates + reloads the in-memory auth config cache.
   */
  async softDelete(uuid: string, version: number, deletedBy: string): Promise<ConfigEntryEntity> {
    try {
      // The read below exists ONLY for the reserved-row business rule and the
      // not-found check — it is NOT used to manufacture a version. The write is
      // guarded by the caller-observed `version` (ERR02/ERR01 via Repository).
      const existing = await this.findByUuid(uuid);
      if (!existing) {
        throw new Error(`Auth config row with uuid ${uuid} not found`);
      }
      if (existing.reserved) {
        throw new ReservedConfigError(existing.key);
      }
      const row = await this.dal.delete(
        ConfigEntryEntity,
        { uuid, version },
        { actor: deletedBy, audit: new EntityAuditPort(this.dal) }
      );
      await this.reloadCache();
      return row as ConfigEntryEntity;
    } catch (err) {
      throw this.mapDeleteError(err);
    }
  }

  /**
   * Soft-delete multiple config rows by uuid.
   * Rejects the entire batch if any row is reserved (all-or-nothing).
   * Invalidates + reloads the in-memory auth config cache.
   */
  async bulkSoftDelete(
    items: Array<{ uuid: string; version: number | bigint }>,
    deletedBy: string,
  ): Promise<{ received: number; affected: number }> {
    try {
      // Reserved-row rule is a business rule of this entity — it stays in the
      // service, NOT in the generic DAL. One set-based read (no per-item
      // loop): fetch all target rows once and reject the whole batch if any is
      // reserved or missing. The write itself is the atomic DAL deleteMany —
      // the per-row `version` is the caller-observed optimistic-concurrency
      // guard (ERR01/ERR03 per row, single pg_raise, all-or-nothing).
      const uuids = items.map((i) => i.uuid);
      const rows = (await this.dal.findAll<ConfigEntryEntity, ConfigEntryEntity>(
        ConfigEntryEntity,
        null,
        {
          filters: [
            Filter.fieldValue(field(ConfigEntryEntity, "uuid" as any), "IN", uuids),
          ],
        },
      )) as ConfigEntryEntity[];
      const byUuid = new Map(rows.map((r: ConfigEntryEntity) => [r.uuid, r]));
      for (const item of items) {
        const row = byUuid.get(trustedUUID(item.uuid));
        if (!row) {
          throw new Error(`Auth config row with uuid ${item.uuid} not found`);
        }
        if (row.reserved) {
          throw new ReservedConfigError(row.key);
        }
      }
      const result = await this.dal.deleteMany(
        ConfigEntryEntity,
        items.map((i) => ({ uuid: i.uuid, version: Number(i.version) })),
        { actor: deletedBy, matchBy: "uuid" as never },
      );
      await this.reloadCache();
      return result;
    } catch (err) {
      throw this.mapDeleteError(err);
    }
  }

  /**
   * Restore a soft-deleted config row by uuid.
   * Invalidates + reloads the in-memory auth config cache.
   */
  async restoreEntry(uuid: string, version: number, updatedBy: string): Promise<ConfigEntryEntity> {
    try {
      // Read for not-found only — version is caller-observed (ERR02/ERR01).
      const existing = await this.dal.findByUUID<ConfigEntryEntity, ConfigEntryEntity>(
        ConfigEntryEntity,
        uuid,
        { deletedRecords: "INCLUDED", throwIfNotFound: false }
      );
      if (!existing) {
        throw new Error(`Auth config row with uuid ${uuid} not found`);
      }
      const row = await this.dal.restore(
        ConfigEntryEntity,
        { uuid, version },
        { actor: updatedBy, audit: new EntityAuditPort(this.dal) }
      );
      await this.reloadCache();
      return row as ConfigEntryEntity;
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
    await this.reloadCache();
  }

  // --- Internals ------------------------------------------------------------

  /**
   * Reload the SDK's in-memory auth config cache from the DB.
   *
   * Uses a dynamic import to break the static circular dependency:
   *   config-entries.service.ts → config.ts → sdk-auth-ports.ts
   *     → config-entries.service.ts
   *
   * If the reload fails, the previous cache is left intact (loadAuthConfig
   * only overwrites `cached` on success), so the server keeps running with
   * the stale config rather than throwing on every getAuthConfig() call.
   */
  private async reloadCache(): Promise<void> {
    // Invalidate the list cache (manual cache for findAll)
    const port = getCachePort();
    if (port) {
      try {
        await port.del(LIST_CACHE_KEY);
      } catch { /* best-effort — entity prefix invalidation handled by withCache */ }
    }
    try {
      const { loadAuthConfig } = await import("../config.js");
      await loadAuthConfig();
      // Telemetry/logging rows live in config_entries too — re-apply in
      // process (no restarts) and broadcast `config.changed` to microservices.
      const { applyTelemetryConfigFromDb } = await import("../../../observability/telemetry.js");
      await applyTelemetryConfigFromDb();
    } catch (err) {
      logger.warn(
        "Failed to reload auth config cache after write. " +
          "The DB was updated but the in-memory cache is stale — restart the server to pick up the change.",
      { tags: ["auth"], error: err });
    }
  }

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

let instance: ConfigEntriesService | undefined;

/**
 * Lazy singleton accessor — the first call happens inside request handling,
 * always post-bootstrap, so `getDal()` is already initialized. A module-level
 * `new` would crash the import graph before `initDal()` runs.
 */
export function getConfigEntriesService(): ConfigEntriesService {
  return (instance ??= new ConfigEntriesService());
}
