import type { MetaColumn } from "../../http/entity-meta.types.js";

/** Raw list column literal — canonical `MetaColumn` shape minus the
 *  flags injected by the normalize step (`sticky`, `audited`).
 *  `order` is explicit per column — array position MUST NOT matter. */
export type CustomerListColumn = Omit<MetaColumn, "sticky" | "audited">;

export const CUSTOMER_DEFAULT_SORT = { key: "updated_at", dir: "desc" as const };

/**
 * Sticky columns: always visible and pinned to the left.
 * These are derived from the entity keys, not from column flags.
 */
export const CUSTOMER_STICKY_COLUMN_KEYS = ["uuid", "code"] as const;

/**
 * Auditing columns: metadata fields managed by the system.
 * These are derived from the IAuditableEntity interface.
 */
export const CUSTOMER_AUDITING_COLUMN_KEYS = [
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "version",
] as const;

const auditingKeySet = new Set<string>(CUSTOMER_AUDITING_COLUMN_KEYS);

/**
 * Single source of truth for the customers list:
 * - Which fields are exposed in list rows (DTO projection)
 * - Which columns exist in meta (UI columns, visible picker, search scope)
 * - Which fields are sortable/searchable/filterable
 */
const CUSTOMER_RAW_COLUMNS: CustomerListColumn[] = [
  // uuid is the canonical first sticky column (order -1), hidden but selectable
  { key: "uuid", label_key: "system.entities.customer.fields.uuid", type: "text", order: -1, sortable: true, default_visible: false },
  { key: "code", label_key: "system.entities.customer.fields.code", type: "text", order: 0, sortable: true, hideable: false, filterable: true },
  { key: "first_name", label_key: "system.entities.customer.fields.first_name", type: "text", order: 1, sortable: true, filterable: true },
  { key: "last_name", label_key: "system.entities.customer.fields.last_name", type: "text", order: 2, sortable: true, filterable: true },
  { key: "company_name", label_key: "system.entities.customer.fields.company_name", type: "text", order: 3, sortable: true, filterable: true },
  { key: "email", label_key: "system.entities.customer.fields.email", type: "text", order: 4, sortable: true, filterable: true },
  { key: "phone", label_key: "system.entities.customer.fields.phone", type: "text", order: 5, sortable: false, default_visible: false },
  {
    key: "status",
    label_key: "system.entities.customer.fields.status",
    type: "badge",
    order: 6,
    sortable: true,
    searchable: false,
    hideable: false,
    filterable: true,
    badge: {
      values: {
        ACTIVE: { label_key: "system.entities.customer.status.active", color: "emerald-300" },
        INACTIVE: { label_key: "system.entities.customer.status.inactive", color: "zinc-300" },
      },
    },
  },
  {
    key: "onboarding_at",
    label_key: "system.entities.customer.fields.onboarding_at",
    type: "datetime",
    order: 7,
    sortable: true,
    searchable: false,
    default_visible: true,
    filterable: true,
    datetime_iana_toggle: { record_iana_field: "onboarding_time_zone" },
  },

  // Extra DTO-exposed fields (hidden by default)
  { key: "status_reason", label_key: "system.entities.customer.fields.status_reason", type: "text", order: 8, sortable: false, default_visible: false },
  { key: "local_address", label_key: "system.entities.customer.fields.local_address", type: "text", order: 9, sortable: false, default_visible: false },
  { key: "local_city", label_key: "system.entities.customer.fields.local_city", type: "text", order: 10, sortable: true, default_visible: false, filterable: true },
  { key: "local_state", label_key: "system.entities.customer.fields.local_state", type: "text", order: 11, sortable: true, default_visible: false, filterable: true },
  { key: "local_country", label_key: "system.entities.customer.fields.local_country", type: "text", order: 12, sortable: true, default_visible: false, filterable: true },
  { key: "local_zip", label_key: "system.entities.customer.fields.local_zip", type: "text", order: 13, sortable: false, default_visible: false },
  {
    key: "onboarding_time_zone",
    label_key: "system.entities.customer.fields.onboarding_time_zone",
    type: "text",
    order: 14,
    sortable: true,
    searchable: false,
    default_visible: false,
  },
  { key: "created_at", label_key: "system.entities.customer.fields.created_at", type: "datetime", order: 15, sortable: true, searchable: false, default_visible: false },
  { key: "updated_at", label_key: "system.entities.customer.fields.updated_at", type: "datetime", order: 16, sortable: true, searchable: false, default_visible: false },
  { key: "created_by", label_key: "system.entities.customer.fields.created_by", type: "text", order: 17, sortable: false, default_visible: false, searchable: false },
  { key: "updated_by", label_key: "system.entities.customer.fields.updated_by", type: "text", order: 18, sortable: false, default_visible: false, searchable: false },
  { key: "version", label_key: "system.entities.customer.fields.version", type: "text", order: 19, sortable: false, default_visible: false, searchable: false },
  { key: "deleted_at", label_key: "system.entities.customer.fields.deleted_at", type: "datetime", order: 20, sortable: true, searchable: false, default_visible: false },
  { key: "deleted_by", label_key: "system.entities.customer.fields.deleted_by", type: "text", order: 21, sortable: false, default_visible: false, searchable: false },
];

const stickyKeySet = new Set<string>(CUSTOMER_STICKY_COLUMN_KEYS);

/**
 * Canonical `MetaColumn[]`: injects `sticky` and `audited` flags so the
 * served meta is a single columns dictionary — no duplicated sticky/auditing
 * column arrays. `order` is declared explicitly per column.
 */
export const CUSTOMER_LIST_COLUMNS: MetaColumn[] = CUSTOMER_RAW_COLUMNS.map((c) => ({
  ...c,
  ...(stickyKeySet.has(c.key) ? { sticky: true } : {}),
  ...(auditingKeySet.has(c.key) ? { audited: true } : {}),
}));

export const CUSTOMER_SEARCHABLE_KEYS = CUSTOMER_LIST_COLUMNS.filter((c) => c.searchable !== false).map((c) => c.key);
export const CUSTOMER_SORT_KEYS = CUSTOMER_LIST_COLUMNS.filter((c) => c.sortable).map((c) => c.key);
export const CUSTOMER_FILTERABLE_KEYS = CUSTOMER_LIST_COLUMNS.filter((c) => c.filterable !== false).map((c) => c.key);

