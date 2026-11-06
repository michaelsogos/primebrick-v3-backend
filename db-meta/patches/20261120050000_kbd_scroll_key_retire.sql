-- 20261120050000_kbd_scroll_key_retire.sql
--
-- ELT footer keyboard legend — the four arrow keys now render as ONE hint
-- group (↑ ↓ ← →) under `keys.move` ("Sposta selettore"). The separate
-- `keys.scroll` label is dead: nothing references it anymore.

UPDATE system.translations
SET deleted_at = now(),
    deleted_by = 'migration-20261120050000'
WHERE key = 'system.entities.list.keys.scroll'
  AND deleted_at IS NULL;
