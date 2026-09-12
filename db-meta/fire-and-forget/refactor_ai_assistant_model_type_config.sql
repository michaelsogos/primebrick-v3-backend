-- Fire-and-forget: Refactor ai_assistant_model type_config from values_source to api_url
--
-- Changes the ai_assistant_model config row's type_config from:
--   { "values_source": "ai_models", "value_field": "id", "label_field": "label_key",
--     "model_levels": {...}, "validation": {...} }
-- To:
--   { "api_url": "/api/v1/entities/ai_model/list", "api_verb": "GET",
--     "value_field": "model_id", "label_field": "label_key", "validation": {...} }
--
-- Removes the model_levels map (power_level is now a column on ai_models).
--
-- Idempotent: only updates if values_source is still "ai_models".
--
-- Date: 2026-09-10

BEGIN;

UPDATE public.auth_configurations
SET type_config = jsonb_build_object(
    'api_url', '/api/v1/entities/ai_model/list',
    'api_verb', 'GET',
    'value_field', 'model_id',
    'label_field', 'label_key',
    'validation', COALESCE(
      type_config::jsonb -> 'validation',
      jsonb_build_object('required', true, 'required_error_label_key', 'app.common.validation.required', 'rules', '{}'::jsonb)
    )
  )::text,
  updated_at = now(),
  updated_by = 'system',
  version = version + 1
WHERE key = 'ai_assistant_model'
  AND type_config::jsonb ->> 'values_source' = 'ai_models';

-- Audit entry for the type_config update.
INSERT INTO public.auth_configurations_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
SELECT id, uuid, 'UPDATE', now(), 'system', version,
  jsonb_build_object(
    'type_config', jsonb_build_object(
      'old', type_config,
      'new', jsonb_build_object(
        'api_url', '/api/v1/entities/ai_model/list',
        'api_verb', 'GET',
        'value_field', 'model_id',
        'label_field', 'label_key',
        'validation', COALESCE(
          type_config::jsonb -> 'validation',
          jsonb_build_object('required', true, 'required_error_label_key', 'app.common.validation.required', 'rules', '{}'::jsonb)
        )
      )::text
    ),
    'version', jsonb_build_object('old', version - 1, 'new', version),
    'updated_at', jsonb_build_object('old', updated_at, 'new', now()),
    'updated_by', jsonb_build_object('old', updated_by, 'new', 'system')
  )
FROM auth_configurations
WHERE key = 'ai_assistant_model'
  AND type_config::jsonb ->> 'values_source' = 'ai_models';

COMMIT;
