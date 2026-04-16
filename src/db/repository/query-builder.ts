import type { EntityClass } from "../../domain/entities/entity-meta.js";
import { getColumnName, getEntityPersistenceMeta, getTableName } from "../../domain/entities/entity-meta.js";

import type { FieldProjector, FilterExpr, JoinExpr, SortingExpr } from "./dsl.js";
import type { WithDeletedRecords } from "./types.js";

export type SqlQuery = { text: string; values: unknown[] };

function assertValidIdentPart(s: string, what: string): void {
  // Keep it strict to avoid SQL injection through identifiers.
  // Allow: letters, digits, underscore; must start with letter or underscore.
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) {
    throw new Error(`Invalid ${what}: ${JSON.stringify(s)}`);
  }
}

export function quoteIdent(ident: string): string {
  assertValidIdentPart(ident, "identifier");
  return `"${ident}"`;
}

function tableAliasFor(entity: EntityClass): string {
  const table = getTableName(entity);
  assertValidIdentPart(table, "tableName");
  return table;
}

function qTable(entity: EntityClass): string {
  // Using tableName as alias as well (simple, matches C# style).
  const t = getTableName(entity);
  return quoteIdent(t);
}

function qCol(entity: EntityClass, propertyKey: string): string {
  const sql = getColumnName(entity, propertyKey);
  assertValidIdentPart(sql, "columnName");
  return quoteIdent(sql);
}

function qQualifiedField(entity: EntityClass, propertyKey: string): string {
  return `${qTable(entity)}.${qCol(entity, propertyKey)}`;
}

function hasDeletedAtColumn(entity: EntityClass): boolean {
  const meta = getEntityPersistenceMeta(entity);
  return Boolean(meta.columns["deleted_at"]);
}

class ParamWriter {
  values: unknown[] = [];
  add(v: unknown): string {
    this.values.push(v);
    return `$${this.values.length}`;
  }
}

function renderProjection(entity: EntityClass, fields?: FieldProjector[]): string[] {
  if (fields && fields.length > 0) {
    return fields.map((f) => {
      if (f.kind === "expr") {
        // Explicitly raw; caller owns safety.
        return `${f.expr} AS ${quoteIdent(f.alias)}`;
      }
      const t = qTable(f.field.entity);
      const c = qCol(f.field.entity, f.field.key);
      const alias = f.alias ?? getColumnName(f.field.entity, f.field.key);
      assertValidIdentPart(alias, "projectionAlias");
      return `${t}.${c} AS ${quoteIdent(alias)}`;
    });
  }

  // Default: all persisted columns from base entity.
  const meta = getEntityPersistenceMeta(entity);
  return Object.values(meta.columns).map((c) => {
    assertValidIdentPart(c.propertyKey, "propertyKey");
    // Alias to TS property name (matches C# Dapper mapping).
    return `${qTable(entity)}.${quoteIdent(c.sqlName)} AS ${quoteIdent(c.propertyKey)}`;
  });
}

function renderJoins(joins: JoinExpr[] | undefined): string[] {
  if (!joins || joins.length === 0) return [];
  const out: string[] = [];
  for (const j of joins) {
    const rightTable = qTable(j.right.entity);
    const onExpr = `${qQualifiedField(j.right.entity, j.right.key)} = ${qQualifiedField(j.left.entity, j.left.key)}`;
    out.push(`${j.type} JOIN ${rightTable} ON ${onExpr}`);
  }
  return out;
}

function renderFilterExpr(w: ParamWriter, f: FilterExpr): string {
  switch (f.kind) {
    case "field_value": {
      const baseLeft = qQualifiedField(f.left.entity, f.left.key);
      const left =
        (f.op === "ILIKE" || f.op === "LIKE") && String(f.left.key) === "uuid"
          ? `CAST(${baseLeft} AS text)`
          : baseLeft;
      if (f.op === "IN" || f.op === "NOT IN") {
        const arr = Array.isArray(f.right) ? f.right : [f.right];
        const params = arr.map((v) => w.add(v)).join(", ");
        return `${left} ${f.op} (${params})`;
      }
      if (f.op === "IS" || f.op === "IS NOT") {
        // Only allow null / true / false as raw-ish right side.
        if (f.right === null) return `${left} ${f.op} NULL`;
        if (f.right === true) return `${left} ${f.op} TRUE`;
        if (f.right === false) return `${left} ${f.op} FALSE`;
        throw new Error(`IS/IS NOT only supports null/boolean (got ${typeof f.right})`);
      }
      // LIKE/ILIKE: use '#' as escape char (see customers search needle builder). Avoids '\' parsing quirks across PG versions.
      if (f.op === "ILIKE" || f.op === "LIKE") {
        return `${left} ${f.op} ${w.add(f.right)} ESCAPE '#'`;
      }
      return `${left} ${f.op} ${w.add(f.right)}`;
    }
    case "field_field": {
      const left = qQualifiedField(f.left.entity, f.left.key);
      const right = qQualifiedField(f.right.entity, f.right.key);
      return `${left} ${f.op} ${right}`;
    }
    case "raw":
      return `${f.left} ${f.op} ${f.right}`;
    case "group": {
      const inner = f.filters.map((x) => renderFilterExpr(w, x)).join(` ${f.operand} `);
      return `(${inner})`;
    }
  }
}

function renderWhere(
  w: ParamWriter,
  entity: EntityClass,
  deletedRecords: WithDeletedRecords | undefined,
  filters?: FilterExpr[]
): string[] {
  const where: string[] = [];

  if (hasDeletedAtColumn(entity)) {
    const mode = deletedRecords ?? "EXCLUDED";
    const col = `${qTable(entity)}.${quoteIdent("deleted_at")}`;
    if (mode === "ONLY") where.push(`${col} IS NOT NULL`);
    if (mode === "EXCLUDED") where.push(`${col} IS NULL`);
  }

  if (filters && filters.length > 0) {
    // C# version supports OR groups by setting operand per filter; we mimic that by chaining.
    let first = true;
    let expr = "";
    for (const f of filters) {
      const part = renderFilterExpr(w, f);
      if (first) {
        expr = part;
        first = false;
      } else {
        expr = `${expr} ${f.operand} ${part}`;
      }
    }
    if (expr.trim() !== "") where.push(expr);
  }

  return where;
}

function renderOrderBy(entity: EntityClass, sorting?: SortingExpr[]): string | null {
  if (!sorting || sorting.length === 0) return null;
  const parts = sorting.map((s) => `${qQualifiedField(s.field.entity, s.field.key)} ${s.dir}`);
  return parts.join(", ");
}

export type SelectQueryInput = {
  entity: EntityClass;
  fields?: FieldProjector[];
  joins?: JoinExpr[];
  filters?: FilterExpr[];
  sorting?: SortingExpr[];
  deletedRecords?: WithDeletedRecords;
  limit?: number;
  offset?: number;
  includeTotalRecordsWindow?: boolean;
};

export function buildSelectQuery(input: SelectQueryInput): SqlQuery {
  const w = new ParamWriter();
  const baseTable = qTable(input.entity);
  const projection = renderProjection(input.entity, input.fields);
  if (input.includeTotalRecordsWindow) projection.push(`COUNT(*) OVER() AS ${quoteIdent("_total_records")}`);

  const joins = renderJoins(input.joins);
  const where = renderWhere(w, input.entity, input.deletedRecords, input.filters);
  const orderBy = renderOrderBy(input.entity, input.sorting);

  const parts: string[] = [];
  parts.push(`SELECT ${projection.join(", ")} FROM ${baseTable}`);
  if (joins.length) parts.push(joins.join(" "));
  if (where.length) parts.push(`WHERE ${where.join(" AND ")}`);
  if (orderBy) parts.push(`ORDER BY ${orderBy}`);
  if (input.limit !== undefined) parts.push(`LIMIT ${w.add(input.limit)}::int`);
  if (input.offset !== undefined) parts.push(`OFFSET ${w.add(input.offset)}::int`);

  return { text: parts.join(" "), values: w.values };
}

