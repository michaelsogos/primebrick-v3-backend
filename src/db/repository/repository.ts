import type { Pool, PoolClient } from "pg";

import type { EntityClass } from "../../domain/entities/entity-meta.js";
import { getColumnName, getEntityPersistenceMeta, getTableName } from "../../domain/entities/entity-meta.js";

import type { FieldProjector, FilterExpr, JoinExpr, SortingExpr } from "./dsl.js";
import { field, Filter } from "./dsl.js";
import { buildSelectQuery } from "./query-builder.js";
import type { FindByIdOptions, FindOptions, PaginatedEntity } from "./types.js";

type Queryable = Pick<Pool, "query"> | Pick<PoolClient, "query">;

export class Repository {
  constructor(private readonly db: Queryable) {}

  async rawSql<TResult = unknown>(text: string, values?: unknown[]): Promise<TResult[]> {
    const r = await this.db.query(text, values ?? []);
    return (r.rows ?? []) as TResult[];
  }

  async count(entity: EntityClass): Promise<number> {
    const table = getTableName(entity);
    const r = await this.db.query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "${table}"`, []);
    return Number(r.rows?.[0]?.n ?? 0);
  }

  /**
   * Bulk insert (single INSERT … VALUES …). Columns are inferred from the first row (undefined omitted).
   * Skips identity PK column automatically when not provided.
   */
  async insertMany<TEntity extends object>(
    entity: EntityClass,
    rows: Array<Partial<Record<keyof TEntity & string, unknown>>>
  ): Promise<void> {
    if (rows.length === 0) return;
    const meta = getEntityPersistenceMeta(entity);
    const table = getTableName(entity);
    const pk = Object.values(meta.columns).find((c) => c.isKey);

    const first = rows[0] as Record<string, unknown>;
    let keys = Object.keys(first).filter((k) => first[k] !== undefined);

    // Drop identity key unless explicitly provided
    if (pk && meta.columns[pk.sqlName]?.usePostgresIdentity) {
      keys = keys.filter((k) => k !== pk.propertyKey);
    }

    if (keys.length === 0) {
      throw new Error("insertMany: no columns to insert (all undefined?)");
    }

    // Validate keys exist in meta
    for (const k of keys) {
      const sqlName = getColumnName(entity, k);
      if (!meta.columns[sqlName]) {
        throw new Error(`insertMany: unknown column/property ${k}`);
      }
    }

    const colsSql = keys.map((k) => `"${getColumnName(entity, k)}"`).join(", ");
    const values: unknown[] = [];
    const tuples: string[] = [];
    for (const row of rows) {
      const rec = row as Record<string, unknown>;
      const params: string[] = [];
      for (const k of keys) {
        values.push(rec[k] ?? null);
        params.push(`$${values.length}`);
      }
      tuples.push(`(${params.join(", ")})`);
    }
    const sql = `INSERT INTO "${table}" (${colsSql}) VALUES ${tuples.join(", ")}`;
    await this.db.query(sql, values);
  }

  async findById<TEntity extends object, TResult = TEntity>(
    entity: EntityClass,
    id: number | string,
    options?: FindByIdOptions
  ): Promise<TResult | null> {
    const throwExceptionIfNullOrMany = options?.throwExceptionIfNullOrMany ?? true;
    const meta = getEntityPersistenceMeta(entity);
    const pk = Object.values(meta.columns).find((c) => c.isKey);
    if (!pk) throw new Error(`Entity ${meta.entityClassName} has no @Key() column`);

    const q = buildSelectQuery({
      entity,
      filters: [Filter.fieldValue(field(entity, pk.propertyKey), "=", id)],
      deletedRecords: options?.deletedRecords,
    });

    const r = await this.db.query(q.text, q.values);
    const rows = (r.rows ?? []) as TResult[];

    if (!throwExceptionIfNullOrMany) return rows[0] ?? null;
    if (rows.length !== 1) {
      throw new Error(`Expected exactly 1 row, got ${rows.length}`);
    }
    return rows[0] ?? null;
  }

  async find<TEntity extends object, TResult = TEntity>(
    entity: EntityClass,
    fields?: FieldProjector[] | null,
    options?: FindOptions
  ): Promise<TResult | null> {
    const q = buildSelectQuery({
      entity,
      fields: fields ?? undefined,
      joins: options?.joins,
      filters: options?.filters,
      sorting: options?.sorting,
      deletedRecords: options?.deletedRecords,
      limit: 1,
    });
    const r = await this.db.query(q.text, q.values);
    return (r.rows?.[0] as TResult | undefined) ?? null;
  }

  async findAll<TEntity extends object, TResult = TEntity>(
    entity: EntityClass,
    fields?: FieldProjector[] | null,
    options?: FindOptions
  ): Promise<TResult[]> {
    const q = buildSelectQuery({
      entity,
      fields: fields ?? undefined,
      joins: options?.joins,
      filters: options?.filters,
      sorting: options?.sorting,
      deletedRecords: options?.deletedRecords,
    });
    const r = await this.db.query(q.text, q.values);
    return (r.rows ?? []) as TResult[];
  }

  async findByPage<TEntity extends object, TResult = TEntity>(
    entity: EntityClass,
    page: number,
    recordsPerPage: number,
    fields?: FieldProjector[] | null,
    options?: FindOptions
  ): Promise<PaginatedEntity<TResult>> {
    if (page <= 0) throw new Error("Cannot query with page number lower than 1!");
    if (recordsPerPage <= 0) throw new Error("Cannot query with records per page number lower than 1!");

    const limit = recordsPerPage;
    const offset = recordsPerPage * (page - 1);

    const q = buildSelectQuery({
      entity,
      fields: fields ?? undefined,
      joins: options?.joins,
      filters: options?.filters,
      sorting: options?.sorting,
      deletedRecords: options?.deletedRecords,
      limit,
      offset,
      includeTotalRecordsWindow: true,
    });
    const r = await this.db.query(q.text, q.values);

    const rows = (r.rows ?? []) as Array<TResult & { _total_records?: number | string | null }>;
    const totalRaw = rows[0]?._total_records ?? 0;
    const total_records = typeof totalRaw === "string" ? Number(totalRaw) : Number(totalRaw ?? 0);

    const entities = rows.map((x) => {
      const { _total_records, ...rest } = x as any;
      return rest as TResult;
    });

    return { entities, total_records };
  }
}

