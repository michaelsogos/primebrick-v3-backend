/**
 * makeEntityService — the ONE generic CRUD service for entity routes.
 *
 * Counterpart of `makeEntityRouter`: the router owns HTTP/RBAC/validation and
 * delegates every action to the service contract below. Where the old
 * per-entity `XxxService`/`XxxDal` pairs hand-copied the same recipe
 * (toDto date→ISO, getByUuid + auditable joins, list search/sort/filters,
 * create = randomUUID + add), this factory derives all of it from the entity
 * class metadata + a small config.
 *
 * Guarantees that are structural (not conventions):
 * - every write returns the row produced by `RETURNING` — there is no code
 *   path that can return `{uuid}` or `{success: true}`;
 * - `version` is always the caller-observed value (optimistic lock);
 * - audit trail, actor stamping (ALS), tx propagation and cache-port wiring
 *   are identical for every entity;
 * - per-entity variation lives ONLY in `EntityServiceConfig` (searchable /
 *   filterable keys, default sort, aggregates, afterWrite hooks) — never in
 *   a copied dal.
 *
 * Entities with non-standard identity or external orchestration (e.g.
 * role_mapping's Casdoor sync) keep a custom service and use router-level
 * `handlers`/`extraRoutes` overrides — the contract type below still forces
 * their handlers to return the entity.
 */

import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";

import {
  Repository,
  field,
  Filter,
  Sort,
  buildAuditableJoinsSelective,
  DeletableFieldType,
  entityDateToApiIso,
  Project,
  translateFilterConditions,
  getEntityPersistenceMeta,
  type EntityClass,
  type FieldProjector,
  type FilterExpr,
  type JoinExpr,
  type ListFilterCondition,
} from "@primebrick/dal-pg";
import { requireActor } from "@primebrick/sdk";

import { UserProfileEntity } from "../modules/auth/user_profile_entity.js";
import { createRepository } from "../db/repository-factory.js";
import { BeAuditPortAdapter } from "../db/audit-port-adapter.js";
import { findAuditPage } from "../db/audit-query-helper.js";
import { getPool } from "../db/pool.js";
import { NotFoundError } from "./api-errors.js";
import type { EntityAction } from "./entity-router.js";

// ─── Public contract ─────────────────────────────────────────────────────────

export interface EntityListQuery {
  search?: string;
  search_in?: string[];
  sort_key?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  page_size?: number;
  filters?: ListFilterCondition[];
  connector?: "AND" | "OR";
  deleted_records?: "EXCLUDED" | "ONLY" | "INCLUDED";
  [key: string]: unknown; // entity-specific extras (e.g. customer `status`)
}

export interface EntityListResult<TEntity> {
  rows: TEntity[];
  page: number;
  page_size: number;
  total: bigint;
}

export interface BulkItem {
  uuid: string;
  version: number;
}

export interface DuplicateResult {
  uuids: string[];
  errors: Array<{ uuid: string; error: string }>;
}

/** Declarative aggregate rollup projected into list rows (E.3a). */
export interface AggregateDecl {
  /** Output column name, e.g. "user_count". */
  name: string;
  /** Aggregate SQL expression over the join alias, e.g. "COUNT(u.id)". */
  expr: string;
  /** Optional result cast — emitted as `CAST(<expr> [FILTER...] AS <cast>)`, e.g. "int" to map COUNT(*) bigint → number. */
  cast?: string;
  /** LEFT join feeding the aggregate: `LEFT JOIN <entity> AS <alias> ON t.<base> = <alias>.<joined>`. */
  join: {
    entity: EntityClass;
    alias: string;
    /** Property on the BASE entity (t.*). */
    base: string;
    /** Property on the JOINED entity (alias.*). */
    joined: string;
    /** Extra raw predicates applied via `FILTER (WHERE ...)` on the aggregate, e.g. "u.deleted_at IS NULL". */
    extra?: string;
  };
}

export interface EntityServiceConfig<TEntity> {
  /** Newable entity class (DB row shape). `TEntity` is the API DTO — rows are
   *  mapped through `toDto`, so the class is NOT `new () => TEntity`. */
  entity: EntityClass & { new (): object };
  /** Audit trail table override — default `${tableName}_audit` when the entity has @AuditTrail. */
  auditTableName?: string;
  list: {
    /** Fields eligible for the `?search=` ILIKE scan (`search_in` allowlist). */
    searchableKeys: readonly string[];
    /** Allowlist for `filters[...]` conditions (translateFilterConditions). */
    filterableKeys: ReadonlySet<string>;
    defaultSort?: { key: string; dir: "asc" | "desc" };
    /** Entity-specific fixed filters driven by extra query params (e.g. `status`). */
    extraFilters?: (q: EntityListQuery) => FilterExpr[];
    /** Aggregate rollups — drive the DAL `groupBy` feature (see E.3a). */
    aggregates?: AggregateDecl[];
  };
  hooks?: {
    /** Post-write side effects (cache invalidation…). Runs after commit-visible write, receives the returned entity. */
    afterWrite?: (op: EntityAction, entity: TEntity) => void | Promise<void>;
    /** Validate/transform the create body before INSERT (e.g. uniqueness guards). May return a modified body. */
    beforeCreate?: (body: Record<string, unknown>) => Record<string, unknown> | Promise<Record<string, unknown>>;
    /** Validate/transform the update body before UPDATE (receives the target uuid + body). May return a modified body. */
    beforeUpdate?: (uuid: string, body: Record<string, unknown>) => Record<string, unknown> | Promise<Record<string, unknown>>;
  };
  /**
   * Entity code for list debug toggles: `PB_<CODE>_FORCE_EMPTY=1` /
   * `PB_<CODE>_FORCE_ERROR=1` short-circuit the list (dev-only).
   */
  debugCode?: string;
}

/** The contract every entity service must satisfy — enforced on the router. */
export interface EntityService<TEntity> {
  list(query: EntityListQuery): Promise<EntityListResult<TEntity>>;
  get(uuid: string): Promise<TEntity>;
  create(body: Record<string, unknown>, tx?: PoolClient): Promise<TEntity>;
  update(uuid: string, body: Record<string, unknown> & { version: number }, tx?: PoolClient): Promise<TEntity>;
  delete(uuid: string, version: number): Promise<TEntity>;
  restore(uuid: string, version: number): Promise<TEntity>;
  purge(uuid: string, version: number): Promise<TEntity>;
  duplicate(uuids: string[]): Promise<DuplicateResult>;
  bulkDelete(items: BulkItem[]): Promise<unknown>;
  bulkRestore(items: BulkItem[]): Promise<unknown>;
  audit(uuid: string, page: number, limit: number): Promise<unknown>;
  stream(query: EntityListQuery): AsyncGenerator<TEntity>;
}

// ─── Generic implementation ─────────────────────────────────────────────────

/**
 * Build the ILIKE needle from a raw search string: `*`/`?` act as wildcards,
 * `%`/`_`/`#` are escaped (matches the pre-existing per-entity behaviour).
 */
function buildIlikeNeedle(raw: string): { needle: string; trueChars: number; hasEscapedWildcard: boolean } {
  let out = "";
  let trueChars = 0;
  let hasEscapedWildcard = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    if (ch === "\\") {
      const next = raw[i + 1];
      if (next === "*" || next === "?") {
        out += next === "*" ? "%" : "_";
        hasEscapedWildcard = true;
        i++;
        continue;
      }
      out += "\\";
      trueChars++;
      continue;
    }
    if (ch === "%") out += "#%";
    else if (ch === "_") out += "#_";
    else if (ch === "#") out += "##";
    else out += ch;
    trueChars++;
  }
  return { needle: `%${out}%`, trueChars, hasEscapedWildcard };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Row → API DTO: every `Date` value becomes ISO — derived, not hand-listed. */
function toDto<T>(row: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
    out[k] = v instanceof Date ? entityDateToApiIso(v) : v;
  }
  return out as T;
}

/**
 * `projectAllExceptId` — derived from entity meta (all columns except the PK),
 * replacing the hand-maintained key lists the per-entity dals used to copy.
 */
function projectAllExceptPk(entity: EntityClass): FieldProjector[] {
  const meta = getEntityPersistenceMeta(entity);
  return Object.values(meta.columns)
    .filter((c) => !c.isKey)
    .map((c) => Project.field(field(entity, c.propertyKey as never)));
}

export function makeEntityService<TEntity extends Record<string, unknown>>(
  cfg: EntityServiceConfig<TEntity>,
): EntityService<TEntity> {
  const meta = getEntityPersistenceMeta(cfg.entity);
  const pool = getPool();
  const repo = createRepository(pool);
  const auditPort = new BeAuditPortAdapter(repo);
  const auditTable = cfg.auditTableName ?? `${meta.tableName}_audit`;

  const uuidCol = Object.entries(meta.columns).find(
    ([, c]) => c.propertyKey === "uuid" || c.isUnique,
  )?.[1];

  // Deleter join only when the entity actually has a `deleted_by` column —
  // hard-delete-only entities (role_mapping) lack it and the join would fail.
  const hasDeletedBy = Object.values(meta.columns).some(
    (c) => c.isDeletable && c.deletableType === DeletableFieldType.DELETED_BY,
  );
  const joinsFor = (): JoinExpr[] =>
    buildAuditableJoinsSelective(cfg.entity, UserProfileEntity, {
      includeDeleter: hasDeletedBy,
    }) as JoinExpr[];
  const repoFor = (tx?: PoolClient) => (tx ? new Repository(tx) : repo);

  /** Shared filter builder for `list` AND `stream` — one implementation only. */
  function buildListFilters(q: EntityListQuery): FilterExpr[] {
    const filters: FilterExpr[] = [];

    if (cfg.list.extraFilters) {
      filters.push(...cfg.list.extraFilters(q));
    }

    if (q.search && q.search.trim()) {
      const raw = q.search.trim();
      const { needle, trueChars, hasEscapedWildcard } = buildIlikeNeedle(raw);
      const canSearch = trueChars >= 3 || (hasEscapedWildcard && trueChars >= 1);
      if (!canSearch) {
        filters.push(Filter.group([Filter.raw("1", "=", "0")], "AND"));
      } else {
        const looksLikeUuid = UUID_RE.test(raw);
        const fields = (q.search_in?.length ? q.search_in : [...cfg.list.searchableKeys]) as string[];
        const allowed = new Set([...cfg.list.searchableKeys, "uuid"]);
        const ors = fields
          .filter((f) => allowed.has(f))
          .flatMap((f) => {
            if (f === "uuid") {
              return looksLikeUuid
                ? [Filter.fieldValue(field(cfg.entity, "uuid" as never), "=", raw, "OR")]
                : [Filter.fieldValue(field(cfg.entity, "uuid" as never), "ILIKE", needle, "OR")];
            }
            return [Filter.fieldValue(field(cfg.entity, f as never), "ILIKE", needle, "OR")];
          });
        if (ors.length) filters.push(Filter.group(ors, "OR"));
      }
    }

    if (q.filters && q.filters.length > 0) {
      const translated = translateFilterConditions(cfg.entity, q.filters, {
        allowedFields: cfg.list.filterableKeys,
        connector: q.connector ?? "AND",
      });
      if (translated) filters.push(...translated);
    }

    return filters;
  }

  /** Projection + joins + groupBy resolution for list/stream (aggregates E.3a). */
  function buildListShape(): {
    fields: FieldProjector[] | null;
    joins: JoinExpr[];
    groupBy?: ReturnType<typeof field>[];
  } {
    const aggregates = cfg.list.aggregates ?? [];
    const joins = joinsFor();
    if (aggregates.length === 0) {
      return { fields: projectAllExceptPk(cfg.entity) as unknown as FieldProjector[], joins };
    }
    const fields: FieldProjector[] = [...(projectAllExceptPk(cfg.entity) as unknown as FieldProjector[])];
    const pkProp = Object.values(meta.columns).find((c) => c.isKey)?.propertyKey;
    for (const agg of aggregates) {
      // JoinExpr semantics in the builder: `left` is the JOINED table (gets
      // the alias), `right` is the BASE entity → ON t.base = alias.joined.
      joins.push({
        left: field(agg.join.entity, agg.join.joined as never),
        right: field(cfg.entity, agg.join.base as never),
        type: "LEFT",
        alias: agg.join.alias,
      });
      // FILTER (WHERE ...) keeps extra ON-predicates expressible without
      // extending the JoinExpr model (e.g. `u.deleted_at IS NULL`).
      // FILTER (WHERE ...) must attach directly to the aggregate call —
      // a cast BEFORE it is a syntax error, so `cast` wraps the whole thing.
      const filtered = `${agg.expr}${agg.join.extra ? ` FILTER (WHERE ${agg.join.extra})` : ""}`;
      const expr = agg.cast ? `CAST(${filtered} AS ${agg.cast})` : filtered;
      fields.push({ kind: "expr", expr, alias: agg.name });
    }
    return { fields, joins, groupBy: pkProp ? [field(cfg.entity, pkProp as never)] : [] };
  }

  async function fireAfterWrite(op: EntityAction, entity: TEntity): Promise<void> {
    await cfg.hooks?.afterWrite?.(op, entity);
  }

  return {
    async list(q) {
      if (cfg.debugCode) {
        if (process.env[`PB_${cfg.debugCode}_FORCE_EMPTY`] === "1") {
          const p = Math.max(1, Number(q.page) || 1);
          const ps = Math.min(100, Math.max(1, Number(q.page_size) || 25));
          return { rows: [], page: p, page_size: ps, total: 0n };
        }
        if (process.env[`PB_${cfg.debugCode}_FORCE_ERROR`] === "1") {
          throw new NotFoundError(`[${cfg.debugCode}] forced list error`, { internal_code: "FORCED_ERROR" });
        }
      }

      const page = q.page ?? 1;
      const page_size = q.page_size ?? 25;
      const sort_key = (q.sort_key ?? cfg.list.defaultSort?.key ?? "updated_at") as string;
      const sort_dir = (q.sort_dir ?? cfg.list.defaultSort?.dir ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";

      const shape = buildListShape();
      const result = await repo.findByPage<TEntity, TEntity>(
        cfg.entity,
        page,
        page_size,
        shape.fields as never,
        {
          filters: buildListFilters(q),
          sorting: [Sort.by(field(cfg.entity, sort_key as never), sort_dir)],
          deletedRecords: q.deleted_records ?? "EXCLUDED",
          joins: shape.joins,
          groupBy: shape.groupBy,
        },
      );

      return {
        rows: result.entities.map((r) => toDto(r)),
        page,
        page_size,
        total: result.total_records,
      };
    },

    async get(uuid) {
      const row = await repo.find<TEntity, TEntity>(
        cfg.entity,
        projectAllExceptPk(cfg.entity) as never,
        {
          filters: [Filter.fieldValue(field(cfg.entity, "uuid" as never), "=", uuid)],
          joins: joinsFor(),
          throwIfNotFound: false,
        },
      );
      if (!row) throw new NotFoundError(`The requested ${meta.entityClassName} could not be found`);
      return toDto(row);
    },

    async create(body, tx) {
      const prepared = (await cfg.hooks?.beforeCreate?.(body)) ?? body;
      const row = await (repoFor(tx) as any).add(cfg.entity, {
        ...(prepared as Record<string, unknown>),
        uuid: (prepared as { uuid?: string }).uuid ?? randomUUID(),
      }, { actor: requireActor(), audit: auditPort, returning: projectAllExceptPk(cfg.entity) as never });
      const dto = toDto(row) as unknown as TEntity;
      if (!tx) await fireAfterWrite("create", dto);
      return dto;
    },

    async update(uuid, body, tx) {
      const prepared = (await cfg.hooks?.beforeUpdate?.(uuid, body)) ?? body;
      const row = await (repoFor(tx) as any).update(
        cfg.entity,
        { ...(prepared as Record<string, unknown>), uuid },
        { actor: requireActor(), audit: auditPort, returning: projectAllExceptPk(cfg.entity) as never },
      );
      const dto = toDto(row) as unknown as TEntity;
      if (!tx) await fireAfterWrite("update", dto);
      return dto;
    },

    async delete(uuid, version) {
      const row = await (repo as any).delete(cfg.entity, { uuid, version } as never, {
        actor: requireActor(), audit: auditPort, matchBy: "uuid" as never,
        returning: projectAllExceptPk(cfg.entity) as never,
      });
      const dto = toDto(row) as unknown as TEntity;
      await fireAfterWrite("delete", dto);
      return dto;
    },

    async restore(uuid, version) {
      const row = await (repo as any).restore(cfg.entity, { uuid, version } as never, {
        actor: requireActor(), audit: auditPort, matchBy: "uuid" as never,
        returning: projectAllExceptPk(cfg.entity) as never,
      });
      const dto = toDto(row) as unknown as TEntity;
      await fireAfterWrite("restore", dto);
      return dto;
    },

    async purge(uuid, version) {
      const row = await (repo as any).hardDelete(cfg.entity, { uuid, version } as never, {
        actor: requireActor(), audit: auditPort, matchBy: "uuid" as never,
        returning: projectAllExceptPk(cfg.entity) as never,
      });
      const dto = toDto(row) as unknown as TEntity;
      await fireAfterWrite("purge", dto);
      return dto;
    },

    async duplicate(uuids) {
      if (!uuidCol) throw new NotFoundError(`${meta.entityClassName} has no uuid column — duplicate unsupported`);
      const results: string[] = [];
      const errors: Array<{ uuid: string; error: string }> = [];
      for (const uuid of uuids) {
        try {
          const cloned = await (repo as any).clone(cfg.entity, uuid, { actor: requireActor(), audit: auditPort }) as TEntity;
          results.push((cloned as unknown as { uuid: string }).uuid);
        } catch (e) {
          errors.push({ uuid, error: e instanceof Error ? e.message : String(e) });
        }
      }
      if (results.length) await fireAfterWrite("duplicate", { uuids: results } as unknown as TEntity);
      return { uuids: results, errors };
    },

    async bulkDelete(items) {
      return (repo as any).deleteMany(cfg.entity, items as never, {
        actor: requireActor(), audit: auditPort, matchBy: "uuid" as never,
      });
    },

    async bulkRestore(items) {
      return (repo as any).restoreMany(cfg.entity, items as never, {
        actor: requireActor(), audit: auditPort, matchBy: "uuid" as never,
      });
    },

    async audit(uuid, page, limit) {
      const r = await findAuditPage(repo, { tableName: auditTable, entityUuid: uuid, page, limit });
      // Canonical wire shape: the FE version-history panel reads
      // `changed_by_name` (the legacy per-entity audit contract); the raw
      // helper emits `changed_by_display_name` — expose both.
      return {
        ...r,
        data: r.data.map((row) => ({
          ...row,
          changed_by_name: row.changed_by_display_name ?? null,
        })),
      };
    },

    async *stream(q) {
      const sort_key = (q.sort_key ?? cfg.list.defaultSort?.key ?? "updated_at") as string;
      const sort_dir = (q.sort_dir ?? cfg.list.defaultSort?.dir ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
      const shape = buildListShape();
      const iterable = await repo.findAll<TEntity, TEntity>(
        cfg.entity,
        shape.fields as never,
        {
          filters: buildListFilters(q),
          sorting: [Sort.by(field(cfg.entity, sort_key as never), sort_dir)],
          deletedRecords: q.deleted_records ?? "EXCLUDED",
          joins: shape.joins,
          groupBy: shape.groupBy,
          stream: true,
        },
      );
      for await (const row of iterable as AsyncIterable<TEntity>) {
        yield toDto(row);
      }
    },
  };
}
