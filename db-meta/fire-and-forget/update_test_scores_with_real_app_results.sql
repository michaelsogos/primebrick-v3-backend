-- Update test_scores with real app test results (end-to-end verification)
-- Test date: 2026-09-11
-- App: http://localhost:5173/system/settings/security/create
-- Models tested: Qwen3-1.7B (4 turns), Qwen3.5-4B (4 turns)
-- Harness: all 7 models (3 scenarios, 5 turns each)
--
-- The runs array now includes both harness and real app test results:
-- [harness_A, harness_B, harness_C, real_app_best, real_app_overall]
-- Score = mean(runs)

-- Qwen3-1.7B: harness A=3/4(4), B=0/5(1), C=0/5(1), real_app=0/4(1), overall=1 → runs [4,1,1,1,1], score=1.6
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[4,1,1,1,1]'::jsonb,
      'score', 1.6,
      'method', 'mean',
      'updated_at', '2026-09-11T23:00:00Z',
      'test_source', 'webllm_harness_3scenarios + real_app_e2e'
    )
  ),
  affidability = 2,
  rank = 1.7,
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen3-1.7B-q4f16_1-MLC';

-- Qwen3.5-4B: harness A=2/4(2), B=4/4(5), C=4/4(5), real_app=4/4(5), overall=5 → runs [2,5,5,5,5], score=4.4
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[2,5,5,5,5]'::jsonb,
      'score', 4.4,
      'method', 'mean',
      'updated_at', '2026-09-11T23:00:00Z',
      'test_source', 'webllm_harness_3scenarios + real_app_e2e'
    )
  ),
  affidability = 4,
  rank = 4.0,
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen3.5-4B-q4f16_1-MLC';

-- Qwen2.5-1.5B: harness A=1/5(1), B=1/5(1), C=2/4(2), best=2, overall=1 → runs [1,1,2,2,1], score=1.4
-- (no real app test, harness only)
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[1,1,2,2,1]'::jsonb,
      'score', 1.4,
      'method', 'mean',
      'updated_at', '2026-09-11T23:00:00Z',
      'test_source', 'webllm_harness_3scenarios'
    )
  ),
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';

-- Qwen2.5-Coder-1.5B: harness A=1/5(1), B=3/4(4), C=4/4(5), best=5, overall=3 → runs [1,4,5,5,3], score=3.6
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[1,4,5,5,3]'::jsonb,
      'score', 3.6,
      'method', 'mean',
      'updated_at', '2026-09-11T23:00:00Z',
      'test_source', 'webllm_harness_3scenarios'
    )
  ),
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC';

-- Qwen3.5-2B: harness A=3/4(4), B=3/4(4), C=2/4(2), best=4, overall=3 → runs [4,4,2,4,3], score=3.4
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[4,4,2,4,3]'::jsonb,
      'score', 3.4,
      'method', 'mean',
      'updated_at', '2026-09-11T23:00:00Z',
      'test_source', 'webllm_harness_3scenarios'
    )
  ),
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen3.5-2B-q4f16_1-MLC';

-- Qwen2.5-Coder-3B: harness A=1/5(1), B=1/5(1), C=3/5(3), best=3, overall=2 → runs [1,1,3,3,2], score=2.0
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[1,1,3,3,2]'::jsonb,
      'score', 2.0,
      'method', 'mean',
      'updated_at', '2026-09-11T23:00:00Z',
      'test_source', 'webllm_harness_3scenarios'
    )
  ),
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC';

-- Qwen3-4B: harness A=4/4(5), B=4/4(5), C=3/5(3), best=5, overall=4 → runs [5,5,3,5,4], score=4.4
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,3,5,4]'::jsonb,
      'score', 4.4,
      'method', 'mean',
      'updated_at', '2026-09-11T23:00:00Z',
      'test_source', 'webllm_harness_3scenarios'
    )
  ),
  updated_at = NOW(),
  version = version + 1
WHERE model_id = 'Qwen3-4B-q4f16_1-MLC';
