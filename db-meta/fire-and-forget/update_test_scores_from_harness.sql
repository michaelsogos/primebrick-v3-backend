-- Update test_scores, affidability, and rank for all 7 AI models based on
-- WebLLM KV cache test harness results (7 models, 3 scenarios, 5 turns each).
--
-- Score mapping (1-5 scale per scenario):
--   100% correct (4/4 or 5/5) = 5
--   75% correct (3/4)         = 4
--   60% correct (3/5)         = 3
--   50% correct (2/4)         = 2
--   25% correct (1/5)         = 1
--   0% correct (0/5)          = 1
--
-- 5 runs: [Scenario A, Scenario B, Scenario C, Best scenario, Overall correctness]
-- Score = mean(runs)
-- Affidability = round(score) (1-5)
-- Rank = round((affidability * 0.7 + power_level * 0.3) * 10) / 10
--
-- Test date: 2026-09-11
-- Harness: D:\git\primebrick\temp\kv-test\index.html
-- Optimizations applied: /no_think per-turn, raw content KV cache, semantic regex normalization

-- Qwen2.5-1.5B: A=1/5, B=1/5, C=2/4 → runs [1,1,2,2,1], score=1.4, aff=1, rank=1.0
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[1,1,2,2,1]'::jsonb,
      'score', 1.4,
      'method', 'mean',
      'updated_at', '2026-09-11T22:45:00Z'
    )
  ),
  affidability = 1,
  rank = 1.0,
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';

-- Qwen2.5-Coder-1.5B: A=1/5, B=3/4, C=4/4 → runs [1,4,5,5,3], score=3.6, aff=4, rank=3.1
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[1,4,5,5,3]'::jsonb,
      'score', 3.6,
      'method', 'mean',
      'updated_at', '2026-09-11T22:45:00Z'
    )
  ),
  affidability = 4,
  rank = 3.1,
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC';

-- Qwen3-1.7B: A=3/4, B=0/5, C=0/5 → runs [4,1,1,4,1], score=2.2, aff=2, rank=1.7
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[4,1,1,4,1]'::jsonb,
      'score', 2.2,
      'method', 'mean',
      'updated_at', '2026-09-11T22:45:00Z'
    )
  ),
  affidability = 2,
  rank = 1.7,
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen3-1.7B-q4f16_1-MLC';

-- Qwen3.5-2B: A=3/4, B=3/4, C=2/4 → runs [4,4,2,4,3], score=3.4, aff=3, rank=3.0
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[4,4,2,4,3]'::jsonb,
      'score', 3.4,
      'method', 'mean',
      'updated_at', '2026-09-11T22:45:00Z'
    )
  ),
  affidability = 3,
  rank = 3.0,
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen3.5-2B-q4f16_1-MLC';

-- Qwen2.5-Coder-3B: A=1/5, B=1/5, C=3/5 → runs [1,1,3,3,2], score=2.0, aff=2, rank=2.3
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[1,1,3,3,2]'::jsonb,
      'score', 2.0,
      'method', 'mean',
      'updated_at', '2026-09-11T22:45:00Z'
    )
  ),
  affidability = 2,
  rank = 2.3,
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC';

-- Qwen3-4B: A=4/4, B=4/4, C=3/5 → runs [5,5,3,5,4], score=4.4, aff=4, rank=4.0
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,3,5,4]'::jsonb,
      'score', 4.4,
      'method', 'mean',
      'updated_at', '2026-09-11T22:45:00Z'
    )
  ),
  affidability = 4,
  rank = 4.0,
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen3-4B-q4f16_1-MLC';

-- Qwen3.5-4B: A=2/4, B=4/4, C=4/4 → runs [2,5,5,5,4], score=4.2, aff=4, rank=4.0
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[2,5,5,5,4]'::jsonb,
      'score', 4.2,
      'method', 'mean',
      'updated_at', '2026-09-11T22:45:00Z'
    )
  ),
  affidability = 4,
  rank = 4.0,
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen3.5-4B-q4f16_1-MLC';
