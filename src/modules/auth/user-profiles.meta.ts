/**
 * `user_profiles` entity metadata — the JSON returned by
 * `GET /api/v1/entities/user_profiles/meta`.
 *
 * Pure data, no logic. Extracted verbatim from the inline block that used to
 * live in `router.ts` so the meta is scannable and reusable (mirrors the
 * `customers/list-config.ts` pattern).
 */

export const userProfileMeta = {
  entity: "user_profiles",
  titleKey: "entities.userProfile.title",
  updatePageTitle: "${display_name}",
  uid: "uuid",
  list: {
    columns: [
      { key: "uuid", labelKey: "entities.userProfile.fields.uuid", type: "text", sortable: true, defaultVisible: false, filterable: true },
      { key: "idp_code", labelKey: "entities.userProfile.fields.idp_code", type: "text", sortable: true, defaultVisible: true, sticky: true, filterable: true },
      { key: "display_name", labelKey: "entities.userProfile.fields.display_name", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "email", labelKey: "entities.userProfile.fields.email", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "avatar_color", labelKey: "entities.userProfile.fields.avatar_color", type: "color", sortable: false, defaultVisible: false, filterable: false },
      { key: "avatar_initials", labelKey: "entities.userProfile.fields.avatar_initials", type: "text", sortable: true, defaultVisible: false, filterable: true },
      { key: "idp_org", labelKey: "entities.userProfile.fields.idp_org", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "idp_username", labelKey: "entities.userProfile.fields.idp_username", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "is_active", labelKey: "entities.userProfile.fields.is_active", type: "boolean", sortable: true, defaultVisible: true, filterable: true },
      { key: "is_admin", labelKey: "entities.userProfile.fields.is_admin", type: "boolean", sortable: true, defaultVisible: true, filterable: true, tooltip: "entities.userProfile.hints.is_admin", tooltipPriority: "WARNING", tooltipTitle: "entities.userProfile.hints.is_admin_title", showFormTooltip: true, showListTooltip: true },
      { key: "is_verified", labelKey: "entities.userProfile.fields.is_verified", type: "boolean", sortable: true, defaultVisible: false, filterable: true, tooltip: "entities.userProfile.hints.is_verified", tooltipPriority: "HINT", tooltipTitle: "entities.userProfile.hints.is_verified_title", showFormTooltip: true, showListTooltip: true },
      { key: "email_verified", labelKey: "entities.userProfile.fields.email_verified", type: "boolean", sortable: true, defaultVisible: true, filterable: true, tooltip: "entities.userProfile.hints.email_verified", tooltipPriority: "HINT", tooltipTitle: "entities.userProfile.hints.email_verified_title", showFormTooltip: true, showListTooltip: true },
      { key: "roles", labelKey: "entities.userProfile.fields.roles", type: "text", sortable: false, defaultVisible: false, filterable: false },
      { key: "issuer", labelKey: "entities.userProfile.fields.issuer", type: "text", sortable: false, defaultVisible: false, filterable: true },
      { key: "last_synced_at", labelKey: "entities.userProfile.fields.last_synced_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_at", labelKey: "entities.userProfile.fields.created_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_by", labelKey: "entities.userProfile.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "updated_at", labelKey: "entities.userProfile.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "updated_by", labelKey: "entities.userProfile.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "version", labelKey: "entities.userProfile.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "deleted_at", labelKey: "entities.userProfile.fields.deleted_at", type: "datetime", sortable: true, defaultVisible: false, searchable: false },
      { key: "deleted_by", labelKey: "entities.userProfile.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
    ],
    stickyColumns: [
      { key: "uuid", labelKey: "entities.userProfile.fields.uuid", type: "text", sortable: true, defaultVisible: false, filterable: true },
      { key: "idp_code", labelKey: "entities.userProfile.fields.idp_code", type: "text", sortable: true, defaultVisible: true, sticky: true, filterable: true },
    ],
    auditingColumns: [
      { key: "deleted_at", labelKey: "entities.userProfile.fields.deleted_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "deleted_by", labelKey: "entities.userProfile.fields.deleted_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "updated_at", labelKey: "entities.userProfile.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "updated_by", labelKey: "entities.userProfile.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "last_synced_at", labelKey: "entities.userProfile.fields.last_synced_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_at", labelKey: "entities.userProfile.fields.created_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "created_by", labelKey: "entities.userProfile.fields.created_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
      { key: "version", labelKey: "entities.userProfile.fields.version", type: "text", sortable: false, defaultVisible: false, searchable: false },
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
      customActions: [
        {
          actionName: "changePassword",
          translationKey: "shell.settings.users.changePassword",
          icon: "key-round",
          textColor: "",
          disabledWhenDeleted: true,
          requiredPermission: "AUTHENTICATED_ADMIN",
        },
      ],
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
