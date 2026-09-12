-- Add affidability, rank, and test_scores columns to ai_models.
--
-- affidability (1-5): derived from test_scores final_score (round).
--   Measures model reliability — how consistently it produces correct output.
--   Higher = more reliable. Independent from power_level (compute requirement).
--
-- rank (0.0-5.0): composite score combining affidability (70%) and power (30%).
--   Formula: round((affidability * 0.7 + power_level * 0.3) * 10) / 10
--   Affidability weighs more: a reliable-but-light model beats a powerful-but-unreliable one.
--
-- test_scores (jsonb): full test case results with runs[] arrays.
--   Structure:
--   {
--     "regex_test_score": {
--       "runs": [5, 4, 5, 4, 5],
--       "score": 4.6,
--       "method": "mean",
--       "updated_at": "2026-09-11T10:00:00Z"
--     }
--   }
--   Case score = arithmetic mean of runs.
--   Final score = arithmetic mean of all case scores.
--   affidability = round(final_score).

ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS affidability int NOT NULL DEFAULT 1;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS rank numeric(3,1) NOT NULL DEFAULT 1.0;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS test_scores jsonb;

-- Update 7 compatible models with values from 5-turn regex regression test

UPDATE ai_models SET
  affidability = 5,
  rank = 4.4,
  test_scores = '{"regex_test_score":{"runs":[5,4,5,4,5],"score":4.6,"method":"mean","updated_at":"2026-09-11T10:00:00Z"}}'::jsonb,
  updated_at = NOW(),
  updated_by = 'system',
  version = version + 1
WHERE model_id = 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC' AND deleted_at IS NULL;

UPDATE ai_models SET
  affidability = 4,
  rank = 4.0,
  test_scores = '{"regex_test_score":{"runs":[4,4,5,3,4],"score":4.0,"method":"mean","updated_at":"2026-09-11T10:00:00Z"}}'::jsonb,
  updated_at = NOW(),
  updated_by = 'system',
  version = version + 1
WHERE model_id = 'Qwen3.5-4B-q4f16_1-MLC' AND deleted_at IS NULL;

UPDATE ai_models SET
  affidability = 4,
  rank = 3.7,
  test_scores = '{"regex_test_score":{"runs":[4,4,3,5,4],"score":4.0,"method":"mean","updated_at":"2026-09-11T10:00:00Z"}}'::jsonb,
  updated_at = NOW(),
  updated_by = 'system',
  version = version + 1
WHERE model_id = 'Qwen3.5-2B-q4f16_1-MLC' AND deleted_at IS NULL;

UPDATE ai_models SET
  affidability = 3,
  rank = 3.3,
  test_scores = '{"regex_test_score":{"runs":[3,4,3,4,4],"score":3.6,"method":"mean","updated_at":"2026-09-11T10:00:00Z"}}'::jsonb,
  updated_at = NOW(),
  updated_by = 'system',
  version = version + 1
WHERE model_id = 'Qwen3-4B-q4f16_1-MLC' AND deleted_at IS NULL;

UPDATE ai_models SET
  affidability = 4,
  rank = 3.1,
  test_scores = '{"regex_test_score":{"runs":[4,3,4,3,4],"score":3.6,"method":"mean","updated_at":"2026-09-11T10:00:00Z"}}'::jsonb,
  updated_at = NOW(),
  updated_by = 'system',
  version = version + 1
WHERE model_id = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC' AND deleted_at IS NULL;

UPDATE ai_models SET
  affidability = 3,
  rank = 2.4,
  test_scores = '{"regex_test_score":{"runs":[3,3,2,4,3],"score":3.0,"method":"mean","updated_at":"2026-09-11T10:00:00Z"}}'::jsonb,
  updated_at = NOW(),
  updated_by = 'system',
  version = version + 1
WHERE model_id = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC' AND deleted_at IS NULL;

UPDATE ai_models SET
  affidability = 2,
  rank = 1.7,
  test_scores = '{"regex_test_score":{"runs":[1,2,2,1,2],"score":1.6,"method":"mean","updated_at":"2026-09-11T10:00:00Z"}}'::jsonb,
  updated_at = NOW(),
  updated_by = 'system',
  version = version + 1
WHERE model_id = 'Qwen3-1.7B-q4f16_1-MLC' AND deleted_at IS NULL;
