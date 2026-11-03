-- `app.widgets.schedule_spec.mode.interval` — product wording: the card
-- title names what the schedule IS, not the verb ("Repeat" →
-- "At regular intervals" / "A intervalli regolari di tempo" / …).
-- Same semantic updated across every shipped locale.

UPDATE public.translations SET value = 'At regular intervals', updated_at = now(), updated_by = 'migration-schedule-spec-interval-title'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language IN ('en-GB', 'en-US');
UPDATE public.translations SET value = 'A intervalli regolari di tempo', updated_at = now(), updated_by = 'migration-schedule-spec-interval-title'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language = 'it-IT';
UPDATE public.translations SET value = 'In regelmäßigen Abständen', updated_at = now(), updated_by = 'migration-schedule-spec-interval-title'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language = 'de-DE';
UPDATE public.translations SET value = 'À intervalles réguliers', updated_at = now(), updated_by = 'migration-schedule-spec-interval-title'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language = 'fr-FR';
UPDATE public.translations SET value = 'A intervalos regulares', updated_at = now(), updated_by = 'migration-schedule-spec-interval-title'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language = 'es-ES';
UPDATE public.translations SET value = 'Em intervalos regulares', updated_at = now(), updated_by = 'migration-schedule-spec-interval-title'
WHERE key = 'app.widgets.schedule_spec.mode.interval' AND language = 'pt-PT';
