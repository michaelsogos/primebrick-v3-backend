-- Fire-and-forget patch: shared "Initializing..." label for the Smart AI
-- chat panel (app.common.ai.initializing) — shown while the assistant
-- composable resolves the model config and boots the worker.

BEGIN;

INSERT INTO public.translations (key, language, value, created_by, updated_by)
VALUES
  ('app.common.ai.initializing','en-GB','Initializing...','system_migration','system_migration'),
  ('app.common.ai.initializing','it-IT','Inizializzazione...','system_migration','system_migration'),
  ('app.common.ai.initializing','fr-FR','Initialisation...','system_migration','system_migration'),
  ('app.common.ai.initializing','es-ES','Inicializando...','system_migration','system_migration'),
  ('app.common.ai.initializing','de-DE','Initialisierung...','system_migration','system_migration'),
  ('app.common.ai.initializing','pt-PT','A inicializar...','system_migration','system_migration')
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
