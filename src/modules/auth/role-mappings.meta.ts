/**
 * `role_mappings` entity metadata — the JSON returned by
 * `GET /api/v1/entities/role_mapping/meta`.
 *
 * Pure data, no logic. Canonical `EntityMeta` shape (see
 * `src/http/entity-meta.types.ts`).
 *
 * NOTE: `role_mappings` uses HARD DELETE only (no `deleted_at`/`deleted_by`
 * columns). Rationale: Casdoor role deletion is irreversible — there is no
 * Casdoor "restore role" API. Soft-deleting locally + restoring would create
 * IDP drift. Restore ops therefore appear as `enabled: false` in `actions`
 * (no restore routes are registered).
 */
import type { EntityMeta } from "../../http/entity-meta.types.js";

export const roleMappingsMeta: EntityMeta = {
  entity: "role_mapping",
  translation_key: "role_mapping",
  title_key: "system.entities.role_mapping.title",
  uid: "uuid",
  display_field: "idp_role",
  columns: [
    { key: "idp_role", label_key: "system.entities.role_mapping.fields.idp_role", type: "text", order: 0, sortable: true, default_visible: true, sticky: true, hideable: false, filterable: true },
    { key: "uuid", label_key: "system.entities.role_mapping.fields.uuid", type: "text", order: -1, sortable: true, default_visible: false, sticky: true, filterable: true },
    { key: "idp_org", label_key: "system.entities.role_mapping.fields.idp_org", type: "text", order: 2, sortable: true, default_visible: true, filterable: true },
    { key: "label_key", label_key: "system.entities.role_mapping.fields.label_key", type: "text", order: 3, sortable: true, default_visible: true, filterable: true },
    { key: "is_admin", label_key: "system.entities.role_mapping.fields.is_admin", type: "badge", order: 4, sortable: true, default_visible: true, filterable: true },
    { key: "permissions", label_key: "system.entities.role_mapping.fields.permissions", type: "text", order: 5, sortable: false, default_visible: true, searchable: false },
    { key: "last_synced_at", label_key: "system.entities.role_mapping.fields.last_synced_at", type: "datetime", order: 6, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "created_at", label_key: "system.entities.role_mapping.fields.created_at", type: "datetime", order: 7, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "created_by", label_key: "system.entities.role_mapping.fields.created_by", type: "text", order: 8, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "updated_at", label_key: "system.entities.role_mapping.fields.updated_at", type: "datetime", order: 9, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "updated_by", label_key: "system.entities.role_mapping.fields.updated_by", type: "text", order: 10, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "version", label_key: "system.entities.role_mapping.fields.version", type: "text", order: 11, sortable: false, default_visible: false, searchable: false, audited: true },
  ],
  table: {
    default_view: "table",
    default_sort: { key: "idp_role", dir: "asc" },
    default_page_size: 25,
    page_size_options: [10, 25, 50, 100],
  },
};
