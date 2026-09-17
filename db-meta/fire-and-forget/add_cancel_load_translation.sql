-- Fire-and-forget patch: missing translation for the Smart Regex AI
-- "Cancel load" button (app.smart.regex.ai.cancelLoad).
-- The key existed in the FE en-GB fallback but was never seeded in the DB.

BEGIN;

INSERT INTO public.translations (key, language, value, created_by, updated_by)
VALUES
  ('app.smart.regex.ai.cancelLoad','en-GB','Cancel','system_migration','system_migration'),
  ('app.smart.regex.ai.cancelLoad','it-IT','Annulla','system_migration','system_migration'),
  ('app.smart.regex.ai.cancelLoad','fr-FR','Annuler','system_migration','system_migration'),
  ('app.smart.regex.ai.cancelLoad','es-ES','Cancelar','system_migration','system_migration'),
  ('app.smart.regex.ai.cancelLoad','de-DE','Abbrechen','system_migration','system_migration'),
  ('app.smart.regex.ai.cancelLoad','pt-PT','Cancelar','system_migration','system_migration')
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
