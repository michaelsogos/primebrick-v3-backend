/**
 * List configuration for the `ai_cerebellum` entity — single source of truth
 * for which fields are exposed in list rows, which columns exist in meta, and
 * which fields are sortable/searchable/filterable.
 *
 * Mirrors `ai-models/list-config.ts` — small reference table.
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

export type AiCerebellumListColumn = {
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

export const AI_CEREBELLUM_DEFAULT_SORT = { key: "name", dir: "asc" as const };
export const AI_CEREBELLUM_DEFAULT_VIEW: ViewName = "table";

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

export const AI_CEREBELLUM_LIST_COLUMNS: AiCerebellumListColumn[] = [
  { key: "assistant_key", labelKey: "system.entities.ai_cerebellum.fields.assistant_key", type: "text", sortable: true, hideable: false, filterable: true },
  { key: "model_id", labelKey: "system.entities.ai_cerebellum.fields.model_id", type: "text", sortable: true, filterable: true },
  { key: "name", labelKey: "system.entities.ai_cerebellum.fields.name", type: "text", sortable: true, filterable: true },
  { key: "description_key", labelKey: "system.entities.ai_cerebellum.fields.description_key", type: "text", sortable: false, defaultVisible: false },
  {
    key: "enable_thinking",
    labelKey: "system.entities.ai_cerebellum.fields.enable_thinking",
    type: "badge",
    sortable: true,
    searchable: false,
    defaultVisible: true,
    filterable: true,
    badge: {
      values: {
        true: { labelKey: "system.entities.ai_cerebellum.thinking.true", color: "violet-300" },
        false: { labelKey: "system.entities.ai_cerebellum.thinking.false", color: "zinc-300" },
      },
    },
  },
  { key: "temperature", labelKey: "system.entities.ai_cerebellum.fields.temperature", type: "text", sortable: true, defaultVisible: true },
  { key: "top_p", labelKey: "system.entities.ai_cerebellum.fields.top_p", type: "text", sortable: false, defaultVisible: true },
  { key: "max_tokens", labelKey: "system.entities.ai_cerebellum.fields.max_tokens", type: "text", sortable: true, defaultVisible: true },
  { key: "repetition_penalty", labelKey: "system.entities.ai_cerebellum.fields.repetition_penalty", type: "text", sortable: false, defaultVisible: false },
  {
    key: "is_enabled",
    labelKey: "system.entities.ai_cerebellum.fields.is_enabled",
    type: "badge",
    sortable: true,
    searchable: false,
    filterable: true,
    badge: {
      values: {
        true: { labelKey: "system.entities.ai_cerebellum.enabled.true", color: "emerald-300" },
        false: { labelKey: "system.entities.ai_cerebellum.enabled.false", color: "zinc-300" },
      },
    },
  },

  // Auditing columns (hidden by default)
  { key: "uuid", labelKey: "system.entities.ai_cerebellum.fields.uuid", type: "text", sortable: true, defaultVisible: false },
  { key: "created_at", labelKey: "system.entities.ai_cerebellum.fields.created_at", type: "datetime", sortable: true, searchable: false, defaultVisible: false },
  { key: "updated_at", labelKey: "system.entities.ai_cerebellum.fields.updated_at", type: "datetime", sortable: true, searchable: false, defaultVisible: false },
  { key: "created_by", labelKey: "system.entities.ai_cerebellum.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
  { key: "updated_by", labelKey: "system.entities.ai_cerebellum.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
  { key: "version", labelKey: "system.entities.ai_cerebellum.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
  { key: "deleted_at", labelKey: "system.entities.ai_cerebellum.fields.deleted_at", type: "datetime", sortable: true, searchable: false, defaultVisible: false },
  { key: "deleted_by", labelKey: "system.entities.ai_cerebellum.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
];

export const AI_CEREBELLUM_SEARCHABLE_KEYS = AI_CEREBELLUM_LIST_COLUMNS
  .filter((c) => c.searchable !== false)
  .map((c) => c.key);

export const AI_CEREBELLUM_SORT_KEYS = AI_CEREBELLUM_LIST_COLUMNS
  .filter((c) => c.sortable)
  .map((c) => c.key);

export const AI_CEREBELLUM_FILTERABLE_KEYS = AI_CEREBELLUM_LIST_COLUMNS
  .filter((c) => c.filterable !== false)
  .map((c) => c.key);

export const AI_CEREBELLUM_AUDITING_COLUMNS: AiCerebellumListColumn[] = AI_CEREBELLUM_AUDITING_COLUMN_KEYS
  .map((k) => AI_CEREBELLUM_LIST_COLUMNS.find((c) => c.key === k))
  .filter((c): c is AiCerebellumListColumn => !!c);

export const AI_CEREBELLUM_STICKY_COLUMNS: AiCerebellumListColumn[] = (() => {
  const out: AiCerebellumListColumn[] = [];
  for (const key of AI_CEREBELLUM_STICKY_COLUMN_KEYS) {
    const col = AI_CEREBELLUM_LIST_COLUMNS.find((c) => c.key === key);
    if (col) out.push(col);
  }
  return out;
})();

export const AI_CEREBELLUM_DATA_COLUMNS: AiCerebellumListColumn[] = AI_CEREBELLUM_LIST_COLUMNS.filter(
  (c) => !auditingKeySet.has(c.key),
);

const HIDDEN_DEFAULT = [
  "uuid",
  "description_key",
  "repetition_penalty",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "version",
  "deleted_at",
  "deleted_by",
];

export const AI_CEREBELLUM_DEFAULT_VIEW_VISIBILITY: ListMetaViewVisibility = {
  table: { notHideable: ["assistant_key"], hidden: HIDDEN_DEFAULT, notDisplayable: ["id"] },
  cards: { notHideable: ["assistant_key"], hidden: HIDDEN_DEFAULT, notDisplayable: ["id"] },
  cards_list: { notHideable: ["assistant_key"], hidden: HIDDEN_DEFAULT, notDisplayable: ["id"] },
};
