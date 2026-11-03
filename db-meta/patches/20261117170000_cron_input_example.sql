-- CronInput: "e.g." prefix for the active-field example line, 7 locales.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.cron_input.hint.example', 'it-IT', 'es.', now(), 'migration-cron-input-example', now(), 'migration-cron-input-example', 1),
  ('app.widgets.cron_input.hint.example', 'en-GB', 'e.g.', now(), 'migration-cron-input-example', now(), 'migration-cron-input-example', 1),
  ('app.widgets.cron_input.hint.example', 'en-US', 'e.g.', now(), 'migration-cron-input-example', now(), 'migration-cron-input-example', 1),
  ('app.widgets.cron_input.hint.example', 'de-DE', 'z. B.', now(), 'migration-cron-input-example', now(), 'migration-cron-input-example', 1),
  ('app.widgets.cron_input.hint.example', 'fr-FR', 'ex.', now(), 'migration-cron-input-example', now(), 'migration-cron-input-example', 1),
  ('app.widgets.cron_input.hint.example', 'es-ES', 'ej.', now(), 'migration-cron-input-example', now(), 'migration-cron-input-example', 1),
  ('app.widgets.cron_input.hint.example', 'pt-PT', 'ex.', now(), 'migration-cron-input-example', now(), 'migration-cron-input-example', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;
