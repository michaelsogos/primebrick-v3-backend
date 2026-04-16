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
  badge?: {
    values: Record<string, { labelKey: string; color: string }>;
  };
};

export const CUSTOMER_DEFAULT_SORT = { key: "updated_at", dir: "desc" as const };

/**
 * Single source of truth for the customers list:
 * - Which fields are exposed in list rows (DTO projection)
 * - Which columns exist in meta (UI columns, visible picker, search scope)
 * - Which fields are sortable/searchable
 */
export const CUSTOMER_LIST_COLUMNS: CustomerListColumn[] = [
  { key: "code", labelKey: "entities.customer.fields.code", type: "text", sortable: true, hideable: false },
  { key: "first_name", labelKey: "entities.customer.fields.first_name", type: "text", sortable: true },
  { key: "last_name", labelKey: "entities.customer.fields.last_name", type: "text", sortable: true },
  { key: "company_name", labelKey: "entities.customer.fields.company_name", type: "text", sortable: true },
  { key: "email", labelKey: "entities.customer.fields.email", type: "text", sortable: true },
  { key: "phone", labelKey: "entities.customer.fields.phone", type: "text", sortable: false, defaultVisible: false },
  {
    key: "status",
    labelKey: "entities.customer.fields.status",
    type: "badge",
    sortable: true,
    searchable: false,
    hideable: false,
    badge: {
      values: {
        ACTIVE: { labelKey: "entities.customer.status.active", color: "emerald-300" },
        INACTIVE: { labelKey: "entities.customer.status.inactive", color: "zinc-300" },
      },
    },
  },

  // Extra DTO-exposed fields (hidden by default)
  { key: "uuid", labelKey: "entities.customer.fields.uuid", type: "text", sortable: true, defaultVisible: false },
  { key: "status_reason", labelKey: "entities.customer.fields.status_reason", type: "text", sortable: false, defaultVisible: false },
  { key: "local_address", labelKey: "entities.customer.fields.local_address", type: "text", sortable: false, defaultVisible: false },
  { key: "local_city", labelKey: "entities.customer.fields.local_city", type: "text", sortable: true, defaultVisible: false },
  { key: "local_state", labelKey: "entities.customer.fields.local_state", type: "text", sortable: true, defaultVisible: false },
  { key: "local_country", labelKey: "entities.customer.fields.local_country", type: "text", sortable: true, defaultVisible: false },
  { key: "local_zip", labelKey: "entities.customer.fields.local_zip", type: "text", sortable: false, defaultVisible: false },
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

