-- Primebrick: i18n keys for the canonical KeyboardHints legend and the
-- favorites "other" pseudo-group.
--
-- `system.entities.list.keys.*` labels the EntityListTable footer legend
-- (↑↓ move · Space select · ⏎ actions · ←→ preview · esc close) — they
-- belong to `system.translations`, the system module's own namespace.
-- `app.favorites.other` labels the pseudo-group of orphaned favorites in
-- the app launcher — an `app.*` key in `public.translations`.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.list.keys.move', 'en-GB', 'Move', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.move', 'en-US', 'Move', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.move', 'it-IT', 'Sposta', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.move', 'de-DE', 'Bewegen', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.move', 'fr-FR', 'Déplacer', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.move', 'es-ES', 'Mover', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.move', 'pt-PT', 'Mover', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.select', 'en-GB', 'Select', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.select', 'en-US', 'Select', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.select', 'it-IT', 'Seleziona', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.select', 'de-DE', 'Auswählen', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.select', 'fr-FR', 'Sélectionner', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.select', 'es-ES', 'Seleccionar', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.select', 'pt-PT', 'Selecionar', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.actions', 'en-GB', 'Actions', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.actions', 'en-US', 'Actions', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.actions', 'it-IT', 'Azioni', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.actions', 'de-DE', 'Aktionen', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.actions', 'fr-FR', 'Actions', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.actions', 'es-ES', 'Acciones', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.actions', 'pt-PT', 'Ações', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.preview', 'en-GB', 'Preview', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.preview', 'en-US', 'Preview', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.preview', 'it-IT', 'Anteprima', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.preview', 'de-DE', 'Vorschau', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.preview', 'fr-FR', 'Aperçu', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.preview', 'es-ES', 'Vista previa', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('system.entities.list.keys.preview', 'pt-PT', 'Pré-visualizar', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.favorites.other', 'en-GB', 'Other', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('app.favorites.other', 'en-US', 'Other', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('app.favorites.other', 'it-IT', 'Altri', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('app.favorites.other', 'de-DE', 'Sonstige', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('app.favorites.other', 'fr-FR', 'Autres', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('app.favorites.other', 'es-ES', 'Otros', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1),
  ('app.favorites.other', 'pt-PT', 'Outros', now(), 'migration-kbd-legend', now(), 'migration-kbd-legend', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
