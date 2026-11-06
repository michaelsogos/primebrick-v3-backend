-- 20261120040000_kbd_move_selector_label.sql
--
-- ELT footer keyboard legend — ↑↓ moves the row selector (the focused-row
-- cursor), so the hint label reads "Sposta selettore" / "Move selector",
-- not the generic "Sposta"/"Move". Key stays
-- `system.entities.list.keys.move` (it names the binding, not the copy).

UPDATE system.translations
SET value = 'Move selector',
    updated_at = now(),
    updated_by = 'migration-20261120040000'
WHERE key = 'system.entities.list.keys.move'
  AND language IN ('en-GB', 'en-US')
  AND deleted_at IS NULL;

UPDATE system.translations
SET value = 'Sposta selettore',
    updated_at = now(),
    updated_by = 'migration-20261120040000'
WHERE key = 'system.entities.list.keys.move'
  AND language = 'it-IT'
  AND deleted_at IS NULL;

UPDATE system.translations
SET value = 'Déplacer le sélecteur',
    updated_at = now(),
    updated_by = 'migration-20261120040000'
WHERE key = 'system.entities.list.keys.move'
  AND language = 'fr-FR'
  AND deleted_at IS NULL;

UPDATE system.translations
SET value = 'Mover selector',
    updated_at = now(),
    updated_by = 'migration-20261120040000'
WHERE key = 'system.entities.list.keys.move'
  AND language = 'es-ES'
  AND deleted_at IS NULL;

UPDATE system.translations
SET value = 'Selektor verschieben',
    updated_at = now(),
    updated_by = 'migration-20261120040000'
WHERE key = 'system.entities.list.keys.move'
  AND language = 'de-DE'
  AND deleted_at IS NULL;

UPDATE system.translations
SET value = 'Mover seletor',
    updated_at = now(),
    updated_by = 'migration-20261120040000'
WHERE key = 'system.entities.list.keys.move'
  AND language = 'pt-PT'
  AND deleted_at IS NULL;
