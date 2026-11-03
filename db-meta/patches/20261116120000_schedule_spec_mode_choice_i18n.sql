-- `app.widgets.schedule_spec.mode.*` — the schedule assistant's mode picker
-- became a Choicebox card group (title + description), so each mode now
-- carries a `…​.desc` sentence and the bare dev-vocabulary titles are
-- softened into product language ("Cron" → "Custom", "Una tantum" →
-- "Una sola volta", "Interval" → "Repeat"). Titles are UPDATEd in place;
-- descriptions are new keys, both idempotent on (key, language).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.schedule_spec.mode.interval.desc', 'en-GB', 'Runs every N seconds, minutes, hours or days', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'en-US', 'Runs every N seconds, minutes, hours or days', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'it-IT', 'Si ripete ogni N secondi, minuti, ore o giorni', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'de-DE', 'Wird alle N Sekunden, Minuten, Stunden oder Tage ausgeführt', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'fr-FR', 'S''exécute toutes les N secondes, minutes, heures ou jours', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'es-ES', 'Se ejecuta cada N segundos, minutos, horas o días', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.interval.desc', 'pt-PT', 'É executado a cada N segundos, minutos, horas ou dias', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),

  ('app.widgets.schedule_spec.mode.once.desc', 'en-GB', 'Runs a single time at the chosen date and time', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.once.desc', 'en-US', 'Runs a single time at the chosen date and time', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.once.desc', 'it-IT', 'Viene eseguito una sola volta, alla data e ora scelte', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.once.desc', 'de-DE', 'Wird einmalig zum gewählten Zeitpunkt ausgeführt', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.once.desc', 'fr-FR', 'S''exécute une seule fois, à la date et l''heure choisies', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.once.desc', 'es-ES', 'Se ejecuta una sola vez, en la fecha y hora elegidas', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.once.desc', 'pt-PT', 'É executado uma única vez, na data e hora escolhidas', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),

  ('app.widgets.schedule_spec.mode.cron.desc', 'en-GB', 'A recurring schedule written as a cron expression — for advanced users', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.cron.desc', 'en-US', 'A recurring schedule written as a cron expression — for advanced users', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.cron.desc', 'it-IT', 'Una pianificazione ricorrente scritta come espressione cron — per utenti avanzati', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.cron.desc', 'de-DE', 'Ein wiederkehrender Zeitplan als Cron-Ausdruck — für Fortgeschrittene', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.cron.desc', 'fr-FR', 'Une planification récurrente écrite en expression cron — pour utilisateurs avancés', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.cron.desc', 'es-ES', 'Una programación recurrente escrita como expresión cron — para usuarios avanzados', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1),
  ('app.widgets.schedule_spec.mode.cron.desc', 'pt-PT', 'Um agendamento recorrente escrito como expressão cron — para usuários avançados', now(), 'migration-schedule-spec-mode-choice', now(), 'migration-schedule-spec-mode-choice', 1)
ON CONFLICT (key, language) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice';

UPDATE public.translations SET value = 'Repeat', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language IN ('en-GB', 'en-US');
UPDATE public.translations SET value = 'Ripeti', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language = 'it-IT';
UPDATE public.translations SET value = 'Wiederholen', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language = 'de-DE';
UPDATE public.translations SET value = 'Répéter', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Repetir', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language IN ('es-ES', 'pt-PT');

UPDATE public.translations SET value = 'One time', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.once' AND language IN ('en-GB', 'en-US');
UPDATE public.translations SET value = 'Una sola volta', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.once' AND language = 'it-IT';
UPDATE public.translations SET value = 'Einmal', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.once' AND language = 'de-DE';
UPDATE public.translations SET value = 'Une fois', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.once' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Una vez', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.once' AND language = 'es-ES';
UPDATE public.translations SET value = 'Uma vez', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.once' AND language = 'pt-PT';

UPDATE public.translations SET value = 'Custom', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.cron' AND language IN ('en-GB', 'en-US');
UPDATE public.translations SET value = 'Personalizzato', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.cron' AND language = 'it-IT';
UPDATE public.translations SET value = 'Benutzerdefiniert', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.cron' AND language = 'de-DE';
UPDATE public.translations SET value = 'Personnalisé', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.cron' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Personalizado', updated_at = now(), updated_by = 'migration-schedule-spec-mode-choice'
WHERE key = 'app.widgets.schedule_spec.mode.cron' AND language IN ('es-ES', 'pt-PT');
