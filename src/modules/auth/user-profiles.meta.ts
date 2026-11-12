/**
 * `user_profiles` entity metadata — the JSON returned by
 * `GET /api/v1/entities/user_profile/meta`.
 *
 * Pure data, no logic. Canonical `EntityMeta` shape (see
 * `src/http/entity-meta.types.ts`): root `columns` dictionary +
 * `table` options. `display_name` is omitted — `assembleMeta` materializes
 * it as `"${display_name}"` from `display_field`.
 */
import { withColumnConstraints } from "@primebrick/dal-pg";
import type { EntityMeta } from "../../http/entity-meta.types.js";
import { UserProfileEntity } from "./user_profile_entity.js";

export const userProfileMeta: EntityMeta = withColumnConstraints({
  entity: "user_profile",
  translation_key: "user_profile",
  uid: "uuid",
  display_field: "display_name",
  columns: [
    { key: "display_name", label_key: "system.entities.user_profile.fields.display_name", type: "text", order: 0, default_visible: true, sticky: true, hideable: false },
    // uuid stays declared only to override filterable (derived uid default is false)
    { key: "uuid", label_key: "system.common.fields.uuid", type: "text", order: -1, default_visible: false, sticky: true },
    { key: "idp_code", label_key: "system.entities.user_profile.fields.idp_code", type: "text", order: 2, default_visible: false, immutable: true },
    { key: "email", label_key: "system.entities.user_profile.fields.email", type: "text", order: 3, default_visible: true },
    { key: "avatar_color", label_key: "system.entities.user_profile.fields.avatar_color", type: "color", order: 4, sortable: false, default_visible: false, filterable: false },
    { key: "avatar_initials", label_key: "system.entities.user_profile.fields.avatar_initials", type: "avatar", order: 5, default_visible: false, immutable: true, avatar: { color_field: "avatar_color", initials_field: "display_name" } },
    { key: "idp_org", label_key: "system.entities.user_profile.fields.idp_org", type: "text", order: 6, default_visible: true, immutable: true },
    { key: "idp_username", label_key: "system.entities.user_profile.fields.idp_username", type: "text", order: 7, default_visible: true, immutable: true },
    { key: "idp_is_admin", label_key: "system.entities.user_profile.fields.is_admin", type: "boolean", order: 9, default_visible: true, tooltip: "system.entities.user_profile.hints.is_admin", tooltip_priority: "WARNING", tooltip_title: "system.entities.user_profile.hints.is_admin_title", show_form_tooltip: true, show_list_tooltip: true },
    { key: "idp_is_verified", label_key: "system.entities.user_profile.fields.is_verified", type: "boolean", order: 10, default_visible: false, immutable: true, tooltip: "system.entities.user_profile.hints.is_verified", tooltip_priority: "HINT", tooltip_title: "system.entities.user_profile.hints.is_verified_title", show_form_tooltip: true, show_list_tooltip: true },
    { key: "idp_email_verified", label_key: "system.entities.user_profile.fields.email_verified", type: "boolean", order: 11, default_visible: true, immutable: true, tooltip: "system.entities.user_profile.hints.email_verified", tooltip_priority: "HINT", tooltip_title: "system.entities.user_profile.hints.email_verified_title", show_form_tooltip: true, show_list_tooltip: true },
    { key: "roles", label_key: "system.entities.user_profile.fields.roles", type: "text", order: 12, sortable: false, default_visible: false, filterable: false, searchable: false, options_source: "system.roles" },
    { key: "idp_issuer", label_key: "system.entities.user_profile.fields.issuer", type: "text", order: 13, sortable: false, default_visible: false, immutable: true },
    { key: "last_synced_at", label_key: "system.entities.user_profile.fields.last_synced_at", type: "datetime", order: 14, default_visible: false, audited: true },
    { key: "auth_method_enforcer_dismissed", label_key: "system.entities.user_profile.fields.auth_method_enforcer_dismissed", type: "boolean", order: 15, default_visible: false },
    { key: "onboarding_completed", label_key: "system.entities.user_profile.fields.onboarding_completed", type: "boolean", order: 16, default_visible: false, immutable: true },
    { key: "suspended", label_key: "system.entities.user_profile.fields.suspended", type: "boolean", order: 17, kind: "calculated", default_visible: true },
    { key: "suspended_at", label_key: "system.entities.user_profile.fields.suspended_at", type: "datetime", order: 18, default_visible: false, audited: true },
    { key: "suspended_by", label_key: "system.entities.user_profile.fields.suspended_by", type: "ref", order: 19, default_visible: false, audited: true, ref: { entity: "user_profile" } },
  ],
  table: {
    default_view: "table",
    default_sort: { key: "created_at", dir: "desc" },
    default_page_size: 25,
    page_size_options: [10, 25, 50, 100],
    row_custom_actions: [
      {
        action_name: "change_password",
        translation_key: "system.settings.users.change_password",
        icon: "key-round",
        disabled_when_deleted: true,
        required_permission: "AUTHENTICATED_ADMIN",
      },
      {
        action_name: "suspend",
        translation_key: "system.settings.users.suspend",
        icon: "pause",
        disabled_when_deleted: true,
        required_permission: "AUTHENTICATED_ADMIN",
        visible_on: { field: "suspended", values: [false] },
      },
      {
        action_name: "reactivate",
        translation_key: "system.settings.users.reactivate",
        icon: "play",
        disabled_when_deleted: true,
        required_permission: "AUTHENTICATED_ADMIN",
        visible_on: { field: "suspended", values: [true] },
      },
    ],
  },
}, UserProfileEntity);
