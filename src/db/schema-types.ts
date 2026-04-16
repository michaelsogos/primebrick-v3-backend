/**
 * Shared shapes for entity vs database schema snapshots (used by compare + heuristics).
 */

export type SchemaColumnMeta = {
  /** SQL identifier */
  name: string;
  /** Ordinal in table (1-based), from pg_attribute.attnum or declaration order */
  ordinalPosition?: number | null;
  /** `information_schema`-style or entity hint */
  dataType?: string | null;
  /** Physical type name from pg_type.typname (PostGIS: geometry, geography, …) */
  typname?: string | null;
  /** `pg_type.oid` */
  typeOid?: number | null;
  typcategory?: string | null;
  /** `pg_catalog.format_type(atttypid, atttypmod)` */
  formatType?: string | null;
  numericPrecision?: number | null;
  numericScale?: number | null;
  isNullable?: boolean | null;
  /** From @Key() on entity side; from PK discovery on DB side when available */
  isPrimaryKey?: boolean;
  /** Entity: `@Unique()` → emit `CREATE UNIQUE INDEX` in DDL patches */
  isUnique?: boolean;
  /** Entity: surrogate `id` PK → `bigint generated … as identity` in DDL */
  isPostgresIdentity?: boolean;
  /** Entity: SQL DEFAULT expression (raw). */
  defaultSql?: string;
  /** Entity side: TS property backing this column */
  propertyKey?: string;
};

export type SchemaTableMeta = {
  kind: "table";
  schema: string;
  name: string;
  entityClassName?: string;
  columns: Record<string, SchemaColumnMeta>;
};

export type SchemaSnapshot = {
  version: 1;
  generatedAt: string;
  source: "entities" | "database";
  tables: Record<string, SchemaTableMeta>;
};

export function tableKey(schema: string, name: string): string {
  return `${schema}.${name}`;
}
