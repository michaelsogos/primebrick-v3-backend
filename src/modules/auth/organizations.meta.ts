/**
 * `organization` entity metadata — the JSON returned by
 * `GET /api/v1/entities/organization/meta`.
 *
 * Pure data, no logic. Canonical `EntityMeta` shape (see
 * `src/http/entity-meta.types.ts`). `display_name` is omitted —
 * `assembleMeta` materializes it as `"${display_name}"` from `display_field`.
 */
import type { EntityMeta } from "../../http/entity-meta.types.js";

export const organizationMeta: EntityMeta = {
  entity: "organization",
  translation_key: "organization",
  title_key: "system.entities.organization.title",
  uid: "uuid",
  display_field: "display_name",
  columns: [
    { key: "display_name", label_key: "system.entities.organization.fields.display_name", type: "text", order: 0, sortable: true, default_visible: true, sticky: true, hideable: false, filterable: true },
    { key: "uuid", label_key: "system.entities.organization.fields.uuid", type: "text", order: -1, sortable: true, default_visible: false, sticky: true, filterable: true },
    { key: "idp_code", label_key: "system.entities.organization.fields.idp_code", type: "text", order: 2, sortable: true, default_visible: false, filterable: true },
    { key: "website_url", label_key: "system.entities.organization.fields.website_url", type: "text", order: 3, sortable: true, default_visible: true, filterable: true },
    { key: "user_count", label_key: "system.entities.organization.fields.user_count", type: "number", order: 4, sortable: false, default_visible: true },
    { key: "created_at", label_key: "system.entities.organization.fields.created_at", type: "datetime", order: 5, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "created_by", label_key: "system.entities.organization.fields.created_by", type: "text", order: 6, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "updated_at", label_key: "system.entities.organization.fields.updated_at", type: "datetime", order: 7, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "updated_by", label_key: "system.entities.organization.fields.updated_by", type: "text", order: 8, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "last_synced_at", label_key: "system.entities.organization.fields.last_synced_at", type: "datetime", order: 9, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "version", label_key: "system.entities.organization.fields.version", type: "text", order: 10, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "deleted_at", label_key: "system.entities.organization.fields.deleted_at", type: "datetime", order: 11, sortable: true, default_visible: false, searchable: false, audited: true },
    { key: "deleted_by", label_key: "system.entities.organization.fields.deleted_by", type: "text", order: 12, sortable: false, default_visible: false, searchable: false, audited: true },
  ],
  table: {
    default_view: "table",
    default_sort: { key: "created_at", dir: "desc" },
    default_page_size: 25,
    page_size_options: [10, 25, 50, 100],
  },
};
