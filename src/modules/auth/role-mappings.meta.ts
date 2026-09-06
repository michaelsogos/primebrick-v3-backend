/**
 * `role_mappings` entity metadata — the JSON returned by
 * `GET /api/v1/entities/role_mappings/meta`.
 *
 * Pure data, no logic. Mirrors `organizations.meta.ts`.
 *
 * NOTE: `role_mappings` uses HARD DELETE only (no `deleted_at`/`deleted_by`).
 * Rationale: Casdoor role deletion is irreversible — there is no Casdoor
 * "restore role" API. Soft-deleting locally + restoring would create IDP drift.
 * Therefore `rowActions.restore: false` and there is no `deleted_at`/`deleted_by`
 * column in the meta. This is a deliberate, documented deviation from the
 * org/user soft-delete pattern.
 */

export const roleMappingsMeta = {
  entity: "role_mappings",
  translationKey: "role_mapping",
  titleKey: "system.entities.role_mapping.title",
  updatePageTitle: "${idp_role}",
  uid: "uuid",
  list: {
    columns: [
      { key: "uuid", labelKey: "system.entities.role_mapping.fields.uuid", type: "text", sortable: true, defaultVisible: false, filterable: true },
      { key: "idp_role", labelKey: "system.entities.role_mapping.fields.idp_role", type: "text", sortable: true, defaultVisible: true, sticky: true, filterable: true },
      { key: "idp_org", labelKey: "system.entities.role_mapping.fields.idp_org", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "label_key", labelKey: "system.entities.role_mapping.fields.label_key", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "is_admin", labelKey: "system.entities.role_mapping.fields.is_admin", type: "badge", sortable: true, defaultVisible: true, filterable: true },
      { key: "permissions", labelKey: "system.entities.role_mapping.fields.permissions", type: "text", sortable: false, defaultVisible: true },
      { key: "last_synced_at", labelKey: "system.entities.role_mapping.fields.last_synced_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_at", labelKey: "system.entities.role_mapping.fields.created_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_by", labelKey: "system.entities.role_mapping.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "updated_at", labelKey: "system.entities.role_mapping.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "updated_by", labelKey: "system.entities.role_mapping.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "version", labelKey: "system.entities.role_mapping.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
    ],
    stickyColumns: [
      { key: "uuid", labelKey: "system.entities.role_mapping.fields.uuid", type: "text", sortable: true, defaultVisible: false, filterable: true },
      { key: "idp_role", labelKey: "system.entities.role_mapping.fields.idp_role", type: "text", sortable: true, defaultVisible: true, sticky: true, filterable: true },
    ],
    auditingColumns: [
      { key: "updated_at", labelKey: "system.entities.role_mapping.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "updated_by", labelKey: "system.entities.role_mapping.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "last_synced_at", labelKey: "system.entities.role_mapping.fields.last_synced_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_at", labelKey: "system.entities.role_mapping.fields.created_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_by", labelKey: "system.entities.role_mapping.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "version", labelKey: "system.entities.role_mapping.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
    ],
    defaultSort: { key: "idp_role", dir: "asc" },
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    searchPlaceholderKey: "system.entities.list.searchPlaceholder",
    rowActions: {
      duplicate: false,
      delete: true,
      edit: true,
      preview: false,
      restore: false,
    },
    enableCreateAction: true,
    viewVisibility: {
      table: {
        notHideable: ["idp_role"],
        hidden: ["uuid", "created_by", "updated_by", "version"],
        notDisplayable: [],
      },
      cards: {
        notHideable: ["idp_role"],
        hidden: ["uuid", "created_by", "updated_by", "version"],
        notDisplayable: [],
      },
      cards_list: {
        notHideable: ["idp_role"],
        hidden: ["uuid", "created_by", "updated_by", "version"],
        notDisplayable: [],
      },
    },
  },
} as const;
