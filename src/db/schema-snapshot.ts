/**
 * Compare canonical JSON snapshots: “intent” (@Entity metadata) vs PostgreSQL catalog.
 * Uses pg_catalog-style typing (via snapshot) + rename heuristics inspired by pg-diff workflows.
 */

import {
  findLikelyRenames,
  RENAME_HEURISTIC_AGENT_INSTRUCTION,
  type LikelyRename,
  type RenameAmbiguity,
} from "./schema-rename-heuristics.js";
import type { SchemaSnapshot } from "./schema-types.js";
import { comparablePgType } from "./schema-type-normalize.js";

export type { LikelyRename, RenameAmbiguity, RenameHeuristicResult } from "./schema-rename-heuristics.js";
export { RENAME_HEURISTIC_AGENT_INSTRUCTION } from "./schema-rename-heuristics.js";
export type { SchemaColumnMeta, SchemaSnapshot, SchemaTableMeta } from "./schema-types.js";
export { tableKey } from "./schema-types.js";

export type SchemaMetaDiffV2 = {
  version: 2;
  generatedAt: string;
  onlyInEntityTables: string[];
  onlyInDatabaseTables: string[];
  /**
   * True if any shared table had ambiguous rename candidates. Coding agents must ask the user
   * before applying `likelyRenames` SQL; `onlyIn*` column lists intentionally ignore heuristic
   * renames in that case so nothing looks “auto-resolved”.
   */
  renameHeuristicUserReviewRequired?: boolean;
  /** Present when {@link SchemaMetaDiffV2.renameHeuristicUserReviewRequired} is true. */
  renameHeuristicAgentInstruction?: string;
  tables: Record<
    string,
    {
      onlyInEntityColumns: string[];
      onlyInDatabaseColumns: string[];
      likelyRenames: LikelyRename[];
      renameHeuristicUserReviewRequired?: boolean;
      renameHeuristicAmbiguities?: RenameAmbiguity[];
      typeMismatches: {
        column: string;
        entityComparable: string;
        databaseComparable: string;
        entityType?: string | null;
        databaseType?: string | null;
        entityTypname?: string | null;
        databaseTypname?: string | null;
      }[];
      nullabilityMismatches: {
        column: string;
        entityNullable?: boolean | null;
        databaseNullable?: boolean | null;
      }[];
    }
  >;
};

/** @deprecated Prefer {@link SchemaMetaDiffV2} */
export type SchemaMetaDiffV1 = SchemaMetaDiffV2;

export function compareSnapshots(entitySnap: SchemaSnapshot, dbSnap: SchemaSnapshot): SchemaMetaDiffV2 {
  const entityKeys = new Set(Object.keys(entitySnap.tables));
  const dbKeys = new Set(Object.keys(dbSnap.tables));
  const onlyInEntityTables = [...entityKeys].filter((k) => !dbKeys.has(k));
  const onlyInDatabaseTables = [...dbKeys].filter((k) => !entityKeys.has(k));
  const tables: SchemaMetaDiffV2["tables"] = {};
  let anyRenameHeuristicReview = false;

  for (const key of entityKeys) {
    if (!dbKeys.has(key)) continue;
    const et = entitySnap.tables[key]!;
    const dt = dbSnap.tables[key]!;
    const eCols = new Set(Object.keys(et.columns));
    const dCols = new Set(Object.keys(dt.columns));
    const rawOnlyInEntity = [...eCols].filter((c) => !dCols.has(c));
    const rawOnlyInDb = [...dCols].filter((c) => !eCols.has(c));

    const renameHeuristic = findLikelyRenames(
      et.schema,
      et.name,
      rawOnlyInEntity,
      rawOnlyInDb,
      et.columns,
      dt.columns
    );
    if (renameHeuristic.userReviewRequired) anyRenameHeuristicReview = true;

    const applyHeuristicRenamesToColumnLists = !renameHeuristic.userReviewRequired;
    const renamedFromDb = applyHeuristicRenamesToColumnLists
      ? new Set(renameHeuristic.likelyRenames.map((r) => r.databaseColumn))
      : new Set<string>();
    const renamedFromEntity = applyHeuristicRenamesToColumnLists
      ? new Set(renameHeuristic.likelyRenames.map((r) => r.entityColumn))
      : new Set<string>();
    const onlyInEntityColumns = rawOnlyInEntity.filter((c) => !renamedFromEntity.has(c));
    const onlyInDatabaseColumns = rawOnlyInDb.filter((c) => !renamedFromDb.has(c));

    const typeMismatches: SchemaMetaDiffV2["tables"][string]["typeMismatches"] = [];
    const nullabilityMismatches: SchemaMetaDiffV2["tables"][string]["nullabilityMismatches"] = [];

    for (const col of [...eCols].filter((c) => dCols.has(c))) {
      const ec = et.columns[col]!;
      const dc = dt.columns[col]!;
      const eComp = comparablePgType(ec);
      const dComp = comparablePgType(dc);
      // Skip when the entity declares no PG type hint (`unknown`); avoid noisy diffs vs catalog.
      if (eComp !== "unknown" && eComp !== dComp) {
        typeMismatches.push({
          column: col,
          entityComparable: eComp,
          databaseComparable: dComp,
          entityType: ec.dataType ?? null,
          databaseType: dc.dataType ?? dc.formatType ?? null,
          entityTypname: ec.typname ?? null,
          databaseTypname: dc.typname ?? null,
        });
      }
      if (ec.isNullable != null && dc.isNullable != null && ec.isNullable !== dc.isNullable) {
        nullabilityMismatches.push({ column: col, entityNullable: ec.isNullable, databaseNullable: dc.isNullable });
      }
    }

    if (
      onlyInEntityColumns.length ||
      onlyInDatabaseColumns.length ||
      renameHeuristic.likelyRenames.length ||
      renameHeuristic.ambiguities.length ||
      typeMismatches.length ||
      nullabilityMismatches.length
    ) {
      tables[key] = {
        onlyInEntityColumns,
        onlyInDatabaseColumns,
        likelyRenames: renameHeuristic.likelyRenames,
        ...(renameHeuristic.userReviewRequired
          ? {
              renameHeuristicUserReviewRequired: true,
              renameHeuristicAmbiguities: renameHeuristic.ambiguities,
            }
          : {}),
        typeMismatches,
        nullabilityMismatches,
      };
    }
  }

  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    onlyInEntityTables,
    onlyInDatabaseTables,
    ...(anyRenameHeuristicReview
      ? {
          renameHeuristicUserReviewRequired: true,
          renameHeuristicAgentInstruction: RENAME_HEURISTIC_AGENT_INSTRUCTION,
        }
      : {}),
    tables,
  };
}
