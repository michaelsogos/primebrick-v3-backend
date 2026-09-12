-- Fire-and-forget: Update OLMo-2 test result.
--
-- Test date: 2026-09-10
-- Result: 0/3 — generated irrelevant patterns (vowels, dots), didn't follow instructions.
--
-- Date: 2026-09-10

BEGIN;

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'OLMo-2-0425-1B-Instruct-q4f16_1-MLC';

COMMIT;
