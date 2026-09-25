/**
 * `config_entries` entity metadata — the JSON returned by
 * `GET /api/v1/entities/config_entry/meta`.
 *
 * The config list UI is NOT a standard EntityListTable — it renders a list of
 * rows with title/description on the left, a dynamic input in the center, and
 * a delete CTA on the right. `table` is therefore omitted.
 *
 * `type_capabilities` is the canonical per-type capability matrix owned by
 * `@primebrick/sdk` (`TYPE_CAPABILITIES`): it declares which `type_config`
 * props apply to each `ConfigType` (validation bounds semantics, regex,
 * unsigned, widget-level props). The FE uses it to render the right-column
 * form dynamically and to scope the Smart JSON config assistant topics.
 */
import { TYPE_CAPABILITIES } from "@primebrick/sdk";
import type { ConfigEntryMeta } from "../../http/entity-meta.types.js";

export const configEntriesMeta: ConfigEntryMeta = {
  entity: "config_entry",
  translation_key: "config_entry",
  title_key: "system.settings.configurations.title",
  uid: "uuid",
  display_field: "key",
  type_capabilities: TYPE_CAPABILITIES,
  columns: [
    // uuid is the canonical first sticky column (order -1), hidden but selectable
    { key: "uuid", label_key: "system.entities.config_entry.fields.uuid", type: "text", order: -1, sortable: true, default_visible: false, sticky: true, filterable: true },
    { key: "key", label_key: "system.entities.config_entry.fields.key", type: "text", order: 0, sortable: true, default_visible: true, filterable: true },
    { key: "value", label_key: "system.entities.config_entry.fields.value", type: "text", order: 1, sortable: false, default_visible: true, filterable: false, searchable: false },
    { key: "type", label_key: "system.entities.config_entry.fields.type", type: "text", order: 2, sortable: true, default_visible: true, filterable: true },
    { key: "reserved", label_key: "system.entities.config_entry.fields.reserved", type: "boolean", order: 3, sortable: true, default_visible: true, filterable: true },
    { key: "updated_at", label_key: "system.entities.config_entry.fields.updated_at", type: "datetime", order: 4, sortable: true, default_visible: false, filterable: true, audited: true },
    { key: "updated_by", label_key: "system.entities.config_entry.fields.updated_by", type: "text", order: 5, sortable: false, default_visible: false, searchable: false, audited: true },
  ],
};
