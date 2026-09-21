-- Fire-and-forget patch: normalize ai_models.test_scores to the canonical
-- per-case shape and remove precomputed aggregates.
--
-- Canonical shape: every test case lives under a `*_test_score` key holding
-- raw evidence only (turns, configs, load, note, tested_at, prior score).
-- Aggregates (quality/speed/score) are computed on the fly by the FE parser
-- — see docs/modules/ai-models.md scoring formulas.
--
-- What this script does, per row:
--   1. flat-shape evidence (top-level turns/protocol/generation_config/…)
--      is wrapped into `regex_test_score`;
--   2. legacy nested objects that are NOT `*_test_score` cases
--      (e2e_5turn*, initial_run_temp07, prior_smoke_test, weights,
--      baseline_temp_07, retest_temp0_partial, metrics, …) are preserved
--      under `prior_runs`;
--   3. precomputed top-level aggregates are dropped:
--      score_detail, score, perf.
--
-- A full backup of the original values is kept in
-- public.ai_models_test_scores_backup_20260921.

BEGIN;

CREATE TABLE IF NOT EXISTS public.ai_models_test_scores_backup_20260921 AS
  SELECT uuid, model_id, test_scores FROM public.ai_models WHERE test_scores IS NOT NULL;

WITH moved AS (
  SELECT
    m.uuid,
    -- evidence keys that become the regex case when found at top level
    jsonb_strip_nulls(jsonb_build_object(
      'turns',             m.test_scores -> 'turns',
      'protocol',          m.test_scores -> 'protocol',
      'generation_config', m.test_scores -> 'generation_config',
      'execution_config',  m.test_scores -> 'execution_config',
      'load',              m.test_scores -> 'load',
      'load_ok',           m.test_scores -> 'load_ok',
      'generation_ok',     m.test_scores -> 'generation_ok',
      'note',              m.test_scores -> 'note',
      'tested_at',         m.test_scores -> 'tested_at',
      'score',             m.test_scores -> 'score',
      'error',             m.test_scores -> 'error'
    )) AS regex_case,
    -- top-level keys that are evidence moved into the case or dropped
    m.test_scores - 'turns' - 'protocol' - 'generation_config' - 'execution_config'
      - 'load' - 'load_ok' - 'generation_ok' - 'note' - 'score'
      - 'score_detail' - 'perf' - 'error' AS remainder
  FROM public.ai_models m
  WHERE m.test_scores IS NOT NULL
),
classified AS (
  SELECT
    mv.uuid,
    mv.regex_case,
    -- object-valued remainder keys that are NOT *_test_score cases → prior_runs
    (SELECT COALESCE(jsonb_object_agg(k, v), '{}'::jsonb)
       FROM jsonb_each(mv.remainder) e(k, v)
      WHERE jsonb_typeof(v) = 'object'
        AND k NOT LIKE '%\_test\_score' ESCAPE '\'
        AND k NOT IN ('load_error')) AS prior_runs,
    -- surviving top-level: scalars + real *_test_score cases + load_error + tested_at
    (SELECT COALESCE(jsonb_object_agg(k, v), '{}'::jsonb)
       FROM jsonb_each(mv.remainder) e(k, v)
      WHERE k LIKE '%\_test\_score' ESCAPE '\'
         OR jsonb_typeof(v) <> 'object'
         OR k = 'load_error') AS surviving
  FROM moved mv
)
UPDATE public.ai_models m
SET test_scores =
  classified.surviving
  || CASE
       WHEN classified.regex_case <> '{}'::jsonb
         THEN jsonb_build_object('regex_test_score',
              classified.regex_case
              || CASE WHEN classified.prior_runs <> '{}'::jsonb
                      THEN jsonb_build_object('prior_runs', classified.prior_runs)
                      ELSE '{}'::jsonb END)
       WHEN classified.prior_runs <> '{}'::jsonb
         THEN jsonb_build_object('prior_runs', classified.prior_runs)
       ELSE '{}'::jsonb
     END,
    updated_at = now()
FROM classified
WHERE m.uuid = classified.uuid;

COMMIT;
