-- Primebrick: elt-preview-pane-i18n-cleanup — soft-deletes the six
-- `system.entities.list.*` keys that only the removed ELT preview pane
-- consumed (pane deleted in fe-v3 `037b451`: row dblclick now opens the
-- record's `kind:"detail"` census route in a new tab, the Columns3 header
-- CTA opens the same `entity.columns` sheet as the toolbar CTA).
-- `keys.scroll` is included — it was authored for the same legend surface
-- and nothing references it either.
-- `sticky_fields`/`data_fields`/`auditing_fields` are NOT touched — the
-- `entity.columns` sheet panel still renders them as section titles.

UPDATE system.translations
SET deleted_at = now(), deleted_by = 'migration-elt-preview-pane-cleanup', updated_at = now(), updated_by = 'migration-elt-preview-pane-cleanup', version = version + 1
WHERE key IN (
  'system.entities.list.preview',
  'system.entities.list.preview_panel_title',
  'system.entities.list.edit_mode_label',
  'system.entities.list.toggle_preview_panel',
  'system.entities.list.keys.preview',
  'system.entities.list.keys.scroll'
) AND deleted_at IS NULL;
