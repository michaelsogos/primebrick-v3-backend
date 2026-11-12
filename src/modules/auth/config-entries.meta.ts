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
import { withColumnConstraints } from "@primebrick/dal-pg";
import type { ConfigEntryMeta } from "../../http/entity-meta.types.js";
import { ConfigEntryEntity } from "./config_entry_entity.js";

export const configEntriesMeta: ConfigEntryMeta = withColumnConstraints({
  entity: "config_entry",
  translation_key: "config_entry",
  title_key: "system.settings.configurations.title",
  uid: "uuid",
  display_field: "key",
  type_capabilities: TYPE_CAPABILITIES,
  columns: [
    // uuid stays declared only to override filterable (derived uid default is false)
    { key: "uuid", label_key: "system.common.fields.uuid", type: "text", order: -1, default_visible: false, sticky: true },
    { key: "key", label_key: "system.entities.config_entry.fields.key", type: "text", format: "snake_key", order: 0, default_visible: true },
    { key: "value", label_key: "system.entities.config_entry.fields.value", type: "text", order: 1, sortable: false, default_visible: true, filterable: false, searchable: false },
    { key: "type", label_key: "system.entities.config_entry.fields.type", type: "text", order: 2, default_visible: true },
    { key: "reserved", label_key: "system.entities.config_entry.fields.reserved", type: "boolean", order: 3, default_visible: true },
  ],
}, ConfigEntryEntity);
