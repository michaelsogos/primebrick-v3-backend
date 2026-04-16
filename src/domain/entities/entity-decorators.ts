import "reflect-metadata";

import {
  inferColumnNullableFromDesignType,
  inferPgTypeFromEntityColumn,
} from "../../db/entity-ts-to-pg.js";

/**
 * Entity metadata via legacy TypeScript decorators (WeakMap "reflection").
 *
 * **Convention:** ogni proprietà “dato” sul `prototype` della classe è una colonna SQL con nome
 * uguale al nome della proprietà (snake_case se la chiami così in TS). **Non serve `@Column()`**
 * salvo per: `sqlName` / `pgType` / `nullable`, o stringa breve per il nome colonna.
 *
 * **`!` in TypeScript:** con `strictPropertyInitialization`, indica che il valore è assegnato
 * prima dell’uso (tipicamente nel `constructor` / `Object.assign`), non al punto di dichiarazione.
 *
 * - `@Entity()` — nome tabella; argomento opzionale se diverso dal nome classe.
 * - `@Key()` — PK (una sola colonna).
 * - `@Unique()` — indice univoco (DDL patch).
 * - `@IsNotColumn()` — esclude la proprietà da snapshot database e da future query DAL generate.
 */

export type EntityClass = abstract new (...args: any[]) => object;

type ColumnRegistration = {
  sqlName: string;
  isKey: boolean;
  isUnique: boolean;
  nullable?: boolean;
  pgType?: string;
  /** For varchar/char/bit varying etc. */
  length?: number;
  /** For numeric/decimal */
  precision?: number;
  scale?: number;
  /** SQL DEFAULT expression (raw, e.g. `now()` or `gen_random_uuid()`) */
  defaultSql?: string;
  /** Key generation strategy; default = identity for @Key() */
  keyGenerated?: "identity" | "manual";
  tsDesignTypeCtorName?: string;
};

export type ColumnOptions = {
  sqlName?: string;
  /**
   * PostgreSQL storage type for DDL + DAL (`column-pg-io`).
   * TS `Date` senza `pgType` → **`timestamptz`** in migration; `pgType: 'date'` → SQL `date` + bind `YYYY-MM-DD`.
   */
  pgType?: string;
  /** e.g. varchar(20) */
  length?: number;
  /** e.g. numeric(18,2) */
  precision?: number;
  scale?: number;
  nullable?: boolean;
  /** SQL DEFAULT expression (raw). */
  defaultSql?: string;
};

type ClassEntityMeta = {
  tableName?: string;
  columns: Map<PropertyKey, ColumnRegistration>;
  /** `@IsNotColumn()` — excluded from persistence meta & future DAL builders */
  notColumnKeys: Set<PropertyKey>;
};

const META = new WeakMap<Function, ClassEntityMeta>();

function ensureMeta(ctor: Function): ClassEntityMeta {
  let m = META.get(ctor);
  if (!m) {
    m = { columns: new Map(), notColumnKeys: new Set() };
    META.set(ctor, m);
  }
  return m;
}

function touchColumn(ctor: Function, key: PropertyKey): ColumnRegistration {
  const m = ensureMeta(ctor);
  let c = m.columns.get(key);
  if (!c) {
    c = { sqlName: String(key), isKey: false, isUnique: false };
    m.columns.set(key, c);
  }
  return c;
}

/** Data property names on a default instance (`new ctor()`), i.e. own enumerable props. */
function discoverInstancePropertyKeys(ctor: Function): string[] {
  // This is the closest analogue to C# reflection on properties:
  // the DAL can enumerate entity instance properties on-the-fly.
  // NOTE: TS `!` declarations don't emit runtime props; you need an initializer (even `= undefined as any`).
  const inst = new (ctor as any)();
  return Object.keys(inst);
}

/** Registers every implicit column + `design:type` / nullability when not already set by decorators. */
export function syncImplicitEntityColumns(ctor: Function): void {
  const m = META.get(ctor);
  if (!m?.tableName) return;
  const discovered = discoverInstancePropertyKeys(ctor);
  // Also include any keys already known via decorators (Key/Unique/Column).
  const decorated = [...m.columns.keys()].map((k) => String(k));
  const keys = [...new Set([...discovered, ...decorated])];

  for (const name of keys) {
    const key = name as PropertyKey;
    const metaKey = name as string | symbol;
    if (m.notColumnKeys.has(key)) continue;
    const col = touchColumn(ctor, key);
    const dt = Reflect.getMetadata("design:type", ctor.prototype, metaKey);
    if (col.tsDesignTypeCtorName === undefined && dt && typeof (dt as { name?: string }).name === "string") {
      col.tsDesignTypeCtorName = (dt as Function).name;
    }
    if (col.nullable === undefined) {
      const inf = inferColumnNullableFromDesignType(dt, col.isKey, col.isUnique);
      if (inf !== undefined) col.nullable = inf;
    }
  }
}

/**
 * Maps the class to a DB table. Optional argument overrides the table name;
 * if omitted, the table name equals the class name (same as the entity name).
 */
export function Entity(tableName?: string) {
  return function <T extends Function>(ctor: T): T {
    const m = ensureMeta(ctor);
    m.tableName = tableName ?? ctor.name;
    return ctor;
  };
}

/**
 * Declare entity columns explicitly (single point), useful because TS class fields declared with `!`
 * don't exist at runtime and cannot be discovered automatically.
 */

function assertNonEmptyColumnOptions(o: ColumnOptions): void {
  if (
    o.sqlName === undefined &&
    o.pgType === undefined &&
    o.length === undefined &&
    o.precision === undefined &&
    o.scale === undefined &&
    o.nullable === undefined &&
    o.defaultSql === undefined
  ) {
    throw new TypeError(
      "@Column({ … }) richiede almeno uno tra: sqlName, pgType, length, precision/scale, nullable, defaultSql"
    );
  }
}

/** Override SQL name / `pgType` / `nullable` only; otherwise la proprietà è già colonna per convenzione. */
export function Column(sqlName: string): PropertyDecorator;
export function Column(opts: ColumnOptions): PropertyDecorator;
export function Column(sqlNameOrOpts: string | ColumnOptions): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const ctor = (target as { constructor: Function }).constructor;
    const col = touchColumn(ctor, propertyKey);
    const dt = Reflect.getMetadata("design:type", target, propertyKey);
    if (dt && typeof (dt as { name?: string }).name === "string") {
      col.tsDesignTypeCtorName = (dt as Function).name;
    }
    if (typeof sqlNameOrOpts === "string") {
      col.sqlName = sqlNameOrOpts;
    } else {
      assertNonEmptyColumnOptions(sqlNameOrOpts);
      if (sqlNameOrOpts.sqlName !== undefined) col.sqlName = sqlNameOrOpts.sqlName;
      if (sqlNameOrOpts.pgType !== undefined) col.pgType = sqlNameOrOpts.pgType;
      if (sqlNameOrOpts.length !== undefined) col.length = sqlNameOrOpts.length;
      if (sqlNameOrOpts.precision !== undefined) col.precision = sqlNameOrOpts.precision;
      if (sqlNameOrOpts.scale !== undefined) col.scale = sqlNameOrOpts.scale;
      if (sqlNameOrOpts.nullable !== undefined) col.nullable = sqlNameOrOpts.nullable;
      if (sqlNameOrOpts.defaultSql !== undefined) col.defaultSql = sqlNameOrOpts.defaultSql;
    }
    if (col.nullable === undefined) {
      const inferred = inferColumnNullableFromDesignType(dt, col.isKey, col.isUnique);
      if (inferred !== undefined) col.nullable = inferred;
    }
  };
}

/** Esclude la proprietà da meta schema / migration e da future query DAL generate. */
export function IsNotColumn(): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const ctor = (target as { constructor: Function }).constructor;
    const m = ensureMeta(ctor);
    m.notColumnKeys.add(propertyKey);
    m.columns.delete(propertyKey);
  };
}

/** Unique constraint (PostgreSQL: unique index in generated patches). */
export function Unique(): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const ctor = (target as { constructor: Function }).constructor;
    const col = touchColumn(ctor, propertyKey);
    col.isUnique = true;
    col.nullable = false;
    const dt = Reflect.getMetadata("design:type", target, propertyKey);
    if (dt && typeof (dt as { name?: string }).name === "string") {
      col.tsDesignTypeCtorName = (dt as Function).name;
    }
  };
}

export type KeyOptions = {
  /** default = 'identity' */
  generated?: "identity" | "manual";
  /** SQL DEFAULT expression (raw). Only used when `generated: 'manual'` or non-identity key. */
  defaultSql?: string;
};

/** Marks the single-column primary key (replaces C# [Key]). */
export function Key(): PropertyDecorator;
export function Key(opts: KeyOptions): PropertyDecorator;
export function Key(opts?: KeyOptions): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const ctor = (target as { constructor: Function }).constructor;
    const col = touchColumn(ctor, propertyKey);
    col.isKey = true;
    col.nullable = false;
    col.keyGenerated = opts?.generated ?? col.keyGenerated ?? "identity";
    if (opts?.defaultSql !== undefined) col.defaultSql = opts.defaultSql;
    const dt = Reflect.getMetadata("design:type", target, propertyKey);
    if (dt && typeof (dt as { name?: string }).name === "string") {
      col.tsDesignTypeCtorName = (dt as Function).name;
    }
  };
}

export function isEntityClass(value: unknown): value is EntityClass {
  return typeof value === "function" && META.get(value as Function)?.tableName !== undefined;
}

export function getTableName(ctor: EntityClass): string {
  if (!isEntityClass(ctor)) {
    throw new TypeError("Expected a class decorated with @Entity(…) or @Entity()");
  }
  return META.get(ctor as Function)!.tableName!;
}

/** Logical entity name: the class name (e.g. `CustomerEntity`). */
export function getEntityName(ctor: EntityClass): string {
  if (!isEntityClass(ctor)) {
    throw new TypeError("Expected a class decorated with @Entity(…) or @Entity()");
  }
  return (ctor as Function).name;
}

export function getColumnName(ctor: EntityClass, propertyKey: string | symbol): string {
  if (!isEntityClass(ctor)) {
    throw new TypeError("Expected a class decorated with @Entity(…) or @Entity()");
  }
  syncImplicitEntityColumns(ctor as Function);
  const reg = META.get(ctor as Function)?.columns.get(propertyKey);
  return reg?.sqlName ?? String(propertyKey);
}

export function getPrimaryKeyColumn(ctor: EntityClass): string {
  if (!isEntityClass(ctor)) {
    throw new TypeError("Expected a class decorated with @Entity(…) or @Entity()");
  }
  syncImplicitEntityColumns(ctor as Function);
  const cols = META.get(ctor as Function)!.columns;
  const keyCols: string[] = [];
  for (const [, v] of cols) {
    if (v.isKey) keyCols.push(v.sqlName);
  }
  if (keyCols.length === 0) {
    throw new TypeError("Entity is missing @Key() on exactly one property");
  }
  if (keyCols.length > 1) {
    throw new TypeError("Entity has multiple @Key() columns; only one is supported");
  }
  return keyCols[0]!;
}

/** Property keys that map to SQL columns (implicit + decorated). */
export function listEntityPersistencePropertyKeys(ctor: EntityClass): string[] {
  if (!isEntityClass(ctor)) {
    throw new TypeError("Expected a class decorated with @Entity(…) or @Entity()");
  }
  syncImplicitEntityColumns(ctor as Function);
  const cols = META.get(ctor as Function)!.columns;
  return [...cols.keys()].map((k) => String(k));
}

/** @deprecated Use {@link listEntityPersistencePropertyKeys} */
export function listDecoratedPropertyKeys(ctor: EntityClass): string[] {
  return listEntityPersistencePropertyKeys(ctor);
}

/** Serializable persistence metadata (for JSON compare with DB introspection). */
export type EntityPersistenceMeta = {
  entityClassName: string;
  tableSchema: string;
  tableName: string;
  columns: Record<
    string,
    {
      propertyKey: string;
      sqlName: string;
      isKey: boolean;
      isUnique: boolean;
      nullable?: boolean;
      pgType?: string;
      tsDesignTypeCtorName?: string;
      defaultSql?: string;
      length?: number;
      precision?: number;
      scale?: number;
      inferredPgType: string;
      usePostgresIdentity: boolean;
    }
  >;
};

/**
 * Snapshot fragment for one @Entity class. `schema` defaults to `public`.
 * Column map is keyed by **SQL column name** so it aligns with `information_schema.columns`.
 */
export function getEntityPersistenceMeta(ctor: EntityClass, tableSchema = "public"): EntityPersistenceMeta {
  if (!isEntityClass(ctor)) {
    throw new TypeError("Expected a class decorated with @Entity(…) or @Entity()");
  }
  const fn = ctor as Function;
  syncImplicitEntityColumns(fn);
  const tableName = META.get(fn)!.tableName!;
  const entityClassName = fn.name;
  const columns: EntityPersistenceMeta["columns"] = {};
  const colMap = META.get(fn)!.columns;
  for (const [propKey, reg] of colMap) {
    const propertyKey = String(propKey);
    // Defaults (can be overridden by explicit decorators):
    // - uuid default generator
    // - audit timestamps
    // - version starting point
    const sqlLower = reg.sqlName.toLowerCase();
    if (reg.defaultSql === undefined) {
      if (sqlLower === "uuid") {
        const provider = (process.env.PB_UUID_DEFAULT_PROVIDER ?? "pgcrypto").toLowerCase();
        reg.defaultSql = provider === "uuid-ossp" ? "uuid_generate_v4()" : "gen_random_uuid()";
      } else if (sqlLower === "created_at" || sqlLower === "updated_at") {
        reg.defaultSql = "now()";
      } else if (sqlLower === "version") {
        // Align with prior DAL Add() semantics (start at 1)
        reg.defaultSql = "1";
      }
    }
    const inferredPgType = inferPgTypeFromEntityColumn({
      sqlName: reg.sqlName,
      propertyKey,
      isKey: reg.isKey,
      tsDesignTypeCtorName: reg.tsDesignTypeCtorName,
      explicitPgType: reg.pgType,
      length: reg.length,
      precision: reg.precision,
      scale: reg.scale,
    });
    const usePostgresIdentity = Boolean(reg.isKey && (reg.keyGenerated ?? "identity") === "identity");
    const entry: EntityPersistenceMeta["columns"][string] = {
      propertyKey,
      sqlName: reg.sqlName,
      isKey: reg.isKey,
      isUnique: reg.isUnique,
      inferredPgType,
      usePostgresIdentity,
    };
    if (reg.pgType !== undefined) entry.pgType = reg.pgType;
    // Default: nullable true unless explicitly constrained (PK/UNIQUE or @Column({ nullable: false }))
    entry.nullable = reg.nullable ?? (reg.isKey || reg.isUnique ? false : true);
    if (reg.defaultSql !== undefined) entry.defaultSql = reg.defaultSql;
    if (reg.length !== undefined) entry.length = reg.length;
    if (reg.precision !== undefined) entry.precision = reg.precision;
    if (reg.scale !== undefined) entry.scale = reg.scale;
    if (reg.tsDesignTypeCtorName !== undefined) entry.tsDesignTypeCtorName = reg.tsDesignTypeCtorName;
    columns[reg.sqlName] = entry;
  }
  return { entityClassName, tableSchema, tableName, columns };
}
