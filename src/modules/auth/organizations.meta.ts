/**
 * `organization` entity metadata — the JSON returned by
 * `GET /api/v1/entities/organization/meta`.
 *
 * Pure data, no logic. Extracted from the inline block that used to live in
 * `organizations_router.ts`.
 */

export const organizationMeta = {
  entity: "organization",
  translationKey: "organization",
  titleKey: "entities.organization.title",
  updatePageTitle: "${display_name}",
  uid: "uuid",
  list: {
    columns: [
      { key: "uuid", labelKey: "entities.organization.fields.uuid", type: "text", sortable: true, defaultVisible: false, filterable: true },
      { key: "idp_code", labelKey: "entities.organization.fields.idp_code", type: "text", sortable: true, defaultVisible: true, sticky: true, filterable: true },
      { key: "display_name", labelKey: "entities.organization.fields.display_name", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "website_url", labelKey: "entities.organization.fields.website_url", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "user_count", labelKey: "entities.organization.fields.user_count", type: "number", sortable: false, defaultVisible: true },
      { key: "created_at", labelKey: "entities.organization.fields.created_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_by", labelKey: "entities.organization.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "updated_at", labelKey: "entities.organization.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "updated_by", labelKey: "entities.organization.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "last_synced_at", labelKey: "entities.organization.fields.last_synced_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "version", labelKey: "entities.organization.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "deleted_at", labelKey: "entities.organization.fields.deleted_at", type: "datetime", sortable: true, defaultVisible: false, searchable: false },
      { key: "deleted_by", labelKey: "entities.organization.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
    ],
    stickyColumns: [
      { key: "uuid", labelKey: "entities.organization.fields.uuid", type: "text", sortable: true, defaultVisible: false, filterable: true },
      { key: "idp_code", labelKey: "entities.organization.fields.idp_code", type: "text", sortable: true, defaultVisible: true, sticky: true, filterable: true },
    ],
    auditingColumns: [
      { key: "deleted_at", labelKey: "entities.organization.fields.deleted_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "deleted_by", labelKey: "entities.organization.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "updated_at", labelKey: "entities.organization.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "updated_by", labelKey: "entities.organization.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "last_synced_at", labelKey: "entities.organization.fields.last_synced_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_at", labelKey: "entities.organization.fields.created_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_by", labelKey: "entities.organization.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "version", labelKey: "entities.organization.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
    ],
    defaultSort: { key: "created_at", dir: "desc" },
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    searchPlaceholderKey: "entities.list.searchPlaceholder",
    rowActions: {
      duplicate: false,
      delete: true,
      edit: true,
      preview: true,
    },
    enableCreateAction: true,
    viewVisibility: {
      table: {
        notHideable: ["idp_code"],
        hidden: ["uuid", "created_by", "updated_by", "version", "deleted_at", "deleted_by"],
        notDisplayable: [],
      },
      cards: {
        notHideable: ["idp_code"],
        hidden: ["uuid", "created_by", "updated_by", "version", "deleted_at", "deleted_by"],
        notDisplayable: [],
      },
      cards_list: {
        notHideable: ["idp_code"],
        hidden: ["uuid", "created_by", "updated_by", "version", "deleted_at", "deleted_by"],
        notDisplayable: [],
      },
    },
  },
} as const;
