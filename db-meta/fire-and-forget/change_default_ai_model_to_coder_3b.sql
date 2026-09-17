-- Change default AI assistant model to Qwen2.5 Coder 3B (ONNX, q4)
-- Best model after speed-aware S1 v2 E2E 5-turn retest: 5/5 quality,
-- ~3.7 s avg response, rank 4.8.
-- Note: q4 chosen over q4f16 — same 5/5 quality, faster avg response
-- (3.66 s vs 4.4 s); no KV reuse on either, q4 prefill is cheaper.
-- Previous default: onnx-community/Qwen3-0.6B-ONNX#q4f16 (NOT_COMPATIBLE).
UPDATE auth_configurations
SET value = 'onnx-community/Qwen2.5-Coder-3B-Instruct#q4',
    updated_at = NOW(),
    updated_by = 'system',
    version = version + 1
WHERE key = 'ai_assistant_model'
  AND deleted_at IS NULL;
