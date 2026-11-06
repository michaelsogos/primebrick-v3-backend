-- Primebrick: i18n key for the horizontal-scroll hint in the
-- EntityListTable footer keyboard legend.
--
-- `system.entities.list.keys.scroll` labels the ← → binding — the arrows
-- scroll the table horizontally when the preview panel is closed (they
-- navigate records only while the preview is open). It belongs to
-- `system.translations`, the system module's own namespace, like the
-- sibling keys.* labels from 20261118010000.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.list.keys.scroll', 'en-GB', 'Scroll', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.scroll', 'en-US', 'Scroll', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.scroll', 'it-IT', 'Scorri', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.scroll', 'de-DE', 'Scrollen', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.scroll', 'fr-FR', 'Faire défiler', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.scroll', 'es-ES', 'Desplazar', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.scroll', 'pt-PT', 'Deslocar', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
