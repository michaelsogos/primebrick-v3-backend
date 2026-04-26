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

export type CustomerListColumn = {
  key: string;
  labelKey: string;
  type: "text" | "badge" | "datetime";
  sortable: boolean;
  /** If false, column is excluded from "search in fields" dropdown and backend default search scope. */
  searchable?: boolean;
  /** If false, user cannot hide it in the UI column picker. */
  hideable?: boolean;
  /** If false, column is hidden by default in the UI. */
  defaultVisible?: boolean;
  /** If true, column supports filter operations (=, !=, ILIKE, etc.) */
  filterable?: boolean;
  badge?: {
    values: Record<string, { labelKey: string; color: string }>;
  };
  /**
   * FE-only: `datetime` columns may show a header toggle between browser-local formatting
   * and formatting in the IANA zone from `recordIanaField` on each row.
   */
  datetimeIanaToggle?: {
    recordIanaField: string;
  };
};

export const CUSTOMER_DEFAULT_SORT = { key: "updated_at", dir: "desc" as const };
export const CUSTOMER_DEFAULT_VIEW: ViewName = "table";

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
export const CUSTOMER_LIST_COLUMNS: CustomerListColumn[] = [
  { key: "code", labelKey: "entities.customer.fields.code", type: "text", sortable: true, hideable: false },
  { key: "first_name", labelKey: "entities.customer.fields.first_name", type: "text", sortable: true, filterable: true },
  { key: "last_name", labelKey: "entities.customer.fields.last_name", type: "text", sortable: true, filterable: true },
  { key: "company_name", labelKey: "entities.customer.fields.company_name", type: "text", sortable: true, filterable: true },
  { key: "email", labelKey: "entities.customer.fields.email", type: "text", sortable: true, filterable: true },
  { key: "phone", labelKey: "entities.customer.fields.phone", type: "text", sortable: false, defaultVisible: false },
  {
    key: "status",
    labelKey: "entities.customer.fields.status",
    type: "badge",
    sortable: true,
    searchable: false,
    hideable: false,
    filterable: true,
    badge: {
      values: {
        ACTIVE: { labelKey: "entities.customer.status.active", color: "emerald-300" },
        INACTIVE: { labelKey: "entities.customer.status.inactive", color: "zinc-300" },
      },
    },
  },
  {
    key: "onboarding_at",
    labelKey: "entities.customer.fields.onboarding_at",
    type: "datetime",
    sortable: true,
    searchable: false,
    defaultVisible: true,
    filterable: true,
    datetimeIanaToggle: { recordIanaField: "onboarding_time_zone" },
  },

  // Extra DTO-exposed fields (hidden by default)
  { key: "uuid", labelKey: "entities.customer.fields.uuid", type: "text", sortable: true, defaultVisible: false },
  { key: "status_reason", labelKey: "entities.customer.fields.status_reason", type: "text", sortable: false, defaultVisible: false },
  { key: "local_address", labelKey: "entities.customer.fields.local_address", type: "text", sortable: false, defaultVisible: false },
  { key: "local_city", labelKey: "entities.customer.fields.local_city", type: "text", sortable: true, defaultVisible: false, filterable: true },
  { key: "local_state", labelKey: "entities.customer.fields.local_state", type: "text", sortable: true, defaultVisible: false, filterable: true },
  { key: "local_country", labelKey: "entities.customer.fields.local_country", type: "text", sortable: true, defaultVisible: false, filterable: true },
  { key: "local_zip", labelKey: "entities.customer.fields.local_zip", type: "text", sortable: false, defaultVisible: false },
  {
    key: "onboarding_time_zone",
    labelKey: "entities.customer.fields.onboarding_time_zone",
    type: "text",
    sortable: true,
    searchable: false,
    defaultVisible: false,
  },
  { key: "created_at", labelKey: "entities.customer.fields.created_at", type: "datetime", sortable: true, searchable: false, defaultVisible: false },
  { key: "updated_at", labelKey: "entities.customer.fields.updated_at", type: "datetime", sortable: true, searchable: false, defaultVisible: false },
  { key: "created_by", labelKey: "entities.customer.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
  { key: "updated_by", labelKey: "entities.customer.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
  { key: "version", labelKey: "entities.customer.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
  { key: "deleted_at", labelKey: "entities.customer.fields.deleted_at", type: "datetime", sortable: true, searchable: false, defaultVisible: false },
  { key: "deleted_by", labelKey: "entities.customer.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
];

export const CUSTOMER_SEARCHABLE_KEYS = CUSTOMER_LIST_COLUMNS.filter((c) => c.searchable !== false).map((c) => c.key);
export const CUSTOMER_SORT_KEYS = CUSTOMER_LIST_COLUMNS.filter((c) => c.sortable).map((c) => c.key);
export const CUSTOMER_FILTERABLE_KEYS = CUSTOMER_LIST_COLUMNS.filter((c) => c.filterable !== false).map((c) => c.key);

export const CUSTOMER_AUDITING_COLUMNS: CustomerListColumn[] = CUSTOMER_AUDITING_COLUMN_KEYS
  .map((k) => CUSTOMER_LIST_COLUMNS.find((c) => c.key === k))
  .filter((c): c is CustomerListColumn => !!c);

export const CUSTOMER_STICKY_COLUMNS: CustomerListColumn[] = (() => {
  const out: CustomerListColumn[] = [];
  for (const key of CUSTOMER_STICKY_COLUMN_KEYS) {
    const col = CUSTOMER_LIST_COLUMNS.find((c) => c.key === key);
    if (col) out.push(col);
  }
  return out;
})();

export const CUSTOMER_DATA_COLUMNS: CustomerListColumn[] = CUSTOMER_LIST_COLUMNS.filter(
  (c) => !auditingKeySet.has(c.key) && !auditingKeySet.has(c.key)
);

/**
 * Default view visibility config.
 * - sticky columns (uuid, code) are always visible
 * - code is not hideable (sticky by design)
 * - uuid is hidden by default but sticky
 */
export const CUSTOMER_DEFAULT_VIEW_VISIBILITY: ListMetaViewVisibility = {
  table: {
    notHideable: ["code"],
    hidden: ["phone", "uuid", "status_reason", "local_address", "local_zip", "onboarding_time_zone"],
    notDisplayable: ["id"],
  },
  cards: {
    notHideable: ["code"],
    hidden: ["uuid", "status_reason", "local_address", "local_zip", "onboarding_time_zone", "created_at", "created_by", "updated_at", "updated_by", "version", "deleted_at", "deleted_by"],
    notDisplayable: ["id"],
  },
  cards_list: {
    notHideable: ["code"],
    hidden: ["uuid", "status_reason", "local_address", "local_zip", "onboarding_time_zone", "created_at", "created_by", "updated_at", "updated_by", "version", "deleted_at", "deleted_by"],
    notDisplayable: ["id"],
  },
};

