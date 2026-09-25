/**
 * List configuration for the `ai_model` entity — single source of truth for
 * which fields are exposed in list rows, which columns exist in meta, and
 * which fields are sortable/searchable/filterable.
 *
 * Mirrors the `customers/list-config.ts` pattern but simplified for a small
 * reference table (~3-10 rows).
 */
import type { MetaColumn } from "../../http/entity-meta.types.js";

/** Raw list column literal — canonical `MetaColumn` shape minus the
 *  flags injected by the normalize step (`sticky`, `audited`).
 *  `order` is explicit per column — array position MUST NOT matter. */
export type AiModelListColumn = Omit<MetaColumn, "sticky" | "audited">;

export const AI_MODEL_DEFAULT_SORT = { key: "sort_order", dir: "asc" as const };

export const AI_MODEL_STICKY_COLUMN_KEYS = ["uuid", "model_id"] as const;

export const AI_MODEL_AUDITING_COLUMN_KEYS = [
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "version",
] as const;

const auditingKeySet = new Set<string>(AI_MODEL_AUDITING_COLUMN_KEYS);

const AI_MODEL_RAW_COLUMNS: AiModelListColumn[] = [
  // uuid is the canonical first sticky column (order -1), hidden but selectable
  { key: "uuid", label_key: "system.entities.ai_model.fields.uuid", type: "text", order: -1, sortable: true, default_visible: false },
  { key: "model_id", label_key: "system.entities.ai_model.fields.model_id", type: "text", order: 0, sortable: true, hideable: false, filterable: true },
  {
    key: "engine_type",
    label_key: "system.entities.ai_model.fields.engine_type",
    type: "badge",
    order: 1,
    sortable: true,
    searchable: false,
    default_visible: true,
    filterable: true,
    badge: {
      values: {
        webllm: { label_key: "system.entities.ai_model.engine_type.webllm", color: "zinc-300" },
        onnx: { label_key: "system.entities.ai_model.engine_type.onnx", color: "violet-300" },
      },
    },
  },
  { key: "dtype", label_key: "system.entities.ai_model.fields.dtype", type: "text", order: 2, sortable: true, default_visible: true },
  { key: "name", label_key: "system.entities.ai_model.fields.name", type: "text", order: 3, sortable: true, filterable: true },
  {
    key: "power_level",
    label_key: "system.entities.ai_model.fields.power_level",
    type: "badge",
    order: 4,
    sortable: true,
    searchable: false,
    hideable: false,
    filterable: true,
    badge: {
      values: {
        "1": { label_key: "system.entities.ai_model.power_level.1", color: "zinc-300" },
        "2": { label_key: "system.entities.ai_model.power_level.2", color: "blue-300" },
        "3": { label_key: "system.entities.ai_model.power_level.3", color: "emerald-300" },
        "4": { label_key: "system.entities.ai_model.power_level.4", color: "amber-300" },
        "5": { label_key: "system.entities.ai_model.power_level.5", color: "rose-300" },
      },
    },
  },
  {
    key: "rank",
    label_key: "system.entities.ai_model.fields.rank",
    type: "text",
    order: 5,
    sortable: true,
    searchable: false,
    filterable: true,
  },
  {
    key: "enable_thinking",
    label_key: "system.entities.ai_model.fields.enable_thinking",
    type: "badge",
    order: 6,
    sortable: true,
    searchable: false,
    default_visible: true,
    filterable: true,
    badge: {
      values: {
        true: { label_key: "system.entities.ai_model.thinking.true", color: "violet-300" },
        false: { label_key: "system.entities.ai_model.thinking.false", color: "zinc-300" },
      },
    },
  },
  { key: "temperature", label_key: "system.entities.ai_model.fields.temperature", type: "text", order: 7, sortable: true, default_visible: true },
  { key: "top_p", label_key: "system.entities.ai_model.fields.top_p", type: "text", order: 8, sortable: false, default_visible: true },
  { key: "max_tokens", label_key: "system.entities.ai_model.fields.max_tokens", type: "text", order: 9, sortable: true, default_visible: true },
  { key: "repetition_penalty", label_key: "system.entities.ai_model.fields.repetition_penalty", type: "text", order: 10, sortable: false, default_visible: false },
  { key: "sort_order", label_key: "system.entities.ai_model.fields.sort_order", type: "text", order: 11, sortable: true, default_visible: false },
  { key: "download_size_mb", label_key: "system.entities.ai_model.fields.download_size_mb", type: "text", order: 12, sortable: true, default_visible: true },
  { key: "vram_mb", label_key: "system.entities.ai_model.fields.vram_mb", type: "text", order: 13, sortable: true, default_visible: true },
  {
    key: "compatibility_status",
    label_key: "system.entities.ai_model.fields.compatibility_status",
    type: "badge",
    order: 14,
    sortable: true,
    searchable: false,
    default_visible: true,
    filterable: true,
    badge: {
      values: {
        COMPATIBLE: { label_key: "system.entities.ai_model.compatibility.COMPATIBLE", color: "emerald-300" },
        NOT_COMPATIBLE: { label_key: "system.entities.ai_model.compatibility.NOT_COMPATIBLE", color: "rose-300" },
        UNTESTED: { label_key: "system.entities.ai_model.compatibility.UNTESTED", color: "zinc-300" },
      },
    },
  },
  { key: "label_key", label_key: "system.entities.ai_model.fields.label_key", type: "text", order: 15, sortable: false, default_visible: false },
  { key: "description_key", label_key: "system.entities.ai_model.fields.description_key", type: "text", order: 16, sortable: false, default_visible: false },

  // Auditing columns (hidden by default)
  { key: "created_at", label_key: "system.entities.ai_model.fields.created_at", type: "datetime", order: 17, sortable: true, searchable: false, default_visible: false },
  { key: "updated_at", label_key: "system.entities.ai_model.fields.updated_at", type: "datetime", order: 18, sortable: true, searchable: false, default_visible: false },
  { key: "created_by", label_key: "system.entities.ai_model.fields.created_by", type: "text", order: 19, sortable: false, default_visible: false, searchable: false },
  { key: "updated_by", label_key: "system.entities.ai_model.fields.updated_by", type: "text", order: 20, sortable: false, default_visible: false, searchable: false },
  { key: "version", label_key: "system.entities.ai_model.fields.version", type: "text", order: 21, sortable: false, default_visible: false, searchable: false },
  { key: "deleted_at", label_key: "system.entities.ai_model.fields.deleted_at", type: "datetime", order: 22, sortable: true, searchable: false, default_visible: false },
  { key: "deleted_by", label_key: "system.entities.ai_model.fields.deleted_by", type: "text", order: 23, sortable: false, default_visible: false, searchable: false },
];

const stickyKeySet = new Set<string>(AI_MODEL_STICKY_COLUMN_KEYS);

/** Canonical `MetaColumn[]`: injects `sticky`, `audited`.
 *  `order` is declared explicitly per column. */
export const AI_MODEL_LIST_COLUMNS: MetaColumn[] = AI_MODEL_RAW_COLUMNS.map((c) => ({
  ...c,
  ...(stickyKeySet.has(c.key) ? { sticky: true } : {}),
  ...(auditingKeySet.has(c.key) ? { audited: true } : {}),
}));

export const AI_MODEL_SEARCHABLE_KEYS = AI_MODEL_LIST_COLUMNS
  .filter((c) => c.searchable !== false)
  .map((c) => c.key);

export const AI_MODEL_SORT_KEYS = AI_MODEL_LIST_COLUMNS
  .filter((c) => c.sortable)
  .map((c) => c.key);

export const AI_MODEL_FILTERABLE_KEYS = AI_MODEL_LIST_COLUMNS
  .filter((c) => c.filterable !== false)
  .map((c) => c.key);

export const AI_MODEL_DATA_COLUMNS: MetaColumn[] = AI_MODEL_LIST_COLUMNS.filter(
  (c) => !auditingKeySet.has(c.key),
);
