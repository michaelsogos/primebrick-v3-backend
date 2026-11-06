-- 20261120030000_kbd_legend_paging_keys.sql
--
-- ELT footer keyboard legend — two new hint labels for the pager keys:
--   PgUp/PgDn → prev/next page (same as the single-arrow footer buttons)
--   Home/End  → first/last page (same as the double-arrow footer buttons)
-- `keys.page` labels the PgUp/PgDn group, `keys.firstLast` the Home/End one.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('system.entities.list.keys.page', 'en-GB', 'Page', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.page', 'en-US', 'Page', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.page', 'it-IT', 'Pagina', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.page', 'de-DE', 'Seite', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.page', 'fr-FR', 'Page', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.page', 'es-ES', 'Página', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.page', 'pt-PT', 'Página', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.firstLast', 'en-GB', 'First/last', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.firstLast', 'en-US', 'First/last', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.firstLast', 'it-IT', 'Prima/ultima', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.firstLast', 'de-DE', 'Erste/letzte', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.firstLast', 'fr-FR', 'Première/dernière', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.firstLast', 'es-ES', 'Primera/última', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.firstLast', 'pt-PT', 'Primeira/última', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
