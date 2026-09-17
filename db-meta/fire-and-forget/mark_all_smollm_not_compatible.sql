-- Fire-and-forget patch: permanently exclude every SmolLM family and dtype.
-- Empirical failures include invalid/empty output, stale repeated regexes,
-- browser ArrayBuffer limits, unsupported BNB4 and ONNX dtype mismatches.

BEGIN;

UPDATE public.ai_models
SET compatibility_status = 'NOT_COMPATIBLE',
    is_enabled = false,
    updated_at = now(),
    updated_by = 'system_migration_smollm_not_compatible',
    version = version + 1
WHERE model_id ILIKE '%smollm%'
  AND (compatibility_status IS DISTINCT FROM 'NOT_COMPATIBLE' OR is_enabled IS DISTINCT FROM false);

COMMIT;
