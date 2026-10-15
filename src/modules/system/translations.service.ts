/**
 * TranslationsService — the translation CRUD gateway service.
 *
 * The ONLY place translation rows are read/written. The BE is the central
 * CRUD gateway for all translation schemas:
 *   - public.translations        (AppTranslationEntity)
 *   - system.translations        (SystemTranslationEntity)
 *   - emailsender.translations   (EmailsenderTranslationEntity)
 *   - custom.translations        (CustomTranslationEntity — user-created keys)
 *
 * Data access is `initDal()` proxies (entity ops, schema-domain guarded —
 * `translations` is the governed shared table). Caching uses the SDK's
 * `TranslationsCache` for Redis-backed flat i18n dicts + ETags.
 * The service is request-context-free: it never touches `req`/`res`.
 * Errors propagate to the centralized `errorHandler` as RFC 7807.
 * The actor for audit fields comes from `requireActor()`.
 */

import {
  field,
  Filter,
  Project,
  Sort,
  getEntityPersistenceMeta,
  type Repository,
  type EntityClass,
  type FilterExpr,
} from "@primebrick/dal-pg";
import {
  requireActor,
  TranslationsCache,
  type I18nDict,
  type CacheEntry,
  wrapCacheEntry,
} from "@primebrick/sdk";

import { initDal } from "../../db/dal-gateway.js";
import { getCachePort } from "../../cache/cache-port-holder.js";
import { ValidationError } from "../../http/api-errors.js";
import {
  AppTranslationEntity,
  SystemTranslationEntity,
  EmailsenderTranslationEntity,
  CustomTranslationEntity,
} from "./translation_entities.js";

/**
 * Concrete translation entity type. The entity classes extend
 * TranslationEntityBase which implements IAuditableEntity + IDeletableEntity.
 * We cast to `EntityClass & { new(): AppTranslationEntity }` so the DAL's
 * overloaded methods accept the full column set (key, language, value, uuid, etc.).
 */
type TranslationEntityCtor = EntityClass & (new () => AppTranslationEntity);

/**
 * Module code → entity class mapping.
 *
 * The `settings` module is a reserved shell module whose translations live in
 * `system.translations` (keys are `system.settings.*`). It has no own schema.
 * Other module codes (from microservices) map to their own translation schemas.
 */
const MODULE_ENTITIES: Record<string, TranslationEntityCtor> = {
  app: AppTranslationEntity as unknown as TranslationEntityCtor,
  system: SystemTranslationEntity as unknown as TranslationEntityCtor,
  settings: SystemTranslationEntity as unknown as TranslationEntityCtor,
  emailsender: EmailsenderTranslationEntity as unknown as TranslationEntityCtor,
  custom: CustomTranslationEntity as unknown as TranslationEntityCtor,
};

/**
 * User-created translations live only in custom.translations and their keys
 * MUST start with `custom.`. Conversely, `custom.*` keys are forbidden in every
 * module-owned schema. Enforced here so collisions are impossible by
 * construction (seed/module keys are never shadowed by user keys).
 */
const CUSTOM_KEY_PREFIX = /^custom\./;

function assertKeyModuleBoundary(moduleCode: string, key?: string): void {
  if (key === undefined) return;
  const isCustomModule = moduleCode.toLowerCase() === "custom";
  if (isCustomModule && !CUSTOM_KEY_PREFIX.test(key)) {
    throw new ValidationError(`Keys in module 'custom' must start with 'custom.' (got '${key}')`, {
      internal_code: "VALIDATION_ERROR",
    });
  }
  if (!isCustomModule && CUSTOM_KEY_PREFIX.test(key)) {
    throw new ValidationError(`Keys starting with 'custom.' belong to module 'custom' (got '${key}')`, {
      internal_code: "VALIDATION_ERROR",
    });
  }
}

/** Entity class → schema name (derived from DAL metadata). */
function schemaOf(entity: TranslationEntityCtor): string {
  const meta = getEntityPersistenceMeta(entity);
  return meta.tableSchema;
}

export interface TranslationListQuery {
  page?: number;
  page_size?: number;
  language?: string;
  sort_key?: string;
  sort_dir?: "asc" | "desc";
  deleted_records?: "EXCLUDED" | "ONLY" | "INCLUDED";
}

export interface TranslationCreateBody {
  key: string;
  language: string;
  value: string;
}

export interface TranslationUpdateBody {
  key?: string;
  language?: string;
  value?: string;
}

export class TranslationsService {
  private caches = new Map<string, TranslationsCache>();

  private getCache(schema: string): TranslationsCache {
    let cache = this.caches.get(schema);
    if (!cache) {
      cache = new TranslationsCache(getCachePort(), schema);
      this.caches.set(schema, cache);
    }
    return cache;
  }

  /** Resolve module code → entity class. Throws if unknown. */
  resolveEntity(moduleCode: string): TranslationEntityCtor {
    const entity = MODULE_ENTITIES[moduleCode.toLowerCase()];
    if (!entity) {
      throw new Error(`Unknown translation module: '${moduleCode}'`);
    }
    return entity;
  }

  /**
   * Flat i18n dict for a module schema (cached; used with etagMiddleware).
   * Returns the full `CacheEntry` (data + etag) so the ETag middleware can
   * answer conditional GET requests.
   */
  async getI18nDict(
    moduleCode: string,
    language: string,
  ): Promise<CacheEntry<I18nDict>> {
    const entity = this.resolveEntity(moduleCode);
    const schema = schemaOf(entity);
    const cache = this.getCache(schema);

    const cached = await cache.getI18nDict(language);
    if (cached) return cached;

    const rows = (await initDal().findAll(
      entity,
      [Project.expr("jsonb_object_agg(key, value)", "dict")],
      {
        filters: [Filter.fieldValue(field(entity, "language"), "=", language)],
      },
    )) as { dict: I18nDict | null }[];
    const dict = (rows[0]?.dict ?? {}) as I18nDict;
    const entry = wrapCacheEntry(dict);
    await cache.setI18nDict(language, dict);
    return entry;
  }

  /** Paginated list of translation rows for a module. */
  async list(moduleCode: string, query: TranslationListQuery) {
    const entity = this.resolveEntity(moduleCode);
    const filters: FilterExpr[] = [];
    if (query.language) {
      filters.push(Filter.fieldValue(field(entity, "language"), "=", query.language));
    }

    return initDal().findByPage(
      entity,
      query.page ?? 1,
      query.page_size ?? 25,
      null,
      {
        filters: filters.length > 0 ? filters : undefined,
        sorting: query.sort_key
          ? [Sort.by(field(entity, query.sort_key as "key"), (query.sort_dir ?? "asc").toUpperCase() as "ASC" | "DESC")]
          : undefined,
        deletedRecords: query.deleted_records ?? "EXCLUDED",
      },
    );
  }

  /**
   * Create a new translation row.
   * `options.tx` — run inside an open transaction (tx-scoped `Repository`
   * from `dal.transaction`): the write is appended to the tx and cache
   * invalidation is deferred to the caller
   * (post-commit via `invalidateModuleCache`).
   * `options.onConflict` — forwarded to `Repository.add` (default "raise";
   * "ignore" = `ON CONFLICT DO NOTHING`, row skipped → returns undefined).
   */
  async create(
    moduleCode: string,
    data: TranslationCreateBody,
    options?: { tx?: Repository; onConflict?: "raise" | "ignore" },
  ) {
    assertKeyModuleBoundary(moduleCode, data.key);
    const entity = this.resolveEntity(moduleCode);
    const actor = requireActor();
    const repo = options?.tx ?? initDal();
    const row = await repo.add(entity, data, {
      actor,
      onConflict: options?.onConflict,
    });
    if (!options?.tx) {
      await this.getCache(schemaOf(entity)).invalidate(data.language);
    }
    return row;
  }

  /**
   * Invalidate the Redis dict cache for a module — used by callers that ran
   * creates inside a transaction (invalidation must happen post-commit).
   */
  async invalidateModuleCache(moduleCode: string, language?: string): Promise<void> {
    const entity = this.resolveEntity(moduleCode);
    await this.getCache(schemaOf(entity)).invalidate(language);
  }

  /** Update a translation row by uuid. */
  async update(moduleCode: string, uuid: string, data: TranslationUpdateBody) {
    assertKeyModuleBoundary(moduleCode, data.key);
    const entity = this.resolveEntity(moduleCode);
    const actor = requireActor();
    const row = await initDal().update(
      entity,
      { ...data, uuid },
      { actor },
    );
    await this.getCache(schemaOf(entity)).invalidate();
    return row;
  }

  /** Soft-delete a translation row by uuid. */
  async softDelete(moduleCode: string, uuid: string) {
    const entity = this.resolveEntity(moduleCode);
    const actor = requireActor();
    const row = (await initDal().findByUUID<any, any>(entity, uuid, { deletedRecords: "INCLUDED" }))!;
    await initDal().delete(entity, { uuid, version: row.version }, { actor });
    await this.getCache(schemaOf(entity)).invalidate();
  }

  /** Restore a soft-deleted translation row by uuid. */
  async restore(moduleCode: string, uuid: string) {
    const entity = this.resolveEntity(moduleCode);
    const actor = requireActor();
    const row = (await initDal().findByUUID<any, any>(entity, uuid, { deletedRecords: "INCLUDED" }))!;
    await initDal().restore(entity, { uuid, version: row.version }, { actor });
    await this.getCache(schemaOf(entity)).invalidate();
  }
}
