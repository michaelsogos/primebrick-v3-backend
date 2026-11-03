-- ScheduleSpecInput: cron-mode footer keybind legend labels, 7 locales.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.schedule_spec.kbd.fields', 'it-IT', 'celle', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.fields', 'en-GB', 'cells', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.fields', 'en-US', 'cells', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.fields', 'de-DE', 'Zellen', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.fields', 'fr-FR', 'cellules', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.fields', 'es-ES', 'celdas', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.fields', 'pt-PT', 'células', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.next', 'it-IT', 'avanti', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.next', 'en-GB', 'next', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.next', 'en-US', 'next', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.next', 'de-DE', 'weiter', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.next', 'fr-FR', 'suivant', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.next', 'es-ES', 'siguiente', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1),
  ('app.widgets.schedule_spec.kbd.next', 'pt-PT', 'seguinte', now(), 'migration-schedule-kbd', now(), 'migration-schedule-kbd', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;
