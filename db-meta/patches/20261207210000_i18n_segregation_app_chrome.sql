-- Primebrick: i18n segregation — first app.* shared-chrome seeds.
-- `app.entities.list.no_records` copies the live `system.entities.list.no_records`
-- values ×7 — it opens the `app.entities.list.*` family the phase-2 chrome
-- migration will complete (system.* is BE-domain; app.* is the shared public
-- vocabulary modules may cite).
-- `app.common.restore_failed` is authored ×7 mirroring `app.common.delete_failed`'s
-- register — the cited `system.entities.list.restoreFailed` never existed
-- (dead camelCase ref), so there is nothing to copy.
-- All 7 supported languages.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.entities.list.no_records', 'en-GB', 'No records', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.entities.list.no_records', 'en-US', 'No records', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.entities.list.no_records', 'it-IT', 'Nessun record', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.entities.list.no_records', 'fr-FR', 'Aucun enregistrement', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.entities.list.no_records', 'es-ES', 'Sin registros', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.entities.list.no_records', 'de-DE', 'Keine Datensätze', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.entities.list.no_records', 'pt-PT', 'Sem registos', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.common.restore_failed', 'en-GB', 'Failed to restore', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.common.restore_failed', 'en-US', 'Failed to restore', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.common.restore_failed', 'it-IT', 'Ripristino fallito', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.common.restore_failed', 'fr-FR', 'Échec de la restauration', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.common.restore_failed', 'es-ES', 'Error al restaurar', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.common.restore_failed', 'de-DE', 'Wiederherstellen fehlgeschlagen', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1),
  (uuidv7(), 'app.common.restore_failed', 'pt-PT', 'Falha ao restaurar', now(), 'migration-i18n-segregation-app-chrome', now(), 'migration-i18n-segregation-app-chrome', 1);
