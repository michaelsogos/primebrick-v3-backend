-- Fire-and-forget: Disable thinking mode for ALL ai_models.
--
-- Root cause of thinking loops/crashes:
--   Qwen3/Qwen3.5 models with enable_thinking=true enter a thinking phase
--   that consumes the entire max_tokens budget (768 or 2048) before generating
--   any JSON output. The model never closes the  tag, so:
--   1. finish_reason="length" (max_tokens reached)
--   2. No JSON in the response → parseRegexChoices fails
--   3. User sees no regex output (crash/loop)
--
-- Fix:
--   Set enable_thinking=false for ALL models. WebLLM injects an empty
--   thinking block ("imdi\n\n\n\n") at the token level, telling the model
--   "thinking is done, now generate the answer". The model generates JSON
--   directly, no thinking loop possible.
--
-- Rationale:
--   - The task (regex generation from natural language) is simple — no
--     extended reasoning needed
--   - Non-thinking models scored better in empirical testing:
--     Qwen2.5-Coder-3B (non-thinking): 5/5
--     Qwen3.5-2B (thinking): 4/5
--     Qwen3-4B (thinking): 2/5
--     Qwen3-1.7B (thinking): 1/5
--   - Thinking adds 44-65 seconds latency per turn (unacceptable UX)
--   - Thinking consumes token budget, leaving insufficient room for JSON
--
-- Idempotent via UPDATE by model_id.
--
-- Date: 2026-09-10

BEGIN;

-- Disable thinking for ALL models
UPDATE "public"."ai_models"
SET enable_thinking = false
WHERE enable_thinking = true;

COMMIT;
