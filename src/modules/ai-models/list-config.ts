/**
 * List configuration for the `ai_model` entity — single source of truth for
 * which fields are exposed in list rows, which columns exist in meta, and
 * which fields are sortable/searchable/filterable.
 *
 * Mirrors the `customers/list-config.ts` pattern but simplified for a small
 * reference table (~3-10 rows).
 */
export type ViewName = "table" | "cards" | "cards_list";

export type ViewVisibilityConfig = {
  visible?: string[];
  hidden?: string[];
  notDisplayable?: string[];
  notHideable?: string[];
};

export type ListMetaViewVisibility = {
  [K in ViewName]: ViewVisibilityConfig;
};

export type AiModelListColumn = {
  key: string;
  labelKey: string;
  type: "text" | "badge" | "datetime" | "color";
  sortable: boolean;
  searchable?: boolean;
  hideable?: boolean;
  defaultVisible?: boolean;
  filterable?: boolean;
  badge?: {
    values: Record<string, { labelKey: string; color: string }>;
  };
};

export const AI_MODEL_DEFAULT_SORT = { key: "sort_order", dir: "asc" as const };
export const AI_MODEL_DEFAULT_VIEW: ViewName = "table";

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

export const AI_MODEL_LIST_COLUMNS: AiModelListColumn[] = [
  { key: "model_id", labelKey: "system.entities.ai_model.fields.model_id", type: "text", sortable: true, hideable: false, filterable: true },
  {
    key: "engine_type",
    labelKey: "system.entities.ai_model.fields.engine_type",
    type: "badge",
    sortable: true,
    searchable: false,
    defaultVisible: true,
    filterable: true,
    badge: {
      values: {
        webllm: { labelKey: "system.entities.ai_model.engine_type.webllm", color: "zinc-300" },
        onnx: { labelKey: "system.entities.ai_model.engine_type.onnx", color: "violet-300" },
      },
    },
  },
  { key: "dtype", labelKey: "system.entities.ai_model.fields.dtype", type: "text", sortable: true, defaultVisible: true },
  { key: "name", labelKey: "system.entities.ai_model.fields.name", type: "text", sortable: true, filterable: true },
  {
    key: "power_level",
    labelKey: "system.entities.ai_model.fields.power_level",
    type: "badge",
    sortable: true,
    searchable: false,
    hideable: false,
    filterable: true,
    badge: {
      values: {
        "1": { labelKey: "system.entities.ai_model.power_level.1", color: "zinc-300" },
        "2": { labelKey: "system.entities.ai_model.power_level.2", color: "blue-300" },
        "3": { labelKey: "system.entities.ai_model.power_level.3", color: "emerald-300" },
        "4": { labelKey: "system.entities.ai_model.power_level.4", color: "amber-300" },
        "5": { labelKey: "system.entities.ai_model.power_level.5", color: "rose-300" },
      },
    },
  },
  {
    key: "rank",
    labelKey: "system.entities.ai_model.fields.rank",
    type: "text",
    sortable: true,
    searchable: false,
    filterable: true,
  },
  {
    key: "enable_thinking",
    labelKey: "system.entities.ai_model.fields.enable_thinking",
    type: "badge",
    sortable: true,
    searchable: false,
    defaultVisible: true,
    filterable: true,
    badge: {
      values: {
        true: { labelKey: "system.entities.ai_model.thinking.true", color: "violet-300" },
        false: { labelKey: "system.entities.ai_model.thinking.false", color: "zinc-300" },
      },
    },
  },
  { key: "temperature", labelKey: "system.entities.ai_model.fields.temperature", type: "text", sortable: true, defaultVisible: true },
  { key: "top_p", labelKey: "system.entities.ai_model.fields.top_p", type: "text", sortable: false, defaultVisible: true },
  { key: "max_tokens", labelKey: "system.entities.ai_model.fields.max_tokens", type: "text", sortable: true, defaultVisible: true },
  { key: "repetition_penalty", labelKey: "system.entities.ai_model.fields.repetition_penalty", type: "text", sortable: false, defaultVisible: false },
  { key: "sort_order", labelKey: "system.entities.ai_model.fields.sort_order", type: "text", sortable: true, defaultVisible: false },
  { key: "download_size_mb", labelKey: "system.entities.ai_model.fields.download_size_mb", type: "text", sortable: true, defaultVisible: true },
  { key: "vram_mb", labelKey: "system.entities.ai_model.fields.vram_mb", type: "text", sortable: true, defaultVisible: true },
  {
    key: "compatibility_status",
    labelKey: "system.entities.ai_model.fields.compatibility_status",
    type: "badge",
    sortable: true,
    searchable: false,
    defaultVisible: true,
    filterable: true,
    badge: {
      values: {
        COMPATIBLE: { labelKey: "system.entities.ai_model.compatibility.COMPATIBLE", color: "emerald-300" },
        NOT_COMPATIBLE: { labelKey: "system.entities.ai_model.compatibility.NOT_COMPATIBLE", color: "rose-300" },
        UNTESTED: { labelKey: "system.entities.ai_model.compatibility.UNTESTED", color: "zinc-300" },
      },
    },
  },
  { key: "label_key", labelKey: "system.entities.ai_model.fields.label_key", type: "text", sortable: false, defaultVisible: false },
  { key: "description_key", labelKey: "system.entities.ai_model.fields.description_key", type: "text", sortable: false, defaultVisible: false },

  // Auditing columns (hidden by default)
  { key: "uuid", labelKey: "system.entities.ai_model.fields.uuid", type: "text", sortable: true, defaultVisible: false },
  { key: "created_at", labelKey: "system.entities.ai_model.fields.created_at", type: "datetime", sortable: true, searchable: false, defaultVisible: false },
  { key: "updated_at", labelKey: "system.entities.ai_model.fields.updated_at", type: "datetime", sortable: true, searchable: false, defaultVisible: false },
  { key: "created_by", labelKey: "system.entities.ai_model.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
  { key: "updated_by", labelKey: "system.entities.ai_model.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
  { key: "version", labelKey: "system.entities.ai_model.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
  { key: "deleted_at", labelKey: "system.entities.ai_model.fields.deleted_at", type: "datetime", sortable: true, searchable: false, defaultVisible: false },
  { key: "deleted_by", labelKey: "system.entities.ai_model.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
];

export const AI_MODEL_SEARCHABLE_KEYS = AI_MODEL_LIST_COLUMNS
  .filter((c) => c.searchable !== false)
  .map((c) => c.key);

export const AI_MODEL_SORT_KEYS = AI_MODEL_LIST_COLUMNS
  .filter((c) => c.sortable)
  .map((c) => c.key);

export const AI_MODEL_FILTERABLE_KEYS = AI_MODEL_LIST_COLUMNS
  .filter((c) => c.filterable !== false)
  .map((c) => c.key);

export const AI_MODEL_AUDITING_COLUMNS: AiModelListColumn[] = AI_MODEL_AUDITING_COLUMN_KEYS
  .map((k) => AI_MODEL_LIST_COLUMNS.find((c) => c.key === k))
  .filter((c): c is AiModelListColumn => !!c);

export const AI_MODEL_STICKY_COLUMNS: AiModelListColumn[] = (() => {
  const out: AiModelListColumn[] = [];
  for (const key of AI_MODEL_STICKY_COLUMN_KEYS) {
    const col = AI_MODEL_LIST_COLUMNS.find((c) => c.key === key);
    if (col) out.push(col);
  }
  return out;
})();

export const AI_MODEL_DATA_COLUMNS: AiModelListColumn[] = AI_MODEL_LIST_COLUMNS.filter(
  (c) => !auditingKeySet.has(c.key),
);

export const AI_MODEL_DEFAULT_VIEW_VISIBILITY: ListMetaViewVisibility = {
  table: {
    notHideable: ["model_id"],
    hidden: ["uuid", "label_key", "description_key", "repetition_penalty", "sort_order", "created_at", "created_by", "updated_at", "updated_by", "version", "deleted_at", "deleted_by"],
    notDisplayable: ["id"],
  },
  cards: {
    notHideable: ["model_id"],
    hidden: ["uuid", "label_key", "description_key", "repetition_penalty", "sort_order", "created_at", "created_by", "updated_at", "updated_by", "version", "deleted_at", "deleted_by"],
    notDisplayable: ["id"],
  },
  cards_list: {
    notHideable: ["model_id"],
    hidden: ["uuid", "label_key", "description_key", "repetition_penalty", "sort_order", "created_at", "created_by", "updated_at", "updated_by", "version", "deleted_at", "deleted_by"],
    notDisplayable: ["id"],
  },
};
