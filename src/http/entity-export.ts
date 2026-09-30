/**
 * entity-export — ONE entity-wide export pipeline (Part E.7).
 *
 * `streamEntityExport` owns everything that used to be hand-copied into each
 * entity's `exportXxx(query, res)` service method: response headers, file
 * naming, template selection, and — crucially — the `ExportConfig`, which is
 * now DERIVED from entity meta instead of hand-listed:
 *
 *   - `fieldMapping`   → identity map over the export columns
 *   - `translations`   → `col_<key>` labels resolved from each column's
 *                        `label_key` via the translations service (locale-aware)
 *   - `metadata.fields`→ export type derived from the meta column `type`,
 *                        with `datetime_iana_toggle` → `date` + `timezoneField`
 *   - `entity` labels  → `system.entities.<entity>.{singular,plural}` keys
 *   - `data`           → `service.stream(query)` — the SAME filter builder
 *                        as `list` (no third copy)
 *
 * Default export column set: every meta column EXCEPT audit-actor columns
 * (`*_by`), `version`, `deleted_at`, and columns that are the target of a
 * `datetime_iana_toggle.record_iana_field` (timezone helper fields). This
 * reproduces the historical hand-picked customer export list exactly; an
 * entity can override via `columns`.
 *
 * Templates resolve by convention: `templates/<entity>_export_template.<ext>`
 * (xlsx/html), overridable per entity via `templates`.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Response } from "express";

import { exportDataWithTemplateToStream } from "../lib/export/index.js";
import type { ExportConfig, ExportFieldMetadata, ExportFileType } from "../lib/export/types.js";
import type { EntityMeta, MetaColumn } from "./entity-meta.types.js";
import { TranslationsService } from "../modules/system/translations.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface EntityExportQuery {
  file_type: ExportFileType;
  locale?: string;
  timezone?: string;
  [key: string]: unknown;
}

export interface EntityExportConfig {
  /** Explicit export column allowlist (order preserved). Default: derived
   *  from meta (see header comment). */
  columns?: string[];
  /** Template overrides — default `templates/<entity>_export_template.<ext>`. */
  templates?: { xlsx?: string; html?: string };
  /** Entity display labels — default: resolved from
   *  `system.entities.<entity>.{singular,plural}` translation keys. */
  entityLabels?: { singular: string; plural: string };
  /** Translations module for label resolution (default `"system"`). */
  translationModule?: string;
}

const NEVER_EXPORTED = new Set(["version", "deleted_at", "created_by", "updated_by", "deleted_by"]);

/** Columns that exist only to carry a record-level IANA timezone for a
 *  `datetime_iana_toggle` column — helper data, never a visible export column. */
export function ianaHelperFields(meta: EntityMeta): Set<string> {
  const s = new Set<string>();
  for (const c of meta.columns) {
    const f = (c as { datetime_iana_toggle?: { record_iana_field?: string } }).datetime_iana_toggle?.record_iana_field;
    if (f) s.add(f);
  }
  return s;
}

export function defaultExportColumns(meta: EntityMeta): MetaColumn[] {
  const helpers = ianaHelperFields(meta);
  return [...meta.columns]
    .filter((c) => !NEVER_EXPORTED.has(c.key) && !helpers.has(c.key))
    .sort((a, b) => a.order - b.order);
}

export function exportFieldMetadata(col: MetaColumn): ExportFieldMetadata {
  const tzField = (col as { datetime_iana_toggle?: { record_iana_field?: string } })
    .datetime_iana_toggle?.record_iana_field;
  switch (col.type) {
    case "datetime":
      return tzField
        ? { type: "date", timezoneField: tzField }
        : { type: "datetime", precision: "seconds" };
    case "number":
      return { type: "number" };
    default:
      return { type: "string" };
  }
}

function humanize(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function streamEntityExport(
  opts: {
    entityName: string;
    meta: EntityMeta;
    /** `service.stream` — same query/filter contract as `list`. */
    stream: (query: EntityExportQuery) => AsyncIterable<Record<string, unknown>>;
    export?: EntityExportConfig;
  },
  query: EntityExportQuery,
  res: Response,
): Promise<void> {
  const { entityName, meta, stream } = opts;
  const cfg = opts.export ?? {};
  const { file_type } = query;
  const locale = query.locale || "en-GB";

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${entityName}-export-${timestamp}.${file_type}`;
  const contentType =
    file_type === "xlsx"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : file_type === "html"
        ? "text/html"
        : "text/csv";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // --- meta-derived column set ---------------------------------------------
  const cols = cfg.columns
    ? meta.columns.filter((c) => cfg.columns!.includes(c.key))
        .sort((a, b) => cfg.columns!.indexOf(a.key) - cfg.columns!.indexOf(b.key))
    : defaultExportColumns(meta);

  // --- label resolution via the translations service ------------------------
  const dict = await new TranslationsService()
    .getI18nDict(cfg.translationModule ?? "system", locale)
    .then((e) => e.data)
    .catch(() => ({} as Record<string, string>));

  const translations: Record<string, string> = {};
  const fieldMapping: Record<string, string> = {};
  const fields: Record<string, ExportFieldMetadata> = {};
  for (const c of cols) {
    fieldMapping[c.key] = c.key;
    fields[c.key] = exportFieldMetadata(c);
    translations[`col_${c.key}`] = dict[c.label_key] ?? humanize(c.key);
  }

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const entityLabels = cfg.entityLabels ?? {
    singular: cap(dict[`system.entities.${entityName}.singular`] ?? humanize(entityName)),
    plural: cap(dict[`system.entities.${entityName}.plural`] ?? `${humanize(entityName)}s`),
  };

  const config: ExportConfig = {
    locale,
    defaultTimezone: query.timezone || "Europe/Rome",
    entity: entityLabels,
    translations,
    fieldMapping,
    metadata: { fields },
    data: stream(query),
  };

  const templatePath =
    file_type === "html"
      ? (cfg.templates?.html ?? path.join(__dirname, `../../templates/${entityName}_export_template.html`))
      : (cfg.templates?.xlsx ?? path.join(__dirname, `../../templates/${entityName}_export_template.xlsx`));

  await exportDataWithTemplateToStream(templatePath, res, file_type, config);
}
