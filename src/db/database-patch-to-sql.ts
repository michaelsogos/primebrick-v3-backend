import type { SchemaColumnMeta, SchemaSnapshot } from "./schema-types.js";
import type { SchemaMetaDiffV2 } from "./schema-snapshot.js";

function quoteIdent(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

/** Types from DB introspection or entity snapshot (`typname` / inferred TS→PG). */
function entityPgType(col: SchemaColumnMeta): string {
  const t = (col.formatType ?? col.typname ?? col.dataType)?.trim();
  if (t) return t;
  return "text";
}

function columnTypeDdl(col: SchemaColumnMeta): string {
  if (col.isPostgresIdentity) {
    return "bigint generated always as identity";
  }
  return entityPgType(col);
}

function defaultClause(col: SchemaColumnMeta): string {
  if (!col.defaultSql) return "";
  if (col.isPostgresIdentity) return "";
  return ` DEFAULT ${col.defaultSql}`;
}

/** NOT NULL only when explicitly required (PK / UNIQUE / `nullable: false`). */
function nullClause(col: SchemaColumnMeta): string {
  if (col.isNullable === true) return "";
  if (col.isNullable === false) return " NOT NULL";
  if (col.isPrimaryKey || col.isUnique) return " NOT NULL";
  return "";
}

function uniqueIndexName(tableName: string, columnName: string): string {
  return slugifyIdent(`${tableName}_${columnName}_uq`);
}

function slugifyIdent(s: string): string {
  return s.replace(/[^a-zA-Z0-9_]/g, "_").replace(/_+/g, "_").slice(0, 63) || "uq";
}

/**
 * Best-effort SQL to move **TARGET database** toward **entity** intent.
 * Destructive changes (DROP) are never emitted — only comments / ADD / CREATE / RENAME (when allowed).
 */
export function buildSqlPatchFromMetaDiff(entitySnap: SchemaSnapshot, diff: SchemaMetaDiffV2): string {
  const lines: string[] = [];
  lines.push("-- Primebrick: entity → database patch (review before apply)");
  lines.push(`-- generatedAt: ${diff.generatedAt}`);
  lines.push("");

  // UUID default providers: ensure required extension exists when using defaultSql.
  const needsPgcrypto = Object.values(entitySnap.tables).some((t) =>
    Object.values(t.columns).some((c) => c.defaultSql?.includes("gen_random_uuid()"))
  );
  const needsUuidOssp = Object.values(entitySnap.tables).some((t) =>
    Object.values(t.columns).some((c) => c.defaultSql?.includes("uuid_generate_v4()"))
  );
  if (needsPgcrypto) {
    lines.push('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    lines.push("");
  } else if (needsUuidOssp) {
    lines.push('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    lines.push("");
  }

  if (diff.renameHeuristicUserReviewRequired) {
    lines.push("-- WARN: renameHeuristicUserReviewRequired — ask the user before uncommenting RENAME lines.");
    lines.push("");
  }

  for (const tableKey of diff.onlyInEntityTables) {
    const t = entitySnap.tables[tableKey];
    if (!t) continue;
    const fq = `${quoteIdent(t.schema)}.${quoteIdent(t.name)}`;
    const cols = Object.values(t.columns).sort(
      (a, b) => (a.ordinalPosition ?? 9999) - (b.ordinalPosition ?? 9999)
    );
    const parts: string[] = [];
    for (const c of cols) {
      parts.push(`  ${quoteIdent(c.name)} ${columnTypeDdl(c)}${defaultClause(c)}${nullClause(c)}`);
    }
    const pk = cols.find((c) => c.isPrimaryKey)?.name;
    let body = parts.join(",\n");
    if (pk) body += `,\n  PRIMARY KEY (${quoteIdent(pk)})`;
    lines.push(`CREATE TABLE IF NOT EXISTS ${fq} (`);
    lines.push(body);
    lines.push(");");
    lines.push("");
    for (const c of cols) {
      if (c.isUnique && !c.isPrimaryKey) {
        const ix = uniqueIndexName(t.name, c.name);
        lines.push(
          `CREATE UNIQUE INDEX IF NOT EXISTS ${quoteIdent(ix)} ON ${fq} (${quoteIdent(c.name)});`
        );
      }
    }
    if (cols.some((c) => c.isUnique && !c.isPrimaryKey)) lines.push("");
  }

  for (const [tableKey, tab] of Object.entries(diff.tables)) {
    const tmeta = entitySnap.tables[tableKey];
    if (!tmeta) continue;
    const fq = `${quoteIdent(tmeta.schema)}.${quoteIdent(tmeta.name)}`;
    const tableReview = Boolean(tab.renameHeuristicUserReviewRequired);

    for (const col of tab.onlyInEntityColumns) {
      const cmeta = entitySnap.tables[tableKey]?.columns[col];
      if (!cmeta) continue;
      const typeSql = columnTypeDdl(cmeta);
      const def = defaultClause(cmeta);
      const nn = nullClause(cmeta);
      lines.push(`ALTER TABLE ${fq} ADD COLUMN IF NOT EXISTS ${quoteIdent(col)} ${typeSql}${def}${nn};`);
      if (cmeta.isPrimaryKey) {
        lines.push(
          `-- WARN: PK column "${col}" added; ensure table/backfill before relying on NOT NULL + PK`
        );
      }
    }

    if (tab.likelyRenames.length > 0) {
      lines.push("");
      if (tableReview || diff.renameHeuristicUserReviewRequired) {
        lines.push("/* Heuristic RENAME — user confirmed ambiguity resolution; uncomment after choice:");
        for (const r of tab.likelyRenames) {
          lines.push(`-- ${r.suggestedSql}`);
        }
        lines.push("*/");
      } else {
        lines.push("-- Heuristic renames (no ambiguity flag on this table):");
        for (const r of tab.likelyRenames) {
          lines.push(r.suggestedSql);
        }
      }
      lines.push("");
    }

    for (const m of tab.typeMismatches) {
      lines.push(
        `-- TYPE mismatch "${m.column}" entity≈${m.entityComparable} db≈${m.databaseComparable} — manual ALTER TYPE / migration`
      );
    }
    for (const m of tab.nullabilityMismatches) {
      lines.push(
        `-- NULLABILITY "${m.column}" entity=${m.entityNullable} db=${m.databaseNullable} — manual ALTER COLUMN … SET/DROP NOT NULL`
      );
    }

    for (const col of tab.onlyInDatabaseColumns) {
      lines.push(`-- WARN: DB-only column "${col}" on ${tableKey} — not dropped`);
    }

    if (
      tab.onlyInEntityColumns.length ||
      tab.likelyRenames.length ||
      tab.typeMismatches.length ||
      tab.nullabilityMismatches.length ||
      tab.onlyInDatabaseColumns.length
    ) {
      lines.push("");
    }
  }

  for (const tableKey of diff.onlyInDatabaseTables) {
    lines.push(`-- WARN: table only in database: ${tableKey} — not dropped`);
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

