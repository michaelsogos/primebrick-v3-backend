-- Schedule-bound validation keys — two new surfaces, same i18n contract:
--
-- `app.common.validation.schedule_spec_past` — emitted by the shared
--   `jobTriggerShapeIssues` predicate (core) when an `@at <ts>` one-shot
--   lies in the past: the FE superform and the write guard surface the
--   same key.
-- `app.common.validation.datetime_before_min` — the DateWheelPicker
--   `minValue` refusal strip; `{min}` is the formatted lower bound.
--
-- Copy tone: user-facing, no wire-format jargon (per copy-tone-of-voice).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.validation.schedule_spec_past', 'en-GB', 'The one-time date and time must be in the future', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.schedule_spec_past', 'en-US', 'The one-time date and time must be in the future', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.schedule_spec_past', 'it-IT', 'La data e l''ora dell''esecuzione singola devono essere nel futuro', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.schedule_spec_past', 'de-DE', 'Datum und Uhrzeit der einmaligen Ausführung müssen in der Zukunft liegen', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.schedule_spec_past', 'fr-FR', 'La date et l''heure de l''exécution unique doivent être dans le futur', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.schedule_spec_past', 'es-ES', 'La fecha y la hora de la ejecución única deben estar en el futuro', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.schedule_spec_past', 'pt-PT', 'A data e a hora da execução única têm de estar no futuro', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),

  ('app.common.validation.datetime_before_min', 'en-GB', 'Choose a date and time from {min} onwards', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.datetime_before_min', 'en-US', 'Choose a date and time from {min} onwards', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.datetime_before_min', 'it-IT', 'Scegli una data e un''ora a partire da {min}', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.datetime_before_min', 'de-DE', 'Wählen Sie Datum und Uhrzeit ab {min}', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.datetime_before_min', 'fr-FR', 'Choisissez une date et une heure à partir de {min}', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.datetime_before_min', 'es-ES', 'Elige una fecha y hora a partir de {min}', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1),
  ('app.common.validation.datetime_before_min', 'pt-PT', 'Escolha uma data e hora a partir de {min}', now(), 'migration-schedule-bounds', now(), 'migration-schedule-bounds', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
