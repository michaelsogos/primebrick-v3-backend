/**
 * `client_registry` entity metadata — the JSON returned by
 * `GET /api/v1/entities/client_registry/meta`.
 *
 * `client_key_hash` is intentionally NOT a column: it is a write-only
 * secret derivative — it must never be displayed or edited directly.
 */
import { withColumnConstraints } from "@primebrick/dal-pg";
import type { EntityMeta } from "../../http/entity-meta.types.js";
import { ClientShieldRegistryEntity } from "./client_shield_registry_entity.js";

export const clientRegistryMeta: EntityMeta = withColumnConstraints({
  entity: "client_registry",
  translation_key: "client_registry",
  uid: "uuid",
  display_field: "ua_prefix",
  columns: [
    { key: "ua_prefix", label_key: "system.entities.client_registry.fields.ua_prefix", type: "text", format: "no_space", order: 0, default_visible: true, sticky: true, hideable: false },
    // uuid stays declared only to override filterable (derived uid default is false)
    { key: "uuid", label_key: "system.common.fields.uuid", type: "text", order: -1, default_visible: false, sticky: true },
    { key: "source", label_key: "system.entities.client_registry.fields.source", type: "text", order: 2, default_visible: true },
    { key: "key_mode", label_key: "system.entities.client_registry.fields.key_mode", type: "text", order: 2.5, default_visible: true },
    { key: "key_generation", label_key: "system.entities.client_registry.fields.key_generation", type: "text", order: 2.6, default_visible: false },
    { key: "key_rotated_at", label_key: "system.entities.client_registry.fields.key_rotated_at", type: "datetime", order: 2.7, default_visible: false, audited: true },
    { key: "is_enabled", label_key: "system.entities.client_registry.fields.is_enabled", type: "boolean", order: 3, default_visible: true },
    // created_at stays declared only to override default_visible (derived default is false)
    { key: "created_at", label_key: "system.common.fields.created_at", type: "datetime", order: 4, default_visible: true },
  ],
  table: {
    default_view: "table",
    default_sort: { key: "created_at", dir: "desc" },
    default_page_size: 25,
    page_size_options: [10, 25, 50, 100],
  },
}, ClientShieldRegistryEntity);
