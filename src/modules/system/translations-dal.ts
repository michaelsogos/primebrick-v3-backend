/**
 * TranslationsDal — data access layer for translation tables.
 *
 * Wraps the `Repository` from `@primebrick/dal-pg`. Uses the SDK's
 * `TranslationsCache` for Redis caching of flat i18n dicts.
 *
 * The BE is the central CRUD gateway for all translation schemas:
 *   - public.translations  (AppTranslationEntity)
 *   - system.translations   (SystemTranslationEntity)
 *   - emailsender.translations (EmailsenderTranslationEntity)
 *
 * The actor for audit fields comes from `requireActor()`.
 */

import type { Pool } from "pg";
import {
  Repository,
  field,
  Filter,
  Sort,
  getQualifiedTableName,
  getEntityPersistenceMeta,
  type EntityClass,
  type FilterExpr,
} from "@primebrick/dal-pg";
import { requireActor, TranslationsCache, type I18nDict } from "@primebrick/sdk";
import { getCachePort } from "../../cache/cache-port-holder.js";
import {
  AppTranslationEntity,
  SystemTranslationEntity,
  EmailsenderTranslationEntity,
} from "./translation_entities.js";

/**
 * Concrete translation entity type. The entity classes extend
 * TranslationEntityBase which implements IAuditableEntity + IDeletableEntity.
 * We cast to `EntityClass & { new(): AppTranslationEntity }` so the DAL's
 * overloaded methods accept the full column set (key, language, value, uuid, etc.).
 */
type TranslationEntityCtor = EntityClass & (new () => AppTranslationEntity);

/** Module code → entity class mapping. */
const MODULE_ENTITIES: Record<string, TranslationEntityCtor> = {
  app: AppTranslationEntity as unknown as TranslationEntityCtor,
  system: SystemTranslationEntity as unknown as TranslationEntityCtor,
  emailsender: EmailsenderTranslationEntity as unknown as TranslationEntityCtor,
};

/** Entity class → schema name (derived from DAL metadata). */
function schemaOf(entity: TranslationEntityCtor): string {
  const meta = getEntityPersistenceMeta(entity);
  return meta.tableSchema;
}

/** Qualified table name from DAL metadata (safe, no interpolation). */
function tableOf(entity: TranslationEntityCtor): string {
  return getQualifiedTableName(entity);
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

export class TranslationsDal {
  private repo: Repository;
  private pool: Pool;
  private caches = new Map<string, TranslationsCache>();

  constructor(pool: Pool) {
    this.repo = new Repository(pool);
    this.pool = pool;
  }

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
   * Get the flat i18n dict for a language from a specific module's schema.
   * PG builds the dict natively via jsonb_object_agg — no Node-side post-processing.
   * Cache-first; falls back to DB on miss.
   */
  async getI18nDict(moduleCode: string, language: string): Promise<I18nDict> {
    const entity = this.resolveEntity(moduleCode);
    const schema = schemaOf(entity);
    const table = tableOf(entity);
    const cache = this.getCache(schema);

    const cached = await cache.getI18nDict(language);
    if (cached) return cached;

    const result = await this.pool.query(
      `SELECT jsonb_object_agg(key, value) AS dict FROM ${table} WHERE language = $1 AND deleted_at IS NULL`,
      [language],
    );
    const dict = (result.rows[0]?.dict ?? {}) as I18nDict;
    await cache.setI18nDict(language, dict);
    return dict;
  }

  /** Paginated list of translation rows for a module. */
  async list(moduleCode: string, query: TranslationListQuery) {
    const entity = this.resolveEntity(moduleCode);
    const filters: FilterExpr[] = [];
    if (query.language) {
      filters.push(Filter.fieldValue(field(entity, "language"), "=", query.language));
    }

    return this.repo.findByPage(
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

  /** Create a new translation row. */
  async create(moduleCode: string, data: TranslationCreateBody) {
    const entity = this.resolveEntity(moduleCode);
    const actor = requireActor();
    const row = await this.repo.add(entity, data, { actor });
    await this.getCache(schemaOf(entity)).invalidate(data.language);
    return row;
  }

  /** Update a translation row by uuid. */
  async update(moduleCode: string, uuid: string, data: TranslationUpdateBody) {
    const entity = this.resolveEntity(moduleCode);
    const actor = requireActor();
    const row = await this.repo.update(
      entity,
      { ...data, uuid },
      { actor, matchBy: "uuid" },
    );
    await this.getCache(schemaOf(entity)).invalidate();
    return row;
  }

  /** Soft-delete a translation row by uuid. */
  async softDelete(moduleCode: string, uuid: string) {
    const entity = this.resolveEntity(moduleCode);
    const actor = requireActor();
    await this.repo.delete(entity, { uuid }, { actor, matchBy: "uuid" });
    await this.getCache(schemaOf(entity)).invalidate();
  }

  /** Restore a soft-deleted translation row by uuid. */
  async restore(moduleCode: string, uuid: string) {
    const entity = this.resolveEntity(moduleCode);
    const actor = requireActor();
    await this.repo.restore(entity, { uuid }, { actor, matchBy: "uuid" });
    await this.getCache(schemaOf(entity)).invalidate();
  }
}
