-- Fire-and-forget: Change default AI assistant model to granite-4.0-micro-ONNX-web#q4f16
--
-- Reason: 2026-09-17 retest campaign — granite micro q4f16 is the only ONNX
-- model with rank 5.0 (5/5 exact including the discriminating T4 turn,
-- 1.1-2.0 s/turn, KV reuse 91-94.5%). Replaces Qwen2.5-Coder-3B-Instruct#q4.
--
-- Idempotent: safe to run multiple times.
-- Date: 2026-09-17

BEGIN;

UPDATE public.config_entries
SET value = 'onnx-community/granite-4.0-micro-ONNX-web#q4f16',
    updated_at = NOW(),
    updated_by = 'system_empirical_test',
    version = version + 1
WHERE key = 'ai_assistant_model'
  AND value <> 'onnx-community/granite-4.0-micro-ONNX-web#q4f16';

COMMIT;
