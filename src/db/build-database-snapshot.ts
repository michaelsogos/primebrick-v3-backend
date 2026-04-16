import { Pool } from "pg";
import { type SchemaColumnMeta, type SchemaSnapshot, tableKey } from "./schema-types.js";

type PgColRow = {
  column_name: string;
  ordinal_position: number;
  is_nullable: boolean;
  typname: string;
  type_oid: number;
  typcategory: string;
  format_type: string;
  numeric_precision: number | null;
  numeric_scale: number | null;
};

/** Primary key columns (one query per schema batch). */
async function loadPrimaryKeyColumns(
  pool: Pool,
  schema: string,
  tableNames: string[]
): Promise<Set<string>> {
  if (tableNames.length === 0) return new Set();
  const r = await pool.query<{ schema: string; table: string; col: string }>(
    `SELECT n.nspname AS schema, c.relname AS "table", a.attname AS col
     FROM pg_index i
     JOIN pg_class c ON c.oid = i.indrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY (i.indkey)
     WHERE i.indisprimary
       AND n.nspname = $1
       AND c.relname = ANY ($2::text[])`,
    [schema, tableNames]
  );
  const set = new Set<string>();
  for (const row of r.rows) {
    set.add(`${row.schema}.${row.table}.${row.col}`);
  }
  return set;
}

/**
 * Introspect given tables into the same {@link SchemaSnapshot} shape as entities.
 * Uses `pg_attribute` / `pg_type` / `format_type` (pg-diff-api CatalogApi style) so PostGIS
 * and other UDTs surface with real `typname` / `typcategory`, not only `information_schema.data_type`.
 */
export async function buildDatabaseSnapshot(
  databaseUrl: string,
  tables: { schema: string; name: string }[],
  generatedAt = new Date().toISOString()
): Promise<SchemaSnapshot> {
  const pool = new Pool({ connectionString: databaseUrl, max: 2 });
  try {
    const bySchema = new Map<string, string[]>();
    for (const t of tables) {
      const list = bySchema.get(t.schema) ?? [];
      list.push(t.name);
      bySchema.set(t.schema, list);
    }

    const pkQualified = new Set<string>();
    for (const [schema, names] of bySchema) {
      const uniq = [...new Set(names)];
      const pks = await loadPrimaryKeyColumns(pool, schema, uniq);
      for (const pk of pks) pkQualified.add(pk);
    }

    const out: SchemaSnapshot["tables"] = {};
    for (const { schema, name } of tables) {
      const existsR = await pool.query<{ oid: string }>(
        `SELECT c.oid::text AS oid
         FROM pg_catalog.pg_class c
         INNER JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1::name
           AND c.relname = $2::name
           AND c.relkind IN ('r', 'p')
         LIMIT 1`,
        [schema, name]
      );
      if (existsR.rowCount === 0) {
        continue;
      }

      const { rows } = await pool.query<PgColRow>(
        `SELECT
           a.attname AS column_name,
           a.attnum AS ordinal_position,
           NOT a.attnotnull AS is_nullable,
           t.typname,
           t.oid AS type_oid,
           t.typcategory,
           pg_catalog.format_type(a.atttypid, a.atttypmod) AS format_type,
           CASE
             WHEN t.typname IN ('numeric', 'decimal') AND a.atttypmod > 0
               THEN ((a.atttypmod - 4) >> 16)::int
           END AS numeric_precision,
           CASE
             WHEN t.typname IN ('numeric', 'decimal') AND a.atttypmod > 0
               THEN ((a.atttypmod - 4) & 65535)::int
           END AS numeric_scale
         FROM pg_catalog.pg_attribute a
         INNER JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
         INNER JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
         INNER JOIN pg_catalog.pg_type t ON t.oid = a.atttypid
         WHERE n.nspname = $1::name
           AND c.relname = $2::name
           AND c.relkind IN ('r', 'p')
           AND a.attnum > 0
           AND NOT a.attisdropped
         ORDER BY a.attnum`,
        [schema, name]
      );
      const key = tableKey(schema, name);
      const columns: Record<string, SchemaColumnMeta> = {};
      for (const row of rows) {
        const isPk = pkQualified.has(`${schema}.${name}.${row.column_name}`);
        columns[row.column_name] = {
          name: row.column_name,
          ordinalPosition: row.ordinal_position,
          dataType: row.typname,
          typname: row.typname,
          typeOid: row.type_oid,
          typcategory: row.typcategory,
          formatType: row.format_type,
          numericPrecision: row.numeric_precision,
          numericScale: row.numeric_scale,
          isNullable: row.is_nullable,
          isPrimaryKey: isPk,
        };
      }
      out[key] = {
        kind: "table",
        schema,
        name,
        columns,
      };
    }

    return { version: 1, generatedAt, source: "database", tables: out };
  } finally {
    await pool.end();
  }
}
