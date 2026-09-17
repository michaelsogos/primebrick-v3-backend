-- Fire-and-forget patch: remove the redundant ai_models reliability KPI.
-- Rank remains the only final score; quality and speed remain diagnostic inputs.

BEGIN;

ALTER TABLE public.ai_models
  DROP COLUMN IF EXISTS affidability;

DELETE FROM system.translations
WHERE key = 'system.entities.ai_model.fields.affidability'
   OR key LIKE 'system.entities.ai_model.affidability.%';

DELETE FROM public.translations
WHERE key = 'app.smart.regex.ai.model_details.reliability';

COMMIT;
