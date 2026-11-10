-- Patch: IANA fields sheet — CTA label + panel title
--
-- The card-view sub-toolbar's per-column IANA switches moved into the
-- `entity.datetimeIana` sheet panel (bounded horizontal space). Two keys:
-- the toolbar CTA label and the sheet title — same wording by design.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.list.datetime_iana.fields_cta', 'en-GB', 'IANA Fields', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.fields_cta', 'en-US', 'IANA Fields', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.fields_cta', 'it-IT', 'Campi IANA', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.fields_cta', 'de-DE', 'IANA-Felder', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.fields_cta', 'fr-FR', 'Champs IANA', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.fields_cta', 'es-ES', 'Campos IANA', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.fields_cta', 'pt-PT', 'Campos IANA', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.title', 'en-GB', 'IANA Fields', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.title', 'en-US', 'IANA Fields', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.title', 'it-IT', 'Campi IANA', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.title', 'de-DE', 'IANA-Felder', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.title', 'fr-FR', 'Champs IANA', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.title', 'es-ES', 'Campos IANA', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.title', 'pt-PT', 'Campos IANA', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_browser', 'en-GB', 'Browser', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_browser', 'en-US', 'Browser', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_browser', 'it-IT', 'Browser', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_browser', 'de-DE', 'Browser', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_browser', 'fr-FR', 'Navigateur', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_browser', 'es-ES', 'Navegador', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_browser', 'pt-PT', 'Navegador', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_record', 'en-GB', 'Row', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_record', 'en-US', 'Row', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_record', 'it-IT', 'Riga', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_record', 'de-DE', 'Zeile', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_record', 'fr-FR', 'Ligne', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_record', 'es-ES', 'Fila', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1),
  ('system.entities.list.datetime_iana.mode_record', 'pt-PT', 'Linha', now(), 'migration-datetime-iana-sheet', now(), 'migration-datetime-iana-sheet', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
