-- Fire-and-forget migration: update test_scores and rank for all 7 compatible models
-- based on empirical real-app e2e testing (4-turn Smart Regex conversation).
--
-- Scoring method: weighted_mean_with_consistency
--   score = mean(runs) * 0.6 + (success_count / total_turns) * 5 * 0.4
--   where success = per-turn score >= 4
--   rank = rounded score (1 decimal)
--
-- This replaces the previous pure-mean method that failed to distinguish
-- Qwen3-4B [5,5,3,5,4] from Qwen3.5-4B [2,5,5,5,5].

BEGIN;

-- Qwen2.5 1.5B (uuid 07f78259-ae89-419e-b36d-45d8750d9442)
-- Real-app: [5,1,1,1] -> 1/4 correct, mean=2.0, score=1.7
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,1,1,1]'::jsonb,
      'per_turn', '[{"turn":1,"input":"solo lettere e numeri","regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"input":"con anche punti, virgole e punto virgola","regex":"^[a-zA-Z0-9.,.]+$","pass":false,"score":1,"note":"missing ; duplicate ."},{"turn":3,"input":"aggiungi il trattino","regex":"^[a-zA-Z0-9.,.\\-]+$","pass":false,"score":1,"note":"builds on wrong prior state"},{"turn":4,"input":"ora aggiungi anche underscore e punto","regex":"^[a-zA-Z0-9.,./\\-.\\_]+$","pass":false,"score":1,"note":"malformed"}]'::jsonb,
      'score', 1.7,
      'method', 'weighted_mean_with_consistency',
      'method_formula', 'mean(runs)*0.6 + (success_count/total)*5*0.4',
      'success_count', 1,
      'total_turns', 4,
      'updated_at', '2026-09-12T10:45:00Z',
      'test_source', 'real_app_e2e',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '1.7'
WHERE uuid = '07f78259-ae89-419e-b36d-45d8750d9442';

-- Qwen2.5 Coder 1.5B (uuid 75abab16-83b5-45bf-a582-41e96ff615d7)
-- Real-app: [5,5,5,5] -> 4/4 correct, mean=5.0, score=5.0
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,5,5]'::jsonb,
      'per_turn', '[{"turn":1,"input":"solo lettere e numeri","regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"input":"con anche punti, virgole e punto virgola","regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"input":"aggiungi il trattino","regex":"^[a-zA-Z0-9.,;-]+$","pass":true,"score":5},{"turn":4,"input":"ora aggiungi anche underscore e punto","regex":"^[a-zA-Z0-9.,;-_]+$","pass":true,"score":5}]'::jsonb,
      'score', 5.0,
      'method', 'weighted_mean_with_consistency',
      'method_formula', 'mean(runs)*0.6 + (success_count/total)*5*0.4',
      'success_count', 4,
      'total_turns', 4,
      'updated_at', '2026-09-12T10:45:00Z',
      'test_source', 'real_app_e2e',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '5.0'
WHERE uuid = '75abab16-83b5-45bf-a582-41e96ff615d7';

-- Qwen3 1.7B (uuid e97f9fab-4ef1-4f47-967b-83c61758e12e)
-- Real-app: [1,1,2,2] -> 0/4 correct, mean=1.5, score=0.9
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[1,1,2,2]'::jsonb,
      'per_turn', '[{"turn":1,"input":"solo lettere e numeri","regex":"^[a-zA-Z0-isdigit]+$","pass":false,"score":1,"note":"uses literal isdigit token"},{"turn":2,"input":"con anche punti, virgole e punto virgola","regex":"^[a-zA-Z0-isdigit\\.;\\]+$","pass":false,"score":1,"note":"base wrong"},{"turn":3,"input":"aggiungi il trattino","regex":"^[a-zA-Z0-isdigit\\.;\\-]+$","pass":false,"score":2,"note":"adds - but base wrong"},{"turn":4,"input":"ora aggiungi anche underscore e punto","regex":"^[a-zA-Z0-isdigit\\.;\\-_]+$","pass":false,"score":2,"note":"adds _ but base wrong"}]'::jsonb,
      'score', 0.9,
      'method', 'weighted_mean_with_consistency',
      'method_formula', 'mean(runs)*0.6 + (success_count/total)*5*0.4',
      'success_count', 0,
      'total_turns', 4,
      'updated_at', '2026-09-12T10:45:00Z',
      'test_source', 'real_app_e2e',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '0.9'
WHERE uuid = 'e97f9fab-4ef1-4f47-967b-83c61758e12e';

-- Qwen3.5 2B (uuid 86a8c42a-2d60-454a-b499-fcf45e028ac7)
-- Real-app: [5,5,4,4] -> 4/4 success, mean=4.5, score=4.7
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,4,4]'::jsonb,
      'per_turn', '[{"turn":1,"input":"solo lettere e numeri","regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"input":"con anche punti, virgole e punto virgola","regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"input":"aggiungi il trattino","regex":"^[a-zA-Z0-9.,;_-]+$","pass":true,"score":4,"note":"also added _ early"},{"turn":4,"input":"ora aggiungi anche underscore e punto","regex":"^[a-zA-Z0-9.,;_-_]+$","pass":true,"score":4,"note":"duplicate _ but semantically correct"}]'::jsonb,
      'score', 4.7,
      'method', 'weighted_mean_with_consistency',
      'method_formula', 'mean(runs)*0.6 + (success_count/total)*5*0.4',
      'success_count', 4,
      'total_turns', 4,
      'updated_at', '2026-09-12T10:45:00Z',
      'test_source', 'real_app_e2e',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '4.7'
WHERE uuid = '86a8c42a-2d60-454a-b499-fcf45e028ac7';

-- Qwen2.5 Coder 3B (uuid 438d4df0-6154-4762-ac9c-40f03b960cbc)
-- Real-app: [5,2,2,2] -> 1/4 success, mean=2.75, score=2.2
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,2,2,2]'::jsonb,
      'per_turn', '[{"turn":1,"input":"solo lettere e numeri","regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"input":"con anche punti, virgole e punto virgola","regex":"^[a-zA-Z0-9.,]+$","pass":false,"score":2,"note":"missing ;"},{"turn":3,"input":"aggiungi il trattino","regex":"^[a-zA-Z0-9.,-]+$","pass":false,"score":2,"note":"still missing ;"},{"turn":4,"input":"ora aggiungi anche underscore e punto","regex":"^[a-zA-Z0-9.,-_]+$","pass":false,"score":2,"note":"still missing ;"}]'::jsonb,
      'score', 2.2,
      'method', 'weighted_mean_with_consistency',
      'method_formula', 'mean(runs)*0.6 + (success_count/total)*5*0.4',
      'success_count', 1,
      'total_turns', 4,
      'updated_at', '2026-09-12T10:45:00Z',
      'test_source', 'real_app_e2e',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '2.2'
WHERE uuid = '438d4df0-6154-4762-ac9c-40f03b960cbc';

-- Qwen3 4B (uuid 982dcd5a-bc1c-4e2e-81d6-81c735ab969b)
-- Real-app: [5,5,5,2] -> 3/4 success, mean=4.25, score=4.1
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,5,2]'::jsonb,
      'per_turn', '[{"turn":1,"input":"solo lettere e numeri","regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"input":"con anche punti, virgole e punto virgola","regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"input":"aggiungi il trattino","regex":"^[a-zA-Z0-9.,;-]+$","pass":true,"score":5},{"turn":4,"input":"ora aggiungi anche underscore e punto","regex":"^[a-zA-Z0-9.,;-_+]$","pass":false,"score":2,"note":"+ inside class, missing quantifier"}]'::jsonb,
      'score', 4.1,
      'method', 'weighted_mean_with_consistency',
      'method_formula', 'mean(runs)*0.6 + (success_count/total)*5*0.4',
      'success_count', 3,
      'total_turns', 4,
      'updated_at', '2026-09-12T10:45:00Z',
      'test_source', 'real_app_e2e',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '4.1'
WHERE uuid = '982dcd5a-bc1c-4e2e-81d6-81c735ab969b';

-- Qwen3.5 4B (uuid 17968455-0425-4cfe-b1db-1d4a540cf351)
-- Real-app: [5,5,5,5] -> 4/4 success, mean=5.0, score=5.0
UPDATE ai_models SET
  test_scores = jsonb_build_object(
    'regex_test_score', jsonb_build_object(
      'runs', '[5,5,5,5]'::jsonb,
      'per_turn', '[{"turn":1,"input":"solo lettere e numeri","regex":"^[a-zA-Z0-9]+$","pass":true,"score":5},{"turn":2,"input":"con anche punti, virgole e punto virgola","regex":"^[a-zA-Z0-9.,;]+$","pass":true,"score":5},{"turn":3,"input":"aggiungi il trattino","regex":"^[a-zA-Z0-9.,;-]+$","pass":true,"score":5},{"turn":4,"input":"ora aggiungi anche underscore e punto","regex":"^[a-zA-Z0-9.,;-_]+$","pass":true,"score":5}]'::jsonb,
      'score', 5.0,
      'method', 'weighted_mean_with_consistency',
      'method_formula', 'mean(runs)*0.6 + (success_count/total)*5*0.4',
      'success_count', 4,
      'total_turns', 4,
      'updated_at', '2026-09-12T10:45:00Z',
      'test_source', 'real_app_e2e',
      'test_prompts', '["solo lettere e numeri","con anche punti, virgole e punto virgola","aggiungi il trattino","ora aggiungi anche underscore e punto"]'
    )
  ),
  rank = '5.0'
WHERE uuid = '17968455-0425-4cfe-b1db-1d4a540cf351';

COMMIT;
