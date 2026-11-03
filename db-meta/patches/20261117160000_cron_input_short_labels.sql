-- CronInput segmented editor: short field labels for the under-bar names row
-- (full labels stay in the legend table), 7 locales.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.cron_input.field.day_of_month.short', 'it-IT', 'Giorno', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.day_of_month.short', 'en-GB', 'Day', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.day_of_month.short', 'en-US', 'Day', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.day_of_month.short', 'de-DE', 'Tag', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.day_of_month.short', 'fr-FR', 'Jour', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.day_of_month.short', 'es-ES', 'Día', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.day_of_month.short', 'pt-PT', 'Dia', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.weekday.short', 'it-IT', 'Settimana', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.weekday.short', 'en-GB', 'Weekday', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.weekday.short', 'en-US', 'Weekday', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.weekday.short', 'de-DE', 'Wochentag', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.weekday.short', 'fr-FR', 'Semaine', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.weekday.short', 'es-ES', 'Semana', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1),
  ('app.widgets.cron_input.field.weekday.short', 'pt-PT', 'Semana', now(), 'migration-cron-input-short', now(), 'migration-cron-input-short', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;
