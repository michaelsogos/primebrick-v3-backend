-- CronInput: clearer ops-legend wording — `*` = "any value", `/` = "every N"
-- (the step IS "every N": `*/15` reads as "every 15").

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.cron_input.token.star', 'it-IT', 'qualsiasi valore', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.star', 'en-GB', 'any value', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.star', 'en-US', 'any value', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.star', 'de-DE', 'jeder Wert', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.star', 'fr-FR', 'toute valeur', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.star', 'es-ES', 'cualquier valor', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.star', 'pt-PT', 'qualquer valor', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.slash', 'it-IT', 'ogni N', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.slash', 'en-GB', 'every N', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.slash', 'en-US', 'every N', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.slash', 'de-DE', 'jede N', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.slash', 'fr-FR', 'tous les N', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.slash', 'es-ES', 'cada N', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1),
  ('app.widgets.cron_input.token.slash', 'pt-PT', 'a cada N', now(), 'migration-cron-token-meaning', now(), 'migration-cron-token-meaning', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE
SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by, version = public.translations.version + 1;
