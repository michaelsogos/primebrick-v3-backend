/**
 * Canonical entity metadata schema — the closed contract for every
 * `GET /api/v1/entities/{entity}/meta` response.
 *
 * Every `*.meta.ts` file MUST be annotated with `EntityMeta` (or a derived
 * interface such as `ConfigEntryMeta`). The schema is CLOSED: undeclared
 * properties are compile errors, so new meta props require extending these
 * types first.
 *
 * Field naming is snake_case end-to-end (BE JSON → FE TS model, no DTO
 * renaming).
 */

import type { ActionsOverrides, EntityAction } from "./entity-actions.js";
import type { ConfigType, TypeCapabilities } from "@primebrick/sdk";

export type { ActionsOverrides } from "./entity-actions.js";

/** Table view names supported by EntityListTable. */
export type ViewName = "table" | "cards" | "cards_list";

/** UI column renderer type. NOTE: this is the UI type, not the PG dbType —
 * e.g. `roles` is `"text"` here but `jsonb` on disk (never ILIKE-searchable). */
export type MetaColumnType =
  | "text"
  | "badge"
  | "boolean"
  | "color"
  | "datetime"
  | "number";

/**
 * Entity field descriptor — the root-level `columns` dictionary.
 * Transversal to every page type: table cells, form tooltips, labels.
 */
export interface MetaColumn {
  /** Entity field key — must match the DTO/entity property name. */
  key: string;
  /** i18n key for the column/field label. */
  label_key: string;
  type: MetaColumnType;
  /** Deterministic display position — explicit per column, array position
   * MUST NOT matter. Rendering groups sticky → normal → audited, each group
   * sorted by `order`. Convention: `uuid` is `order: -1` (canonical first
   * sticky column, hidden but selectable); `display_field` is `order: 0`. */
  order: number;

  // ---- table flags (consumed by EntityListTable) ----
  /** Column supports ORDER BY (default true when omitted by consumers). */
  sortable?: boolean;
  /** Column supports filter operations in the filters sheet. */
  filterable?: boolean;
  /** Included in "search in fields" scope + backend default search
   * (default true; set false for non-text-physical or sensitive fields). */
  searchable?: boolean;
  /** Visible by default (default true). */
  default_visible?: boolean;
  /** Pinned at the left of the table, rendered before normal columns. */
  sticky?: boolean;
  /** If false, the column cannot be hidden via the column picker. */
  hideable?: boolean;
  /** System-managed auditing column (created_at, updated_by, …) —
   * rendered last. */
  audited?: boolean;

  // ---- form/list tooltip flags ----
  /** i18n key of the hint tooltip body. */
  tooltip?: string;
  /** i18n key of the tooltip title. */
  tooltip_title?: string;
  /** Tooltip visual priority (affects icon/color). */
  tooltip_priority?: "WARNING" | "HINT" | string;
  /** Show the tooltip on form pages (default false). */
  show_form_tooltip?: boolean;
  /** Show the tooltip on list/table pages (default false). */
  show_list_tooltip?: boolean;

  // ---- type-specific payloads ----
  /** `type: "badge"` — per-value label/color mapping. */
  badge?: {
    values: Record<string, { label_key: string; color: string }>;
  };
  /** `type: "datetime"` — FE-only IANA formatting toggle bound to a
   * per-row timezone field. */
  datetime_iana_toggle?: {
    record_iana_field: string;
  };
}

/** UI configuration for a non-standard row CTA (route-backed bare op). */
export interface RowCustomAction {
  /** Action/op name — matches the bare op derived from the route
   * (e.g. `change_password`). */
  action_name: string;
  /** i18n key for the CTA label. */
  translation_key: string;
  /** Lucide icon name. */
  icon: string;
  /** Optional CSS color class for the label. */
  text_color?: string;
  /** Disable the CTA on soft-deleted rows. */
  disabled_when_deleted?: boolean;
  /** Permission required to see/use the action (filtered client-side
   * against the user's permission set). */
  required_permission?: string;
}

/** EntityListTable options — present only on entities with a table page. */
export interface TableMeta {
  /** Initial view (default "table"). */
  default_view?: ViewName;
  default_sort?: { key: string; dir: "asc" | "desc" };
  default_page_size?: number;
  page_size_options?: number[];
  /** UI config for non-standard row actions (e.g. change password).
   * Standard ops (edit/delete/duplicate/preview) are derived from
   * `meta.actions` — never declared here. */
  row_custom_actions?: RowCustomAction[];
}

/**
 * Static entity meta — the shape every `*.meta.ts` file MUST satisfy.
 */
export interface EntityMeta {
  /** Entity name, snake_case singular (e.g. `user_profile`). */
  entity: string;
  /** i18n prefix, snake_case singular — used to build dynamic keys. */
  translation_key: string;
  /** i18n key for the entity title. */
  title_key: string;
  /** Field key holding the entity primary key (usually `uuid`). */
  uid: string;
  /**
   * Canonical display field — the column key identifying the entity's
   * human-readable label. Drives first-column/sticky table identity and
   * default display resolution.
   */
  display_field: string;
  /**
   * Display expression template (`${field}` syntax, dot-paths allowed).
   * OPTIONAL here: `assembleMeta` materializes it as
   * `"${" + display_field + "}"` when absent — it is always present in the
   * served response. Used automatically for edit-page titles; reusable for
   * comboboxes, lists, chips.
   */
  display_name?: string;
  /** Per-op enable overrides — may ONLY toggle `enabled` on route-backed
   * ops; a missing route already produces `enabled: false`. */
  actions_overrides?: ActionsOverrides;
  /** Entity field dictionary (root-level, transversal). */
  columns: MetaColumn[];
  /** EntityListTable options — omit when the entity has no table page
   * (e.g. `meMeta` self-service form). */
  table?: TableMeta;
}

/**
 * `config_entry` specialization — owns the canonical per-type capability
 * matrix (`TYPE_CAPABILITIES` from `@primebrick/sdk`).
 */
export interface ConfigEntryMeta extends EntityMeta {
  type_capabilities: Record<ConfigType, TypeCapabilities>;
}

/** Collaboration fragment injected by `assembleMeta` at serve time. */
export interface CollaborationMeta {
  enabled: boolean;
  expose_editing_value: boolean;
}

/**
 * The served `GET /api/v1/entities/{entity}/meta` response:
 * static meta + runtime-injected `display_name`, `actions`, `collaboration`.
 */
export type EntityMetaResponse = EntityMeta & {
  display_name: string;
  actions: EntityAction[];
  collaboration: CollaborationMeta;
};
