/**
 * `client_registry` entity metadata — the JSON returned by
 * `GET /api/v1/entities/client_registry/meta`.
 *
 * `client_key_hash` is intentionally NOT a column: it is a write-only
 * secret derivative — it must never be displayed or edited directly.
 */
import type { EntityMeta } from "../../http/entity-meta.types.js";

export const clientRegistryMeta: EntityMeta = {
  entity: "client_registry",
  translation_key: "client_registry",
  uid: "uuid",
  display_field: "ua_prefix",
  columns: [
    { key: "ua_prefix", label_key: "system.entities.client_registry.fields.ua_prefix", type: "text", order: 0, sortable: true, default_visible: true, sticky: true, hideable: false, filterable: true, searchable: true },
    { key: "uuid", label_key: "system.entities.client_registry.fields.uuid", type: "text", order: -1, sortable: true, default_visible: false, sticky: true, filterable: true },
    { key: "source", label_key: "system.entities.client_registry.fields.source", type: "text", order: 2, sortable: true, default_visible: true, filterable: true },
    { key: "key_mode", label_key: "system.entities.client_registry.fields.key_mode", type: "text", order: 2.5, sortable: true, default_visible: true, filterable: true },
    { key: "key_generation", label_key: "system.entities.client_registry.fields.key_generation", type: "text", order: 2.6, sortable: true, default_visible: false, filterable: true },
    { key: "key_rotated_at", label_key: "system.entities.client_registry.fields.key_rotated_at", type: "datetime", order: 2.7, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "is_enabled", label_key: "system.entities.client_registry.fields.is_enabled", type: "boolean", order: 3, sortable: true, default_visible: true, filterable: true },
    { key: "created_at", label_key: "system.entities.client_registry.fields.created_at", type: "datetime", order: 4, sortable: true, default_visible: true, filterable: true, audited: true },
    { key: "created_by", label_key: "system.entities.client_registry.fields.created_by", type: "text", order: 5, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "updated_at", label_key: "system.entities.client_registry.fields.updated_at", type: "datetime", order: 6, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "updated_by", label_key: "system.entities.client_registry.fields.updated_by", type: "text", order: 7, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "version", label_key: "system.entities.client_registry.fields.version", type: "text", order: 8, sortable: false, default_visible: false, searchable: false, audited: true },
    { key: "deleted_at", label_key: "system.entities.client_registry.fields.deleted_at", type: "datetime", order: 9, sortable: true, default_visible: false, searchable: false, audited: true },
    { key: "deleted_by", label_key: "system.entities.client_registry.fields.deleted_by", type: "text", order: 10, sortable: false, default_visible: false, searchable: false, audited: true },
  ],
  table: {
    default_view: "table",
    default_sort: { key: "created_at", dir: "desc" },
    default_page_size: 25,
    page_size_options: [10, 25, 50, 100],
  },
};
