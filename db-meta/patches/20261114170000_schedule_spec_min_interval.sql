-- Primebrick: app.common.validation.schedule_spec_min_interval — the field
-- issue raised by `checkFieldValue` (v3-core) when a recurring `@every`
-- schedule_spec fires below the one-minute floor. Grammar errors keep the
-- generic `app.common.validation.schedule_spec` key; below-floor is a
-- distinct semantic error so the user is told the actual constraint, not
-- "invalid format". All 7 supported languages.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.validation.schedule_spec_min_interval', 'en-GB', 'Repeating schedules cannot run more often than once a minute', now(), 'migration-schedule-floor', now(), 'migration-schedule-floor', 1),
  (uuidv7(), 'app.common.validation.schedule_spec_min_interval', 'en-US', 'Repeating schedules cannot run more often than once a minute', now(), 'migration-schedule-floor', now(), 'migration-schedule-floor', 1),
  (uuidv7(), 'app.common.validation.schedule_spec_min_interval', 'it-IT', 'Le pianificazioni ricorrenti non possono essere eseguite più di una volta al minuto', now(), 'migration-schedule-floor', now(), 'migration-schedule-floor', 1),
  (uuidv7(), 'app.common.validation.schedule_spec_min_interval', 'fr-FR', 'Les planifications récurrentes ne peuvent pas s''exécuter plus d''une fois par minute', now(), 'migration-schedule-floor', now(), 'migration-schedule-floor', 1),
  (uuidv7(), 'app.common.validation.schedule_spec_min_interval', 'es-ES', 'Las programaciones recurrentes no pueden ejecutarse más de una vez por minuto', now(), 'migration-schedule-floor', now(), 'migration-schedule-floor', 1),
  (uuidv7(), 'app.common.validation.schedule_spec_min_interval', 'de-DE', 'Wiederkehrende Zeitpläne können nicht öfter als einmal pro Minute ausgeführt werden', now(), 'migration-schedule-floor', now(), 'migration-schedule-floor', 1),
  (uuidv7(), 'app.common.validation.schedule_spec_min_interval', 'pt-PT', 'Os agendamentos recorrentes não podem ser executados mais do que uma vez por minuto', now(), 'migration-schedule-floor', now(), 'migration-schedule-floor', 1);
