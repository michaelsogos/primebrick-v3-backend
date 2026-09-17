-- Fire-and-forget migration: update test_scores with combined run 1 + run 2 results
-- Run 2 performed on 2026-09-12T13:30Z, same 4-turn Smart Regex test
--
-- Scoring method: weighted_mean_with_consistency (combined 2 runs)
--   score = mean(all_runs) * 0.6 + (success_count / total_turns) * 5 * 0.4
--   where success = per-turn score >= 4
--   rank = rounded score (1 decimal)
--
-- Combined runs: 8 turns total (4 per run)

BEGIN;

-- Qwen2.5 1.5B (uuid 07f78259-ae89-419e-b36d-45d8750d9442)
-- Run 1: [5,1,1,1], Run 2: [5,1,1,1] -> combined: [5,1,1,1,5,1,1,1]
-- mean=2.0, success=2/8, score=1.7
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,1,1,1,5,1,1,1]'::jsonb,
      'runs_run1', '[5,1,1,1]'::jsonb,
      'runs_run2', '[5,1,1,1]'::jsonb,
      'per_turn_run1', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,.]+$","pass":false,"score":1,"note":"missing ; duplicate ."},{"turn":3,"regex":"^[a-zA-Z0-9.,.\\-]+$","pass":false,"score":1,"note":"builds on wrong state"},{"turn":4,"regex":"^[a-zA-Z0-9.,./\\-.\\_]+$","pass":false,"score":1,"note":"malformed"}]'::jsonb,
      'per_turn_run2', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,.]+$","pass":false,"score":1,"note":"missing ; duplicate ."},{"turn":3,"regex":"^[a-zA-Z0-9.,.\\-]+$","pass":false,"score":1,"note":"builds on wrong state"},{"turn":4,"regex":"^[a-zA-Z0-9.,.\\-\\w]+$","pass":false,"score":1,"note":"uses \\w but base wrong"}]'::jsonb,
      'score', 1.7,
      'method', 'weighted_mean_with_consistency_2runs',
      'method_formula', 'mean(all_runs)*0.6 + (success_count/total_turns)*5*0.4',
      'success_count', 2,
      'total_turns', 8,
      'updated_at', '2026-09-12T13:45:00Z',
      'test_source', 'real_app_e2e_2runs',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '1.7'
WHERE uuid = '07f78259-ae89-419e-b36d-45d8750d9442';

-- Qwen2.5 Coder 1.5B (uuid 75abab16-83b5-45bf-a582-41e96ff615d7)
-- Run 1: [5,5,5,5], Run 2: [5,2,2,2] -> combined: [5,5,5,5,5,2,2,2]
-- mean=3.875, success=5/8, score=3.6
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,5,5,5,2,2,2]'::jsonb,
      'runs_run1', '[5,5,5,5]'::jsonb,
      'runs_run2', '[5,2,2,2]'::jsonb,
      'per_turn_run1', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"regex":"^[a-zA-Z0-9.,;-]+$","pass":true,"score":5},{"turn":4,"regex":"^[a-zA-Z0-9.,;-_]+$","pass":true,"score":5}]'::jsonb,
      'per_turn_run2', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,]+$","pass":false,"score":2,"note":"missing ;"},{"turn":3,"regex":"^[a-zA-Z0-9.,-]+$","pass":false,"score":2,"note":"still missing ;"},{"turn":4,"regex":"^[a-zA-Z0-9.,-_]+$","pass":false,"score":2,"note":"still missing ;"}]'::jsonb,
      'score', 3.6,
      'method', 'weighted_mean_with_consistency_2runs',
      'method_formula', 'mean(all_runs)*0.6 + (success_count/total_turns)*5*0.4',
      'success_count', 5,
      'total_turns', 8,
      'updated_at', '2026-09-12T13:45:00Z',
      'test_source', 'real_app_e2e_2runs',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '3.6'
WHERE uuid = '75abab16-83b5-45bf-a582-41e96ff615d7';

-- Qwen3 1.7B (uuid e97f9fab-4ef1-4f47-967b-83c61758e12e)
-- Run 1: [1,1,2,2], Run 2: [1,1,2,2] -> combined: [1,1,2,2,1,1,2,2]
-- mean=1.5, success=0/8, score=0.9
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[1,1,2,2,1,1,2,2]'::jsonb,
      'runs_run1', '[1,1,2,2]'::jsonb,
      'runs_run2', '[1,1,2,2]'::jsonb,
      'per_turn_run1', '[{"turn":1,"regex":"^[a-zA-Z0-isdigit]+$","pass":false,"score":1,"note":"literal isdigit"},{"turn":2,"regex":"^[a-zA-Z0-isdigit\\.;\\]+$","pass":false,"score":1},{"turn":3,"regex":"^[a-zA-Z0-isdigit\\.;\\-]+$","pass":false,"score":2},{"turn":4,"regex":"^[a-zA-Z0-isdigit\\.;\\-_]+$","pass":false,"score":2}]'::jsonb,
      'per_turn_run2', '[{"turn":1,"regex":"^[a-zA-Z0-numeri]+$","pass":false,"score":1,"note":"literal numeri"},{"turn":2,"regex":"^[a-zA-Z0-\\.\\,;]+","pass":false,"score":1,"note":"malformed range missing $"},{"turn":3,"regex":"^[a-zA-Z0-\\.\\,;_-]+","pass":false,"score":2,"note":"adds - _ but base malformed"},{"turn":4,"regex":"^[a-zA-Z0-\\.\\,;_-]+$","pass":false,"score":2,"note":"has $ but base still malformed"}]'::jsonb,
      'score', 0.9,
      'method', 'weighted_mean_with_consistency_2runs',
      'method_formula', 'mean(all_runs)*0.6 + (success_count/total_turns)*5*0.4',
      'success_count', 0,
      'total_turns', 8,
      'updated_at', '2026-09-12T13:45:00Z',
      'test_source', 'real_app_e2e_2runs',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '0.9'
WHERE uuid = 'e97f9fab-4ef1-4f47-967b-83c61758e12e';

-- Qwen3.5 2B (uuid 86a8c42a-2d60-454a-b499-fcf45e028ac7)
-- Run 1: [5,5,4,4], Run 2: [5,5,5,5] -> combined: [5,5,4,4,5,5,5,5]
-- mean=4.75, success=8/8, score=4.9
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,4,4,5,5,5,5]'::jsonb,
      'runs_run1', '[5,5,4,4]'::jsonb,
      'runs_run2', '[5,5,5,5]'::jsonb,
      'per_turn_run1', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"regex":"^[a-zA-Z0-9.,;_-]+$","pass":true,"score":4,"note":"added _ early"},{"turn":4,"regex":"^[a-zA-Z0-9.,;_-_]+$","pass":true,"score":4,"note":"duplicate _ but correct"}]'::jsonb,
      'per_turn_run2', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"regex":"^[a-zA-Z0-9.,;-]+$","pass":true,"score":5},{"turn":4,"regex":"^[a-zA-Z0-9.,;-_]+$","pass":true,"score":5}]'::jsonb,
      'score', 4.9,
      'method', 'weighted_mean_with_consistency_2runs',
      'method_formula', 'mean(all_runs)*0.6 + (success_count/total_turns)*5*0.4',
      'success_count', 8,
      'total_turns', 8,
      'updated_at', '2026-09-12T13:45:00Z',
      'test_source', 'real_app_e2e_2runs',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '4.9'
WHERE uuid = '86a8c42a-2d60-454a-b499-fcf45e028ac7';

-- Qwen2.5 Coder 3B (uuid 438d4df0-6154-4762-ac9c-40f03b960cbc)
-- Run 1: [5,2,2,2], Run 2: [5,2,2,2] -> combined: [5,2,2,2,5,2,2,2]
-- mean=2.75, success=2/8, score=2.2
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,2,2,2,5,2,2,2]'::jsonb,
      'runs_run1', '[5,2,2,2]'::jsonb,
      'runs_run2', '[5,2,2,2]'::jsonb,
      'per_turn_run1', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,]+$","pass":false,"score":2,"note":"missing ;"},{"turn":3,"regex":"^[a-zA-Z0-9.,-]+$","pass":false,"score":2,"note":"still missing ;"},{"turn":4,"regex":"^[a-zA-Z0-9.,-_]+$","pass":false,"score":2,"note":"still missing ;"}]'::jsonb,
      'per_turn_run2', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,]+$","pass":false,"score":2,"note":"missing ;"},{"turn":3,"regex":"^[a-zA-Z0-9.,-]+$","pass":false,"score":2,"note":"still missing ;"},{"turn":4,"regex":"^[a-zA-Z0-9.,-_]+$","pass":false,"score":2,"note":"still missing ;"}]'::jsonb,
      'score', 2.2,
      'method', 'weighted_mean_with_consistency_2runs',
      'method_formula', 'mean(all_runs)*0.6 + (success_count/total_turns)*5*0.4',
      'success_count', 2,
      'total_turns', 8,
      'updated_at', '2026-09-12T13:45:00Z',
      'test_source', 'real_app_e2e_2runs',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '2.2'
WHERE uuid = '438d4df0-6154-4762-ac9c-40f03b960cbc';

-- Qwen3 4B (uuid 982dcd5a-bc1c-4e2e-81d6-81c735ab969b)
-- Run 1: [5,5,5,2], Run 2: [5,5,5,5] -> combined: [5,5,5,2,5,5,5,5]
-- mean=4.625, success=7/8, score=4.5
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,5,2,5,5,5,5]'::jsonb,
      'runs_run1', '[5,5,5,2]'::jsonb,
      'runs_run2', '[5,5,5,5]'::jsonb,
      'per_turn_run1', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"regex":"^[a-zA-Z0-9.,;-]+$","pass":true,"score":5},{"turn":4,"regex":"^[a-zA-Z0-9.,;-_+]$","pass":false,"score":2,"note":"+ inside class, missing quantifier"}]'::jsonb,
      'per_turn_run2', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"regex":"^[a-zA-Z0-9.,;-]+$","pass":true,"score":5},{"turn":4,"regex":"^[a-zA-Z0-9.,;-_]+$","pass":true,"score":5}]'::jsonb,
      'score', 4.5,
      'method', 'weighted_mean_with_consistency_2runs',
      'method_formula', 'mean(all_runs)*0.6 + (success_count/total_turns)*5*0.4',
      'success_count', 7,
      'total_turns', 8,
      'updated_at', '2026-09-12T13:45:00Z',
      'test_source', 'real_app_e2e_2runs',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '4.5'
WHERE uuid = '982dcd5a-bc1c-4e2e-81d6-81c735ab969b';

-- Qwen3.5 4B (uuid 17968455-0425-4cfe-b1db-1d4a540cf351)
-- Run 1: [5,5,5,5], Run 2: [5,2,1,1] -> combined: [5,5,5,5,5,2,1,1]
-- mean=3.625, success=5/8, score=3.4
-- Run 2: model crashed/stalled after turn 2 (WebGPU reload issue)
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,5,5,5,2,1,1]'::jsonb,
      'runs_run1', '[5,5,5,5]'::jsonb,
      'runs_run2', '[5,2,1,1]'::jsonb,
      'per_turn_run1', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"regex":"^[a-zA-Z0-9.,;-]+$","pass":true,"score":5},{"turn":4,"regex":"^[a-zA-Z0-9.,;-_]+$","pass":true,"score":5}]'::jsonb,
      'per_turn_run2', '[{"turn":1,"regex":"^[a-zA-Z0-9]+$","pass":true,"score":5,"note":"option B correct, A/C invalid"},{"turn":2,"regex":"^[a-zA-Z0-9]+$","pass":false,"score":2,"note":"all 3 options same, missing punctuation"},{"turn":3,"pass":false,"score":1,"note":"CRASH: no response, model stalled"},{"turn":4,"pass":false,"score":1,"note":"CRASH: no response, model stalled"}]'::jsonb,
      'score', 3.4,
      'method', 'weighted_mean_with_consistency_2runs',
      'method_formula', 'mean(all_runs)*0.6 + (success_count/total_turns)*5*0.4',
      'success_count', 5,
      'total_turns', 8,
      'updated_at', '2026-09-12T13:45:00Z',
      'test_source', 'real_app_e2e_2runs',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]',
      'crash_note', 'Run 2: model crashed/stalled after turn 2, possibly due to WebGPU reload. Turns 3-4 produced no response.'
    )
  ),
  rank = '3.4'
WHERE uuid = '17968455-0425-4cfe-b1db-1d4a540cf351';

COMMIT;
