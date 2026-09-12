-- Fire-and-forget: Update 10 newly tested models with compatibility results.
--
-- Test date: 2026-09-10
-- Test: 3-turn incremental regex scenario (same as previous 12-model test)
--
-- Results:
--   COMPATIBLE (3/3):
--     Qwen3.5-4B     → power 4, thinking model, excellent quality
--     Phi-4-mini      → power 4, non-thinking, excellent quality
--
--   NOT_COMPATIBLE (0/3 or 1/3 or load error):
--     Qwen3-0.6B              → 0/3, thinking didn't produce JSON
--     Qwen2.5-Coder-0.5B      → 1/3, context confusion (echoed "Regex:" prefix)
--     gemma3-1b-it            → LOAD ERROR, WebLLM sliding_window incompatibility
--     Qwen2.5-Math-1.5B       → 0/3, repetitive garbage (math-tuned, unsuitable)
--     stablelm-2-zephyr-1.6B  → 0/3, confused by examples, generated email patterns
--     gemma-2b-it             → 0/3, produced JavaScript code instead of JSON
--     Ministral-3-3B-Instruct → 0/3, wrong patterns, no anchors, multi-JSON
--     Ministral-3-3B-Reasoning→ 0/3, typo a-zA (missing Z), unwanted characters
--
-- Idempotent via UPDATE by model_id.
--
-- Date: 2026-09-10

BEGIN;

-- ─── COMPATIBLE (2 models) ───
UPDATE "public"."ai_models" SET
  is_enabled = true, power_level = 4, compatibility_status = 'COMPATIBLE'
WHERE model_id = 'Qwen3.5-4B-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 4, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Phi-4-mini-instruct-q4f16_1-MLC';

-- ─── NOT_COMPATIBLE (8 models) ───
UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Qwen3-0.6B-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'gemma3-1b-it-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'stablelm-2-zephyr-1_6b-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'gemma-2b-it-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Ministral-3-3B-Instruct-2512-BF16-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Ministral-3-3B-Reasoning-2512-q4f16_1-MLC';

COMMIT;
