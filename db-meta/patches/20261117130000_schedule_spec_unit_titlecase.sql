-- Schedule-spec picker: unit option labels title-cased for the canonical
-- ComboSelect (option-list label convention). de-DE was already capitalized
-- (German nouns always are). Only the option-label keys `unit.{s,m,h,d}` —
-- the sentence-level `unit.{u}.{one,other}` keys used by the interpreter
-- strip stay lowercase (correct inside a sentence).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.schedule_spec.unit.s', 'it-IT', 'Secondi', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.s', 'en-GB', 'Seconds', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.s', 'en-US', 'Seconds', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.s', 'fr-FR', 'Secondes', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.s', 'es-ES', 'Segundos', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.s', 'pt-PT', 'Segundos', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.m', 'it-IT', 'Minuti', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.m', 'en-GB', 'Minutes', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.m', 'en-US', 'Minutes', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.m', 'fr-FR', 'Minutes', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.m', 'es-ES', 'Minutos', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.m', 'pt-PT', 'Minutos', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.h', 'it-IT', 'Ore', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.h', 'en-GB', 'Hours', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.h', 'en-US', 'Hours', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.h', 'fr-FR', 'Heures', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.h', 'es-ES', 'Horas', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.h', 'pt-PT', 'Horas', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.d', 'it-IT', 'Giorni', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.d', 'en-GB', 'Days', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.d', 'en-US', 'Days', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.d', 'fr-FR', 'Jours', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.d', 'es-ES', 'Días', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1),
  ('app.widgets.schedule_spec.unit.d', 'pt-PT', 'Dias', now(), 'migration-schedule-spec-unit-titlecase', now(), 'migration-schedule-spec-unit-titlecase', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;
