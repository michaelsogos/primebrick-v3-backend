-- Increase max_tokens for Qwen3/Qwen3.5 (thinking) models.
--
-- These models generate thinking content even when enable_thinking=false
-- (WebLLM inserts an empty thinking block, but the model generates its own
-- thinking content anyway). With max_tokens=512, the model runs out of tokens
-- during thinking before emitting the closing tag and JSON output.
--
-- Increasing to 2048 gives the model room to:
--   1. Generate thinking content (analysis)
--   2. Close the thinking block
--   3. Emit the JSON regex output
--
-- Non-thinking models (Qwen2.5, Phi-4, Llama) keep their lower max_tokens
-- (256) since they generate JSON directly without thinking.

UPDATE ai_models
SET max_tokens = 2048,
    updated_at = NOW(),
    updated_by = 'system',
    version = version + 1
WHERE model_id LIKE 'Qwen3%'
  AND compatibility_status = 'COMPATIBLE'
  AND deleted_at IS NULL;
