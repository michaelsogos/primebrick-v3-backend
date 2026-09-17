-- Fire-and-forget patch: register the missing dtype variants of
-- granite-3.0-2b-instruct (fp16, q4) AND persist the final E2E verdict for
-- the whole family: NOT_COMPATIBLE.
--
-- Empirical result (2026-09-16, Smart Regex 5-turn incremental protocol):
-- q4f16 loads and emits parseable regex JSON, but cannot follow incremental
-- edit instructions (ignores modifications, hallucinates character classes,
-- degenerates into repeated escapes). Same failure class at temperature
-- 0.7 (prose loop), 0.2 and 0 (spurious chars / stale repeats). fp16/q4
-- marked NOT_COMPATIBLE without download per protocol — the failure is
-- instruction-following, not weight precision.
--
-- download_size_mb = real file bytes from HF repo tree
-- (fp16: model_fp16.onnx 1MB + model_fp16.onnx_data 4832MB + config ~5MB;
--  q4: model_q4.onnx 1836MB self-contained + config ~5MB).
-- temperature kept at 0.20 as the documented retune baseline.

BEGIN;

INSERT INTO public.ai_models (uuid, model_id, name, label_key, description_key,
  power_level, is_enabled, enable_thinking, temperature, top_p, max_tokens,
  repetition_penalty, sort_order, created_by, updated_by, download_size_mb,
  vram_mb, compatibility_status, rank, dtype, engine_type)
VALUES
  ('a3333333-0000-0000-0000-000000000401',
   'onnx-community/granite-3.0-2b-instruct#fp16',
   'Granite 3.0 2B Instruct (fp16)',
   'ai_model_granite_3_0_2b_instruct', 'ai_model_granite_3_0_2b_instruct_desc',
   1, false, false, '0.20', '0.90', 256, '1.10', 166,
   'system_migration_dtype_coverage', 'system_migration_dtype_coverage',
   4838, 2000.00, 'NOT_COMPATIBLE', '1.0', 'fp16', 'transformersjs'),
  ('a3333333-0000-0000-0000-000000000402',
   'onnx-community/granite-3.0-2b-instruct#q4',
   'Granite 3.0 2B Instruct (q4)',
   'ai_model_granite_3_0_2b_instruct', 'ai_model_granite_3_0_2b_instruct_desc',
   1, false, false, '0.20', '0.90', 256, '1.10', 167,
   'system_migration_dtype_coverage', 'system_migration_dtype_coverage',
   1841, 2000.00, 'NOT_COMPATIBLE', '1.0', 'q4', 'transformersjs')
ON CONFLICT (uuid) DO NOTHING;

-- Fix rows that were already inserted in the interim enabled/UNTESTED state,
-- and persist the measured q4f16 test_scores.

UPDATE public.ai_models SET
  compatibility_status = 'NOT_COMPATIBLE',
  is_enabled = false,
  temperature = 0.20,
  rank = 0.8,
  test_scores = jsonb_build_object(
    'e2e_5turn_s1_fixed_v2', jsonb_build_object(
      'date', '2026-09-16',
      'protocol', 'S1/S2 5-turn incremental regex',
      'generation_config', jsonb_build_object('temperature',0.2,'top_p',0.9,'max_tokens',256,'repetition_penalty',1.1,'do_sample',true,'enable_thinking',false,'kv_cache_reuse',false),
      'load_time_ms', 9136,
      'turns', jsonb_build_array(
        jsonb_build_object('n',1,'prompt','solo lettere e numeri','expected','^[a-zA-Z0-9]+$','actual','^[a-z0-9]+$','score',2,'verdict','partial','reason','missing uppercase class','response_s',8.1,'first_token_latency_ms',2287,'tokens_per_second',3.2,'tokens_generated',26,'prompt_token_count',633,'kv_hit_ratio',0),
        jsonb_build_object('n',2,'prompt','aggiungiamo anche il punto e la virgola','expected','^[a-zA-Z0-9.,]+$','actual','^[a-z0-9.,\.\-]+$','score',2,'verdict','partial','reason','added unrequested dash, duplicated dot, still no uppercase','response_s',11.8,'first_token_latency_ms',2043,'tokens_per_second',4.2,'tokens_generated',50,'prompt_token_count',719,'kv_hit_ratio',0),
        jsonb_build_object('n',3,'prompt','aggiungiamo underscore e trattino','expected','^[a-zA-Z0-9.,_-]+$','actual','^[a-z0-9\,\-\_\+]+$','score',1,'verdict','fail','reason','spurious +, lost dot, mangled escapes','response_s',12.8,'first_token_latency_ms',2401,'tokens_per_second',4.0,'tokens_generated',51,'prompt_token_count',830,'kv_hit_ratio',0),
        jsonb_build_object('n',4,'prompt','rimuoviamo il punto','expected','^[a-zA-Z0-9_-]+$','actual','^[a-z0-9\,\-\_\_\_]+$','score',1,'verdict','fail','reason','repeated escaped underscores, ignored instruction','response_s',13.3,'first_token_latency_ms',3012,'tokens_per_second',3.8,'tokens_generated',51,'prompt_token_count',940,'kv_hit_ratio',0),
        jsonb_build_object('n',5,'prompt','solo lettere minuscole da 3 a 5 caratteri','expected','^[a-z]{3,5}$','actual','^[a-z0-9\,\-\_\_\_]+$','score',1,'verdict','fail','reason','stale garbage regex, no length bound','response_s',11.0,'first_token_latency_ms',3134,'tokens_per_second',3.6,'tokens_generated',40,'prompt_token_count',1040,'kv_hit_ratio',0)
      ),
      'mean_turn_score', 1.4,
      'success', 0, 'total', 5,
      'score', 0.8,
      'notes', 'Model loads and emits parseable JSON/regex (unlike 350M Web prose), but cannot follow incremental edit instructions: ignores modifications, hallucinates character classes, degenerates into repeated escapes. KV reuse disabled - prompt grows 633->1040 tokens unbounded.'
    ),
    'retest_temp0_partial', jsonb_build_object(
      'date', '2026-09-16',
      'generation_config', jsonb_build_object('temperature',0,'top_p',0.9,'max_tokens',256,'repetition_penalty',1.1),
      'turns_completed', 4,
      'outputs', jsonb_build_array('^[a-z0-9]+$','^[a-z0-9.,\.\)]+$','^[a-z0-9.,\.\)]+$','^[a-z0-9.,\)]+$'),
      'notes', 'Greedy decoding: same failure class - spurious \) char, stale repeats, T3 took 58s (256-token cap). Confirms temperature is not the root cause.'
    ),
    'initial_run_temp07', jsonb_build_object(
      'date', '2026-09-16',
      'generation_config', jsonb_build_object('temperature',0.7,'top_p',0.9,'max_tokens',1024,'repetition_penalty',1.1),
      't1_output', 'long repetitive Italian prose, no parseable regex',
      'verdict', 'fail - prose loop'
    )
  ),
  updated_at = now()
WHERE model_id = 'onnx-community/granite-3.0-2b-instruct#q4f16';

UPDATE public.ai_models SET
  compatibility_status = 'NOT_COMPATIBLE',
  is_enabled = false,
  temperature = 0.20,
  test_scores = COALESCE(test_scores, '{}'::jsonb) || jsonb_build_object(
    'marked_not_compatible', jsonb_build_object(
      'date','2026-09-16',
      'reason','sibling q4f16 failed e2e 5-turn (score 0.8): cannot follow incremental regex-edit instructions. NOT_COMPATIBLE without download per protocol.',
      'generation_config', jsonb_build_object('temperature',0.2,'top_p',0.9,'max_tokens',256,'repetition_penalty',1.1)
    )
  ),
  updated_at = now()
WHERE model_id IN ('onnx-community/granite-3.0-2b-instruct#fp16','onnx-community/granite-3.0-2b-instruct#q4');

COMMIT;
