-- ComboSelect async-loading UX (user-ratified 2026-11-26): the popover opens
-- immediately during the fetch — muted loading line + the animated scan strip.
-- One shared key for every combobox surface.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.loading_data', 'en-GB', 'Loading data…', now(), 'migration-combo-select-loading', now(), 'migration-combo-select-loading', 1),
  (uuidv7(), 'app.common.loading_data', 'en-US', 'Loading data…', now(), 'migration-combo-select-loading', now(), 'migration-combo-select-loading', 1),
  (uuidv7(), 'app.common.loading_data', 'it-IT', 'Caricamento dati…', now(), 'migration-combo-select-loading', now(), 'migration-combo-select-loading', 1),
  (uuidv7(), 'app.common.loading_data', 'fr-FR', 'Chargement des données…', now(), 'migration-combo-select-loading', now(), 'migration-combo-select-loading', 1),
  (uuidv7(), 'app.common.loading_data', 'es-ES', 'Cargando datos…', now(), 'migration-combo-select-loading', now(), 'migration-combo-select-loading', 1),
  (uuidv7(), 'app.common.loading_data', 'de-DE', 'Daten werden geladen…', now(), 'migration-combo-select-loading', now(), 'migration-combo-select-loading', 1),
  (uuidv7(), 'app.common.loading_data', 'pt-PT', 'A carregar dados…', now(), 'migration-combo-select-loading', now(), 'migration-combo-select-loading', 1);
