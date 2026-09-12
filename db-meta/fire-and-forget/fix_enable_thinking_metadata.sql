-- Fix: Restore correct enable_thinking values based on model architecture.
--
-- The disable_thinking_all_models.sql patch incorrectly set enable_thinking=false
-- for ALL models, including Qwen3/Qwen3.5 which ARE thinking models by design.
--
-- enable_thinking is a MODEL METADATA field, not a runtime switch:
--   - true  → the model architecture supports/uses thinking (Qwen3, Qwen3.5)
--   - false → the model architecture does not use thinking (Qwen2.5, Qwen2.5 Coder)
--
-- The runtime decision to inject or suppress the thinking block is handled
-- by the FE/WebLLM layer, NOT by this DB flag.
--
-- Qwen3/Qwen3.5 models: enable_thinking = true (thinking architecture)
-- Qwen2.5/Qwen2.5 Coder models: enable_thinking = false (non-thinking architecture)

UPDATE ai_models
SET enable_thinking = true,
    updated_at = NOW(),
    updated_by = 'system',
    version = version + 1
WHERE model_id LIKE 'Qwen3%'
  AND compatibility_status = 'COMPATIBLE'
  AND deleted_at IS NULL;
