-- 20261120020000_kbd_legend_enter_menu_label.sql
--
-- ELT footer keyboard legend — Enter opens the row ACTIONS MENU, so the
-- hint label reads "Menu" (what it opens), not "Azioni". Key stays
-- `system.entities.list.keys.actions` (it names the binding, not the copy).
--
-- Also soft-deletes `system.entities.list.keys.preview` — dead key: the
-- ←→ hint was relabelled `keys.scroll` (20261120010000) and nothing
-- references it anymore.

UPDATE system.translations
SET value = 'Menu',
    updated_at = now(),
    updated_by = 'migration-20261120020000'
WHERE key = 'system.entities.list.keys.actions'
  AND language IN ('en-GB', 'en-US', 'it-IT', 'fr-FR', 'pt-PT')
  AND deleted_at IS NULL;

UPDATE system.translations
SET value = 'Menü',
    updated_at = now(),
    updated_by = 'migration-20261120020000'
WHERE key = 'system.entities.list.keys.actions'
  AND language = 'de-DE'
  AND deleted_at IS NULL;

UPDATE system.translations
SET value = 'Menú',
    updated_at = now(),
    updated_by = 'migration-20261120020000'
WHERE key = 'system.entities.list.keys.actions'
  AND language = 'es-ES'
  AND deleted_at IS NULL;

UPDATE system.translations
SET deleted_at = now(),
    deleted_by = 'migration-20261120020000'
WHERE key = 'system.entities.list.keys.preview'
  AND deleted_at IS NULL;
