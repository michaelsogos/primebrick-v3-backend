/**
 * `user_profiles` entity metadata — the JSON returned by
 * `GET /api/v1/entities/user_profile/meta`.
 *
 * Pure data, no logic. Canonical `EntityMeta` shape (see
 * `src/http/entity-meta.types.ts`): root `columns` dictionary +
 * `table` options. `display_name` is omitted — `assembleMeta` materializes
 * it as `"${display_name}"` from `display_field`.
 */
import type { EntityMeta } from "../../http/entity-meta.types.js";

export const userProfileMeta: EntityMeta = {
  entity: "user_profile",
  translation_key: "user_profile",
  title_key: "system.entities.user_profile.title",
  uid: "uuid",
  display_field: "display_name",
  columns: [
    { key: "display_name", label_key: "system.entities.user_profile.fields.display_name", type: "text", order: 0, sortable: true, default_visible: true, sticky: true, hideable: false, filterable: true },
    { key: "uuid", label_key: "system.entities.user_profile.fields.uuid", type: "text", order: -1, sortable: true, default_visible: false, sticky: true, filterable: true },
    { key: "idp_code", label_key: "system.entities.user_profile.fields.idp_code", type: "text", order: 2, sortable: true, default_visible: false, filterable: true },
    { key: "email", label_key: "system.entities.user_profile.fields.email", type: "text", order: 3, sortable: true, default_visible: true, filterable: true },
    { key: "avatar_color", label_key: "system.entities.user_profile.fields.avatar_color", type: "color", order: 4, sortable: false, default_visible: false, filterable: false },
    { key: "avatar_initials", label_key: "system.entities.user_profile.fields.avatar_initials", type: "text", order: 5, sortable: true, default_visible: false, filterable: true },
    { key: "idp_org", label_key: "system.entities.user_profile.fields.idp_org", type: "text", order: 6, sortable: true, default_visible: true, filterable: true },
    { key: "idp_username", label_key: "system.entities.user_profile.fields.idp_username", type: "text", order: 7, sortable: true, default_visible: true, filterable: true },
    { key: "is_active", label_key: "system.entities.user_profile.fields.is_active", type: "boolean", order: 8, sortable: true, default_visible: true, filterable: true },
    { key: "is_admin", label_key: "system.entities.user_profile.fields.is_admin", type: "boolean", order: 9, sortable: true, default_visible: true, filterable: true, tooltip: "system.entities.user_profile.hints.is_admin", tooltip_priority: "WARNING", tooltip_title: "system.entities.user_profile.hints.is_admin_title", show_form_tooltip: true, show_list_tooltip: true },
    { key: "is_verified", label_key: "system.entities.user_profile.fields.is_verified", type: "boolean", order: 10, sortable: true, default_visible: false, filterable: true, tooltip: "system.entities.user_profile.hints.is_verified", tooltip_priority: "HINT", tooltip_title: "system.entities.user_profile.hints.is_verified_title", show_form_tooltip: true, show_list_tooltip: true },
    { key: "email_verified", label_key: "system.entities.user_profile.fields.email_verified", type: "boolean", order: 11, sortable: true, default_visible: true, filterable: true, tooltip: "system.entities.user_profile.hints.email_verified", tooltip_priority: "HINT", tooltip_title: "system.entities.user_profile.hints.email_verified_title", show_form_tooltip: true, show_list_tooltip: true },
    { key: "roles", label_key: "system.entities.user_profile.fields.roles", type: "text", order: 12, sortable: false, default_visible: false, filterable: false, searchable: false },
    { key: "issuer", label_key: "system.entities.user_profile.fields.issuer", type: "text", order: 13, sortable: false, default_visible: false, filterable: true },
    { key: "last_synced_at", label_key: "system.entities.user_profile.fields.last_synced_at", type: "datetime", order: 14, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "created_at", label_key: "system.entities.user_profile.fields.created_at", type: "datetime", order: 15, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "created_by", label_key: "system.entities.user_profile.fields.created_by", type: "text", order: 16, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "updated_at", label_key: "system.entities.user_profile.fields.updated_at", type: "datetime", order: 17, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "updated_by", label_key: "system.entities.user_profile.fields.updated_by", type: "text", order: 18, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "version", label_key: "system.entities.user_profile.fields.version", type: "text", order: 19, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "deleted_at", label_key: "system.entities.user_profile.fields.deleted_at", type: "datetime", order: 20, sortable: true, default_visible: false, searchable: false, audited: true },
    { key: "deleted_by", label_key: "system.entities.user_profile.fields.deleted_by", type: "text", order: 21, sortable: false, default_visible: false, searchable: false, audited: true },
  ],
  table: {
    default_view: "table",
    default_sort: { key: "created_at", dir: "desc" },
    default_page_size: 25,
    page_size_options: [10, 25, 50, 100],
    row_custom_actions: [
      {
        action_name: "change_password",
        translation_key: "system.settings.users.changePassword",
        icon: "key-round",
        text_color: "",
        disabled_when_deleted: true,
        required_permission: "AUTHENTICATED_ADMIN",
      },
    ],
  },
};
