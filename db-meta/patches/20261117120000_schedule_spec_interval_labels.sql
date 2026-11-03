-- Schedule-spec picker: interval-mode title/description per user copy +
-- once-mode title ("Una volta sola" — chosen label) + the new
-- app.common.select_timezone key consumed by the promoted DateWheelPicker's
-- timezone ComboSelect. Idempotent re-seed; covers all 7 locales.

-- it-IT title: "A intervalli regolari di tempo" → "A intervalli regolari"
UPDATE public.translations
SET value = 'A intervalli regolari', updated_at = now(), updated_by = 'migration-schedule-spec-interval-labels', version = version + 1
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language = 'it-IT';

-- Interval description → "repeats at regular time intervals" semantics, 7 locales.
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.schedule_spec.mode.interval.desc', 'it-IT', 'Si ripete a intervalli regolari di tempo.', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'en-GB', 'Repeats at regular time intervals.', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'en-US', 'Repeats at regular time intervals.', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'de-DE', 'Wiederholt sich in regelmäßigen Zeitabständen.', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'fr-FR', 'Se répète à intervalles réguliers.', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'es-ES', 'Se repite a intervalos regulares.', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'pt-PT', 'Repete-se em intervalos regulares.', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;

-- Once-mode title → "Una volta sola" (user-chosen), 7 locales.
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.schedule_spec.mode.once', 'it-IT', 'Una volta sola', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.once', 'en-GB', 'Just once', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.once', 'en-US', 'Just once', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.once', 'de-DE', 'Nur einmal', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.once', 'fr-FR', 'Une seule fois', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.once', 'es-ES', 'Solo una vez', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.widgets.schedule_spec.mode.once', 'pt-PT', 'Apenas uma vez', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;

-- New key: timezone selector placeholder (DateWheelPicker timezone ComboSelect).
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.common.select_timezone', 'it-IT', 'Seleziona fuso orario', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.common.select_timezone', 'en-GB', 'Select time zone', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.common.select_timezone', 'en-US', 'Select time zone', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.common.select_timezone', 'de-DE', 'Zeitzone auswählen', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.common.select_timezone', 'fr-FR', 'Sélectionner le fuseau horaire', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.common.select_timezone', 'es-ES', 'Seleccionar zona horaria', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1),
  ('app.common.select_timezone', 'pt-PT', 'Selecionar fuso horário', now(), 'migration-schedule-spec-interval-labels', now(), 'migration-schedule-spec-interval-labels', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;
