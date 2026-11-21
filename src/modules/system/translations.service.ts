/**
 * TranslationsService — the translation CRUD gateway service.
 *
 * The ONLY place translation rows are read/written. The BE is the central
 * CRUD gateway for all translation schemas:
 *   - public.translations        (AppTranslationEntity — `app.*` keys only)
 *   - system.translations        (SystemTranslationEntity — `system.*` keys only)
 *   - custom.translations        (CustomTranslationEntity — `custom.*` user keys)
 *   - <service>.translations     (discovered from service_registry — every
 *     registered microservice owns its translations schema and may write
 *     ONLY `<code>.*` keys; no BE-side hardcoded module map)
 *
 * Data access is `getDal()` proxies (entity ops, schema-domain guarded —
 * `translations` is the governed shared table). Caching uses the SDK's
 * `TranslationsCache` for Redis-backed flat i18n dicts + ETags.
 * The service is request-context-free: it never touches `req`/`res`.
 * Errors propagate to the centralized `errorHandler` as RFC 7807.
 * The actor for audit fields comes from `requireActor()`.
 */

import {
  Entity,
  field,
  Filter,
  Project,
  Sort,
  getEntityPersistenceMeta,
  TranslationEntityBase,
  type Repository,
  type EntityClass,
  type EntityListQuery,
  type EntityListResult,
  type EntityService,
  type FilterExpr,
} from "@primebrick/dal-pg";
import {
  requireActor,
  TranslationsCache,
  translationKeyNamespace,
  keyNamespaceOf,
  translationKeyGrammarError,
  type I18nDict,
  type CacheEntry,
  wrapCacheEntry,
} from "@primebrick/sdk";

import {getDal} from "../../db/dal-gateway.js";
import { getCachePort } from "../../cache/cache-port-holder.js";
import { ApiError, NotFoundError, ValidationError } from "../../http/api-errors.js";
import { ServiceRegistryService } from "./service-registry.service.js";
import {
  AppTranslationEntity,
  SystemTranslationEntity,
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
/**
 * Module code → entity class mapping — BE-OWNED schemas only
 * (`app`/`system`/`settings` shell/`custom`). Registered microservices are
 * discovered from `service_registry` — never add a service schema here.
 */
export const MODULE_ENTITIES: Record<string, TranslationEntityCtor> = {
  app: AppTranslationEntity as unknown as TranslationEntityCtor,
  system: SystemTranslationEntity as unknown as TranslationEntityCtor,
  settings: SystemTranslationEntity as unknown as TranslationEntityCtor,
  custom: CustomTranslationEntity as unknown as TranslationEntityCtor,
};

/**
 * The write boundary: a module may create/update translation keys ONLY
 * inside the namespace owned by its entity's PG schema
 * (`public`→`app.*`, else `<schema>.*` — `custom` is the same rule, not a
 * special case). This makes cross-module dictionary collisions impossible
 * by construction: a service can never write `system.*` keys into its own
 * schema nor `<svc>.*` keys anywhere else. Meta-declared key REFERENCES are
 * unaffected — they may cite `app.*`/`system.*` CORE labels from any module.
 */
export function assertKeyNamespace(entity: TranslationEntityCtor, key?: string): void {
  if (key === undefined) return;
  const bad = translationKeyGrammarError(key);
  if (bad !== null) {
    throw new ValidationError(`Key '${key}': ${bad}`, {
      internal_code: "TRANSLATION_KEY_GRAMMAR",
    });
  }
  const ns = translationKeyNamespace(schemaOf(entity));
  if (keyNamespaceOf(key) !== ns) {
    throw new ValidationError(
      `Key '${key}' is outside the '${ns}.*' namespace owned by schema '${schemaOf(entity)}'`,
      { internal_code: "TRANSLATION_NAMESPACE_VIOLATION" },
    );
  }
}

/** Entity class → schema name (derived from DAL metadata). */
function schemaOf(entity: TranslationEntityCtor): string {
  const meta = getEntityPersistenceMeta(entity);
  return meta.tableSchema;
}

/**
 * Canonical `EntityListQuery` (filters/search/search_in/connector/sort/
 * paging/deleted_records) plus the dedicated `language` convenience param,
 * merged into the WHERE through `extraFilters` — never a bespoke query.
 */
export type TranslationListQuery = Omit<EntityListQuery, "sort_key"> & {
  /** Zod `sort_key` parses nullable — normalized to `undefined` on entry. */
  sort_key?: string | null;
  language?: string;
};

/** Every row column is filterable/searchable — the translation list honors
 *  the same "no limits" contract as every other entity list. */
const TRANSLATION_FILTERABLE_KEYS = new Set([
  "key",
  "language",
  "value",
  "uuid",
  "created_at",
  "updated_at",
  "deleted_at",
  "created_by",
  "updated_by",
  "deleted_by",
]);
const TRANSLATION_SEARCHABLE_KEYS = ["key", "value"] as const;

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

// ─── findTranslations — the ONE documented cross-domain read exception ────
//
// Translations are the ONLY data allowed to cross the module-segregation
// boundary, by deliberate platform decision: every other cross-module read
// is forbidden. The exception is centralized HERE — one method, filter-gated
// by required match strings — so the surface stays observable and minimal:
// the caller names the keys it needs and can never download a whole table.
//
// Matcher grammar (a match string carries the namespace it targets):
//   `{ns}`              → whole namespace   (`key LIKE 'ns.%'`)
//   `{ns}.*`            → whole namespace   (`key LIKE 'ns.%'`)
//   `{ns}.seg[.seg…]`   → exact key         (`key = 'ns.seg…'`)
//   `{ns}.seg[.seg…].*` → subtree prefix    (`key LIKE 'ns.seg.…%'`)
// `ns` must resolve via resolveEntity (registered service or app/system/
// custom core) — unknown → NotFoundError, same contract as list/dict.
// Interior `*`/`%`, unbounded matchers, empty/oversized input → 400.
//
// Mechanics (DAL-only — no raw SQL): matches group by namespace → ONE
// `dal.findAll` projection per involved schema, `Filter.group(…, "OR")` for
// the matcher's terms, executed with bounded concurrency (4 at a time —
// module count is unbounded and the PG pool must never be saturated by one
// RPC), then concatenated into the canonical EntityListResult envelope.
/** Row shape returned by findTranslations — a projection, not the entity. */
export interface TranslationMatchRow {
  uuid: string;
  /** Owning module/namespace discriminator (`app`, `job`, `system`, …). */
  module: string;
  key: string;
  language: string;
  value: string;
}

/** Hard cap on match strings per call — bounds every per-schema OR clause. */
export const FIND_TRANSLATIONS_MAX_MATCHES = 64;
/** Max concurrent per-schema findAll — module count is unbounded by design,
 *  the pool (`max:10`) must never be saturated by a single RPC. */
const FIND_TRANSLATIONS_FANOUT = 4;

type FindTerm = { exact: boolean; value: string };
const MATCHER_GRAMMAR = /^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)*(?:\.\*)?$/;

/**
 * Parse match strings into per-namespace filter terms — the fixed, wired
 * filter the caller never sees (matches are INPUT, not a FilterExpr).
 * Exported for the namespace-boundary spec; throws ValidationError on
 * empty/oversized input or grammar violations.
 */
export function parseTranslationMatchers(matches: string[]): Map<string, FindTerm[]> {
  if (!Array.isArray(matches) || matches.length === 0) {
    throw new ValidationError("findTranslations requires at least one match string", {
      internal_code: "TRANSLATIONS_FIND_MATCHES_REQUIRED",
    });
  }
  if (matches.length > FIND_TRANSLATIONS_MAX_MATCHES) {
    throw new ValidationError(
      `findTranslations accepts at most ${FIND_TRANSLATIONS_MAX_MATCHES} match strings (got ${matches.length})`,
      { internal_code: "TRANSLATIONS_FIND_MATCHES_LIMIT" },
    );
  }
  const byModule = new Map<string, FindTerm[]>();
  for (const raw of new Set(matches)) {
    if (typeof raw !== "string" || !MATCHER_GRAMMAR.test(raw)) {
      throw new ValidationError(
        `Invalid match '${raw}' — grammar is '{ns}', '{ns}.*', '{ns}.seg[.seg…]' or '{ns}.seg[.seg…].*' (e.g. 'job.*', 'job.settings.config.*', 'app.common.ok')`,
        { internal_code: "TRANSLATIONS_FIND_MATCHER_GRAMMAR" },
      );
    }
    const ns = raw.split(".")[0]!;
    const term: FindTerm = raw.endsWith(".*")
      ? { exact: false, value: raw.slice(0, -1) }     // 'job.a.*' → LIKE 'job.a.%'
      : raw.includes(".")
        ? { exact: true, value: raw }                 // 'job.a.b' → key = 'job.a.b'
        : { exact: false, value: `${raw}.` };         // bare 'job' → LIKE 'job.%'
    (byModule.get(ns) ?? byModule.set(ns, []).get(ns)!).push(term);
  }
  return byModule;
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

  /**
   * Entities synthesized from `service_registry` rows — each registered
   * microservice owns `<code>.translations`; the BE is its CRUD gateway.
   * Populated lazily on first resolve miss (null = not yet loaded).
   */
  private serviceEntities: Map<string, TranslationEntityCtor> | null = null;

  /**
   * Discover translation entities for registered services. Refreshes lazily:
   * a service that registers after the first discovery is picked up on the
   * next unknown-module resolve (see {@link resolveEntity}).
   */
  private async discoverServiceEntities(): Promise<Map<string, TranslationEntityCtor>> {
    const map = new Map<string, TranslationEntityCtor>();
    for (const s of await new ServiceRegistryService().findAll()) {
      const code = s.code.toLowerCase();
      // Reserved platform rows (`api` gateway self-enrollment, `settings`
      // shell) and schema-less services own no `translations` table —
      // their identity labels ride the `system` dict (`system.api.title`).
      // Synthesizing an entity for them turned a benign dict fetch into a
      // 503 on a nonexistent schema table.
      if (s.is_reserved || (s.schemas?.length ?? 0) === 0) continue;
      if (MODULE_ENTITIES[code] || map.has(code)) continue;
      const cls = class extends TranslationEntityBase {} as unknown as TranslationEntityCtor;
      Entity("translations", code)(cls as unknown as Function);
      map.set(code, cls);
    }
    this.serviceEntities = map;
    return map;
  }

  /**
   * Resolve module code → entity class. Static BE-owned modules first, then
   * service_registry-discovered service schemas; unknown codes → 404.
   */
  async resolveEntity(moduleCode: string): Promise<TranslationEntityCtor> {
    const code = moduleCode.toLowerCase();
    // Sibling modules (`<code>-<id>` — emitted by discovery from
    // `endpoints.nav.siblings`) own no service_registry row: their keys
    // live in the PARENT's translations schema (`crm.settings.*` lives in
    // `crm.translations`). Exact match wins first — a service literally
    // named `foo-bar` keeps its own dict; only unresolved codes strip
    // the last `-segment` and retry against the parent.
    for (let probe = code; ; ) {
      const entity =
        MODULE_ENTITIES[probe] ??
        (this.serviceEntities ?? (await this.discoverServiceEntities())).get(probe);
      if (entity) return entity;
      const cut = probe.lastIndexOf("-");
      if (cut <= 0) break;
      probe = probe.slice(0, cut);
    }
    throw new NotFoundError(`Unknown translation module: '${moduleCode}'`);
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
    const entity = await this.resolveEntity(moduleCode);
    const schema = schemaOf(entity);
    const cache = this.getCache(schema);

    const cached = await cache.getI18nDict(language);
    if (cached) {
      // db-meta seed patches and direct SQL writes bypass this service's
      // write path, so invalidation-on-write can never see them — the stale
      // dict would survive up to the 6h TTL. Freshness is therefore proven
      // read-side: a cached dict older than the table's max(updated_at) is
      // rebuilt. One indexed aggregate query per dict fetch (rare — the FE
      // caches by ETag anyway).
      const [latest] = (await getDal().findAll(
        entity,
        [Project.expr("max(updated_at)", "latest_write")],
        {},
      )) as { latest_write: string | null }[];
      const latestWrite = latest?.latest_write ? new Date(latest.latest_write).getTime() : 0;
      if (latestWrite <= cached.cached_at) return cached;
    }

    let rows: { dict: I18nDict | null }[];
    try {
      rows = (await getDal().findAll(
        entity,
        [Project.expr("jsonb_object_agg(key, value)", "dict")],
        {
          filters: [Filter.fieldValue(field(entity, "language"), "=", language)],
        },
      )) as { dict: I18nDict | null }[];
    } catch (e) {
      // A registered service whose schema lacks the `translations` table is
      // a provisioning failure — fail LOUDLY. An empty dict would silently
      // render raw keys and mask the misconfiguration.
      if ((e as { code?: string }).code === "42P01") {
        throw new ApiError(
          "/errors/translation-storage-missing",
          "Translation storage not provisioned",
          503,
          `Module '${moduleCode}' is registered but has no 'translations' table in schema '${schema}' — run its db-meta migrations`,
          { internal_code: "TRANSLATIONS_SCHEMA_MISSING", severity: "CRITICAL" },
        );
      }
      throw e;
    }
    const dict = (rows[0]?.dict ?? {}) as I18nDict;
    const entry = wrapCacheEntry(dict);
    await cache.setI18nDict(language, dict);
    return entry;
  }

  /**
   * Per-module list service — `dal.entityService` over the resolved entity
   * (cached alongside `serviceEntities`: one instance per translation schema).
   * This is the SAME canonical list path every entity uses: filters[],
   * search/search_in, connector, sort validation, paging, deleted_records.
   * `language` arrives as a dedicated param and joins via `extraFilters`.
   */
  private listServices = new Map<string, EntityService<Record<string, unknown>>>();

  private listServiceFor(entity: TranslationEntityCtor): EntityService<Record<string, unknown>> {
    const schema = schemaOf(entity);
    let svc = this.listServices.get(schema);
    if (!svc) {
      svc = getDal().entityService<Record<string, unknown>>({
        entity,
        list: {
          searchableKeys: TRANSLATION_SEARCHABLE_KEYS,
          filterableKeys: TRANSLATION_FILTERABLE_KEYS,
          defaultSort: { key: "key", dir: "asc" },
          extraFilters: (q) =>
            (q as TranslationListQuery).language
              ? [Filter.fieldValue(field(entity, "language"), "=", (q as TranslationListQuery).language)]
              : [],
        },
      });
      this.listServices.set(schema, svc);
    }
    return svc;
  }

  /** Paginated list of translation rows for a module — standard
   *  `EntityListResult { rows, page, page_size, total }` envelope. */
  async list(moduleCode: string, query: TranslationListQuery) {
    const entity = await this.resolveEntity(moduleCode);
    return this.listServiceFor(entity).list({ ...query, sort_key: query.sort_key ?? undefined });
  }

  /**
   * findTranslations — the ONE documented cross-domain translation read
   * (see the contract comment above {@link TranslationMatchRow}).
   *
   * Match strings (NOT a FilterExpr — the filter is wired here, always the
   * same shape): `key` exact-match or `LIKE` prefix per matcher, OR'd inside
   * the owning schema's group; `language` narrows when present. One
   * `dal.findAll` projection per involved schema, chunked `Promise.all`
   * (4 at a time) — never a full table, never raw SQL.
   *
   * Returns the canonical `EntityListResult` envelope, unpaged: the match
   * surface IS the page bound (≤64 matchers, `{ns}`-minimum granularity).
   */
  async findTranslations(
    matches: string[],
    language?: string,
  ): Promise<EntityListResult<TranslationMatchRow>> {
    const byModule = parseTranslationMatchers(matches);
    const groups: { module: string; entity: TranslationEntityCtor; terms: FindTerm[] }[] = [];
    for (const [module, terms] of byModule) {
      // resolveEntity is the ns gate: unknown module codes → NotFoundError,
      // identical contract to list/dict. Sequential resolves are cheap —
      // discovery is cached after the first call.
      groups.push({ module, entity: await this.resolveEntity(module), terms });
    }
    const rows: TranslationMatchRow[] = [];
    for (let i = 0; i < groups.length; i += FIND_TRANSLATIONS_FANOUT) {
      const batch = await Promise.all(
        groups.slice(i, i + FIND_TRANSLATIONS_FANOUT).map(async (g) => {
          const entity = g.entity;
          const filters: FilterExpr[] = [
            Filter.group(
              g.terms.map((t) =>
                Filter.fieldValue(field(entity, "key"), t.exact ? "=" : "LIKE", t.exact ? t.value : `${t.value}%`),
              ),
              "OR",
            ),
          ];
          if (language) filters.push(Filter.fieldValue(field(entity, "language"), "=", language));
          return (await getDal().findAll(
            entity,
            [
              Project.field(field(entity, "uuid")),
              Project.field(field(entity, "key")),
              Project.field(field(entity, "language")),
              Project.field(field(entity, "value")),
              Project.expr("?", "module", [g.module]),
            ],
            {
              filters,
              sorting: [Sort.by(field(entity, "key"), "ASC")],
            },
          )) as TranslationMatchRow[];
        }),
      );
      for (const r of batch) rows.push(...r);
    }
    return { rows, page: 1, page_size: rows.length, total: BigInt(rows.length) };
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
    const entity = await this.resolveEntity(moduleCode);
    assertKeyNamespace(entity, data.key);
    const actor = requireActor();
    const repo = options?.tx ?? getDal();
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
    const entity = await this.resolveEntity(moduleCode);
    await this.getCache(schemaOf(entity)).invalidate(language);
  }

  /** Update a translation row by uuid. */
  async update(moduleCode: string, uuid: string, data: TranslationUpdateBody) {
    const entity = await this.resolveEntity(moduleCode);
    assertKeyNamespace(entity, data.key);
    const actor = requireActor();
    const row = await getDal().update(
      entity,
      { ...data, uuid },
      { actor },
    );
    await this.getCache(schemaOf(entity)).invalidate();
    return row;
  }

  /** Soft-delete a translation row by uuid. */
  async softDelete(moduleCode: string, uuid: string) {
    const entity = await this.resolveEntity(moduleCode);
    const actor = requireActor();
    const row = (await getDal().findByUUID<any, any>(entity, uuid, { deletedRecords: "INCLUDED" }))!;
    await getDal().delete(entity, { uuid, version: row.version }, { actor });
    await this.getCache(schemaOf(entity)).invalidate();
  }

  /** Restore a soft-deleted translation row by uuid. */
  async restore(moduleCode: string, uuid: string) {
    const entity = await this.resolveEntity(moduleCode);
    const actor = requireActor();
    const row = (await getDal().findByUUID<any, any>(entity, uuid, { deletedRecords: "INCLUDED" }))!;
    await getDal().restore(entity, { uuid, version: row.version }, { actor });
    await this.getCache(schemaOf(entity)).invalidate();
  }
}
