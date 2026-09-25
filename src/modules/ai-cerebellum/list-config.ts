/**
 * List configuration for the `ai_cerebellum` entity — single source of truth
 * for which fields are exposed in list rows, which columns exist in meta, and
 * which fields are sortable/searchable/filterable.
 *
 * Mirrors `ai-models/list-config.ts` — small reference table.
 */
import type { MetaColumn } from "../../http/entity-meta.types.js";

/** Raw list column literal — canonical `MetaColumn` shape minus the
 *  flags injected by the normalize step (`sticky`, `audited`).
 *  `order` is explicit per column — array position MUST NOT matter. */
export type AiCerebellumListColumn = Omit<MetaColumn, "sticky" | "audited">;

export const AI_CEREBELLUM_DEFAULT_SORT = { key: "name", dir: "asc" as const };

export const AI_CEREBELLUM_STICKY_COLUMN_KEYS = ["uuid", "assistant_key"] as const;

export const AI_CEREBELLUM_AUDITING_COLUMN_KEYS = [
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "version",
] as const;

const auditingKeySet = new Set<string>(AI_CEREBELLUM_AUDITING_COLUMN_KEYS);

const AI_CEREBELLUM_RAW_COLUMNS: AiCerebellumListColumn[] = [
  // uuid is the canonical first sticky column (order -1), hidden but selectable
  { key: "uuid", label_key: "system.entities.ai_cerebellum.fields.uuid", type: "text", order: -1, sortable: true, default_visible: false },
  { key: "assistant_key", label_key: "system.entities.ai_cerebellum.fields.assistant_key", type: "text", order: 0, sortable: true, hideable: false, filterable: true },
  { key: "model_id", label_key: "system.entities.ai_cerebellum.fields.model_id", type: "text", order: 1, sortable: true, filterable: true },
  { key: "name", label_key: "system.entities.ai_cerebellum.fields.name", type: "text", order: 2, sortable: true, filterable: true },
  { key: "description_key", label_key: "system.entities.ai_cerebellum.fields.description_key", type: "text", order: 3, sortable: false, default_visible: false },
  {
    key: "enable_thinking",
    label_key: "system.entities.ai_cerebellum.fields.enable_thinking",
    type: "badge",
    order: 4,
    sortable: true,
    searchable: false,
    default_visible: true,
    filterable: true,
    badge: {
      values: {
        true: { label_key: "system.entities.ai_cerebellum.thinking.true", color: "violet-300" },
        false: { label_key: "system.entities.ai_cerebellum.thinking.false", color: "zinc-300" },
      },
    },
  },
  { key: "temperature", label_key: "system.entities.ai_cerebellum.fields.temperature", type: "text", order: 5, sortable: true, default_visible: true },
  { key: "top_p", label_key: "system.entities.ai_cerebellum.fields.top_p", type: "text", order: 6, sortable: false, default_visible: true },
  { key: "max_tokens", label_key: "system.entities.ai_cerebellum.fields.max_tokens", type: "text", order: 7, sortable: true, default_visible: true },
  { key: "repetition_penalty", label_key: "system.entities.ai_cerebellum.fields.repetition_penalty", type: "text", order: 8, sortable: false, default_visible: false },


  // Auditing columns (hidden by default)
  { key: "created_at", label_key: "system.entities.ai_cerebellum.fields.created_at", type: "datetime", order: 9, sortable: true, searchable: false, default_visible: false },
  { key: "updated_at", label_key: "system.entities.ai_cerebellum.fields.updated_at", type: "datetime", order: 10, sortable: true, searchable: false, default_visible: false },
  { key: "created_by", label_key: "system.entities.ai_cerebellum.fields.created_by", type: "text", order: 11, sortable: false, default_visible: false, searchable: false },
  { key: "updated_by", label_key: "system.entities.ai_cerebellum.fields.updated_by", type: "text", order: 12, sortable: false, default_visible: false, searchable: false },
  { key: "version", label_key: "system.entities.ai_cerebellum.fields.version", type: "text", order: 13, sortable: false, default_visible: false, searchable: false },
  { key: "deleted_at", label_key: "system.entities.ai_cerebellum.fields.deleted_at", type: "datetime", order: 14, sortable: true, searchable: false, default_visible: false },
  { key: "deleted_by", label_key: "system.entities.ai_cerebellum.fields.deleted_by", type: "text", order: 15, sortable: false, default_visible: false, searchable: false },
];

const stickyKeySet = new Set<string>(AI_CEREBELLUM_STICKY_COLUMN_KEYS);

/** Canonical `MetaColumn[]`: injects `sticky`, `audited`.
 *  `order` is declared explicitly per column. */
export const AI_CEREBELLUM_LIST_COLUMNS: MetaColumn[] = AI_CEREBELLUM_RAW_COLUMNS.map((c) => ({
  ...c,
  ...(stickyKeySet.has(c.key) ? { sticky: true } : {}),
  ...(auditingKeySet.has(c.key) ? { audited: true } : {}),
}));

export const AI_CEREBELLUM_SEARCHABLE_KEYS = AI_CEREBELLUM_LIST_COLUMNS
  .filter((c) => c.searchable !== false)
  .map((c) => c.key);

export const AI_CEREBELLUM_SORT_KEYS = AI_CEREBELLUM_LIST_COLUMNS
  .filter((c) => c.sortable)
  .map((c) => c.key);

export const AI_CEREBELLUM_FILTERABLE_KEYS = AI_CEREBELLUM_LIST_COLUMNS
  .filter((c) => c.filterable !== false)
  .map((c) => c.key);

export const AI_CEREBELLUM_DATA_COLUMNS: MetaColumn[] = AI_CEREBELLUM_LIST_COLUMNS.filter(
  (c) => !auditingKeySet.has(c.key),
);
