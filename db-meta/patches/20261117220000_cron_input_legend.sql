-- CronInput legend rework: the legend is now a toggleable, per-cell-contextual
-- panel (off by default, second trailing CTA slot). Adds its toggle label and
-- purges `hint.example` — examples moved inside the legend rows.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.cron_input.legend', 'it-IT', 'legenda', now(), 'migration-cron-input-legend', now(), 'migration-cron-input-legend', 1),
  ('app.widgets.cron_input.legend', 'en-GB', 'legend', now(), 'migration-cron-input-legend', now(), 'migration-cron-input-legend', 1),
  ('app.widgets.cron_input.legend', 'en-US', 'legend', now(), 'migration-cron-input-legend', now(), 'migration-cron-input-legend', 1),
  ('app.widgets.cron_input.legend', 'de-DE', 'Legende', now(), 'migration-cron-input-legend', now(), 'migration-cron-input-legend', 1),
  ('app.widgets.cron_input.legend', 'fr-FR', 'légende', now(), 'migration-cron-input-legend', now(), 'migration-cron-input-legend', 1),
  ('app.widgets.cron_input.legend', 'es-ES', 'leyenda', now(), 'migration-cron-input-legend', now(), 'migration-cron-input-legend', 1),
  ('app.widgets.cron_input.legend', 'pt-PT', 'legenda', now(), 'migration-cron-input-legend', now(), 'migration-cron-input-legend', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;

UPDATE public.translations
SET deleted_at = now(),
    deleted_by = 'migration-20261117220000'
WHERE key = 'app.widgets.cron_input.hint.example'
  AND deleted_at IS NULL;
