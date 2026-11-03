-- CronInput segmented editor: "next runs" preview label, 7 locales.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.cron_input.hint.next', 'it-IT', 'prossime esecuzioni', now(), 'migration-cron-input-next', now(), 'migration-cron-input-next', 1),
  ('app.widgets.cron_input.hint.next', 'en-GB', 'next runs', now(), 'migration-cron-input-next', now(), 'migration-cron-input-next', 1),
  ('app.widgets.cron_input.hint.next', 'en-US', 'next runs', now(), 'migration-cron-input-next', now(), 'migration-cron-input-next', 1),
  ('app.widgets.cron_input.hint.next', 'de-DE', 'nächste Ausführungen', now(), 'migration-cron-input-next', now(), 'migration-cron-input-next', 1),
  ('app.widgets.cron_input.hint.next', 'fr-FR', 'prochaines exécutions', now(), 'migration-cron-input-next', now(), 'migration-cron-input-next', 1),
  ('app.widgets.cron_input.hint.next', 'es-ES', 'próximas ejecuciones', now(), 'migration-cron-input-next', now(), 'migration-cron-input-next', 1),
  ('app.widgets.cron_input.hint.next', 'pt-PT', 'próximas execuções', now(), 'migration-cron-input-next', now(), 'migration-cron-input-next', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;
