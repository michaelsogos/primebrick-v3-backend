-- Primebrick: app.remote_page.loading — the remote-mount loading state
-- label, missed by the error-panel patch (20261114004000). All 7
-- supported languages.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.remote_page.loading', 'en-GB', 'Loading page…', now(), 'migration-remote-page-loading', now(), 'migration-remote-page-loading', 1),
  (uuidv7(), 'app.remote_page.loading', 'en-US', 'Loading page…', now(), 'migration-remote-page-loading', now(), 'migration-remote-page-loading', 1),
  (uuidv7(), 'app.remote_page.loading', 'it-IT', 'Caricamento pagina…', now(), 'migration-remote-page-loading', now(), 'migration-remote-page-loading', 1),
  (uuidv7(), 'app.remote_page.loading', 'fr-FR', 'Chargement de la page…', now(), 'migration-remote-page-loading', now(), 'migration-remote-page-loading', 1),
  (uuidv7(), 'app.remote_page.loading', 'es-ES', 'Cargando página…', now(), 'migration-remote-page-loading', now(), 'migration-remote-page-loading', 1),
  (uuidv7(), 'app.remote_page.loading', 'de-DE', 'Seite wird geladen…', now(), 'migration-remote-page-loading', now(), 'migration-remote-page-loading', 1),
  (uuidv7(), 'app.remote_page.loading', 'pt-PT', 'A carregar página…', now(), 'migration-remote-page-loading', now(), 'migration-remote-page-loading', 1);
