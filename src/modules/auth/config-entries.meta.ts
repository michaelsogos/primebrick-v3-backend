/**
 * `config_entries` entity metadata — the JSON returned by
 * `GET /api/v1/entities/config_entries/meta`.
 *
 * The config list UI is NOT a standard EntityListTable — it renders a list of
 * rows with title/description on the left, a dynamic input in the center, and
 * a delete CTA on the right. The meta here is minimal: it declares the entity
 * name, translation key, and the fields the FE needs for dynamic rendering.
 *
 * The per-row `type` / `type_config` / `label_key` / `description_key` /
 * `reserved` columns are returned by the `list` endpoint and drive the FE
 * widget selection directly — they are NOT part of this static meta.
 */
export const configEntriesMeta = {
  entity: "config_entries",
  translationKey: "config_entry",
  titleKey: "system.settings.security.title",
  uid: "uuid",
  list: {
    columns: [
      { key: "key", labelKey: "entities.config_entry.fields.key", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "value", labelKey: "entities.config_entry.fields.value", type: "text", sortable: false, defaultVisible: true, filterable: false },
      { key: "type", labelKey: "entities.config_entry.fields.type", type: "text", sortable: true, defaultVisible: true, filterable: true },
      { key: "reserved", labelKey: "entities.config_entry.fields.reserved", type: "boolean", sortable: true, defaultVisible: true, filterable: true },
      { key: "updated_at", labelKey: "entities.config_entry.fields.updated_at", type: "datetime", sortable: true, defaultVisible: false, filterable: true },
      { key: "updated_by", labelKey: "entities.config_entry.fields.updated_by", type: "text", sortable: false, defaultVisible: false, searchable: false },
    ],
    rowActions: {
      delete: true,
      edit: true,
    },
    enableCreateAction: false,
  },
};
