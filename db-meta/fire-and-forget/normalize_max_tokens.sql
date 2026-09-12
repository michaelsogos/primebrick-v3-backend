-- Fire-and-forget: Normalize max_tokens for models that had thinking-optimized values.
--
-- Models with enable_thinking=true had max_tokens set to 768 or 2048 to
-- accommodate thinking + JSON output. Now that thinking is disabled for all
-- models (see disable_thinking_all_models.sql), these high max_tokens values
-- are unnecessary and can cause long generation times if the model produces
-- garbage or loops.
--
-- Fix:
--   Set max_tokens=512 for all models. This is sufficient for JSON output:
--   {"patterns":[{"pattern":"^[a-zA-Z0-9.,_-]+$","flags":""}]} = ~30 tokens
--   Even with 3 choices + descriptions, 512 tokens is more than enough.
--
-- Idempotent via UPDATE by model_id.
--
-- Date: 2026-09-10

BEGIN;

-- Normalize max_tokens to 512 for models that had 768 or 2048
UPDATE "public"."ai_models"
SET max_tokens = 512
WHERE max_tokens IN (768, 2048);

COMMIT;
