-- 20261120060000_kbd_legend_trigger.sql
--
-- ELT footer keyboard legend — the inline legend row is replaced by a
-- compact trigger (keyboard icon + label) that toggles a popover listing
-- all the hints. `keyboardCommands` is the trigger label.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('system.entities.list.keyboardCommands', 'en-GB', 'Keyboard commands', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keyboardCommands', 'en-US', 'Keyboard commands', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keyboardCommands', 'it-IT', 'Comandi da tastiera', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keyboardCommands', 'de-DE', 'Tastaturbefehle', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keyboardCommands', 'fr-FR', 'Commandes clavier', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keyboardCommands', 'es-ES', 'Comandos de teclado', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keyboardCommands', 'pt-PT', 'Comandos de teclado', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
