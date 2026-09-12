-- Revert: enable_thinking IS a runtime flag, not model metadata.
-- Setting enable_thinking=false for ALL models is CORRECT:
--   - tells WebLLM to inject an empty thinking block
--   - model generates JSON directly, no thinking loop possible
-- This was the fix that resolved the thinking-loop crashes.
--
-- Revert the incorrect fix_enable_thinking_metadata.sql patch.

UPDATE ai_models
SET enable_thinking = false,
    updated_at = NOW(),
    updated_by = 'system',
    version = version + 1
WHERE model_id LIKE 'Qwen3%'
  AND enable_thinking = true
  AND deleted_at IS NULL;
