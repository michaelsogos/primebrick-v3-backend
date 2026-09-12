-- Fire-and-forget: Add `model_levels` to the `ai_assistant_model` type_config JSON.
--
-- Adds a `model_levels` map (model_id → power_level 1-5) to the existing
-- `type_config` JSON of the `ai_assistant_model` reserved config row.
-- The FE reads this map to render the 5-bar power indicator in the
-- Smart Regex model dropdown.
--
-- Current levels:
--   Qwen3-1.7B-q4f16_1-MLC             → 2 (Lower)
--   Qwen2.5-1.5B-Instruct-q4f16_1-MLC  → 3 (Average)
--   Qwen3-4B-q4f16_1-MLC               → 4 (Higher)
--
-- Level 5 is reserved for future powerful BE models — no local model uses it.
--
-- Idempotent: only updates if `model_levels` is not already present.
--
-- Date: 2026-09-10

BEGIN;

UPDATE public.auth_configurations
SET type_config = jsonb_set(
  type_config::jsonb,
  '{model_levels}',
  '{
    "Qwen3-1.7B-q4f16_1-MLC": 2,
    "Qwen2.5-1.5B-Instruct-q4f16_1-MLC": 3,
    "Qwen3-4B-q4f16_1-MLC": 4
  }'::jsonb
)::text,
  updated_at = now(),
  updated_by = 'system',
  version = version + 1
WHERE key = 'ai_assistant_model'
  AND NOT (type_config::jsonb ? 'model_levels');

-- Audit entry for the type_config update.
INSERT INTO public.auth_configurations_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
SELECT id, uuid, 'UPDATE', now(), 'system', version,
  jsonb_build_object(
    'type_config', jsonb_build_object(
      'old', type_config,
      'new', jsonb_set(
        type_config::jsonb,
        '{model_levels}',
        '{"Qwen3-1.7B-q4f16_1-MLC":2,"Qwen2.5-1.5B-Instruct-q4f16_1-MLC":3,"Qwen3-4B-q4f16_1-MLC":4}'::jsonb
      )::text
    ),
    'version', jsonb_build_object('old', version - 1, 'new', version),
    'updated_at', jsonb_build_object('old', updated_at, 'new', now()),
    'updated_by', jsonb_build_object('old', updated_by, 'new', 'system')
  )
FROM auth_configurations
WHERE key = 'ai_assistant_model'
  AND NOT (type_config::jsonb ? 'model_levels');

COMMIT;
