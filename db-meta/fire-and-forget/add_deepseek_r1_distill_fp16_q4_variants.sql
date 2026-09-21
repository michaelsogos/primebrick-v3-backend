-- Fire-and-forget patch: register the missing dtype variants of
-- DeepSeek-R1-Distill-Qwen-1.5B-ONNX (fp16, q4) AND persist the final E2E
-- verdict for the whole family: NOT_COMPATIBLE.
--
-- Empirical result (2026-09-16, Smart Regex 5-turn incremental protocol):
-- the q4f16 sibling is an R1 thinking model: it burns 370-650 tokens of
-- <think> reasoning per turn (31-58s/turn, unusable latency), leaks the
-- thinking into the output stream, hallucinates requirements, and emits
-- malformed JSON at both temp 0.7 and 0.2. fp16/q4 marked NOT_COMPATIBLE
-- without download per protocol — the failure is thinking-model behaviour,
-- not weight precision.
--
-- download_size_mb = real file bytes from HF repo tree:
--   fp16: model_fp16.onnx 1444MB + model_fp16.onnx_data 1994MB + tokenizer ~9MB
--   q4:   model_q4.onnx 1875MB self-contained (inline weights) + tokenizer ~9MB
-- temperature kept at 0.20 as the documented retune baseline.

BEGIN;

INSERT INTO public.ai_models (uuid, model_id, name, label_key, description_key,
  power_level, is_enabled, enable_thinking, temperature, top_p, max_tokens,
  repetition_penalty, sort_order, created_by, updated_by, download_size_mb,
  vram_mb, compatibility_status, rank, dtype, engine_type)
VALUES
  ('a4444444-0000-4xxx0000-000000000401',
   'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX#fp16',
   'DeepSeek R1 Distill Qwen 1.5B (fp16)',
   'ai_model_deepseek_r1_distill_qwen_1_5b', 'ai_model_deepseek_r1_distill_qwen_1_5b_desc',
   1, false, false, '0.20', '0.90', 1024, '1.10', 164,
   'system_migration_dtype_coverage', 'system_migration_dtype_coverage',
   3448, 3500.00, 'NOT_COMPATIBLE', '1.0', 'fp16', 'transformersjs'),
  ('a4444444-0000-4xxx0000-000000000402',
   'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX#q4',
   'DeepSeek R1 Distill Qwen 1.5B (q4)',
   'ai_model_deepseek_r1_distill_qwen_1_5b', 'ai_model_deepseek_r1_distill_qwen_1_5b_desc',
   1, false, false, '0.20', '0.90', 1024, '1.10', 165,
   'system_migration_dtype_coverage', 'system_migration_dtype_coverage',
   1884, 2000.00, 'NOT_COMPATIBLE', '1.0', 'q4', 'transformersjs')
ON CONFLICT (uuid) DO NOTHING;

-- Fix rows already inserted in the interim enabled/UNTESTED state, and
-- persist the measured q4f16 test_scores.

UPDATE public.ai_models SET
  compatibility_status = 'NOT_COMPATIBLE',
  is_enabled = false,
  temperature = 0.20,
  rank = 0.9,
  test_scores = jsonb_build_object(
    'e2e_5turn_s1_fixed_v2', jsonb_build_object(
      'date', '2026-09-16',
      'protocol', 'S1/S2 5-turn incremental regex (aborted after T2 - latency gate)',
      'generation_config', jsonb_build_object('temperature',0.2,'top_p',0.9,'max_tokens',1024,'repetition_penalty',1.1,'do_sample',true,'enable_thinking',false,'kv_cache_reuse',false),
      'load_time_ms', 7349,
      'turns', jsonb_build_array(
        jsonb_build_object('n',1,'prompt','solo lettere e numeri','expected','^[a-zA-Z0-9]+$','actual','<think> 800+ token reasoning </think> {"patterns":[{"pattern":"^[a-z]+$","flags":"","pattern":"^[a-z0-9]+$","flags":"i"} x3 identical]}','parsed_regex',null,'score',1,'verdict','fail','reason','malformed JSON: duplicate pattern keys, object tripled; embedded regex also wrong (no uppercase)','response_s',57.8,'first_token_latency_ms',1493,'tokens_per_second',11.3,'tokens_generated',647,'prompt_token_count',573,'kv_hit_ratio',0),
        jsonb_build_object('n',2,'prompt','aggiungiamo anche il punto e la virgola','expected','^[a-zA-Z0-9.,]+$','actual','<think> reasoning </think> {"patterns":[{"pattern":"^[\\w\\.,]+","flags":"i"}]}','parsed_regex','^[\w\.,]+$','score',2,'verdict','partial','reason','valid JSON but \w over-accepts underscore (not requested)','response_s',31.4,'first_token_latency_ms',4006,'tokens_per_second',11.7,'tokens_generated',368,'prompt_token_count',1265,'kv_hit_ratio',0)
      ),
      'mean_turn_score', 1.5,
      'success', 0, 'total', 2,
      'score', 0.9,
      'notes', 'R1-distill thinking model: burns 370-650 tokens of <think> reasoning per turn -> 31-58s/turn, unusable latency even when JSON is valid. Format unstable across runs (T1 malformed duplicate keys). Prompt grows 573->1265 tokens unbounded (KV reuse off).'
    ),
    'initial_run_temp07', jsonb_build_object(
      'date', '2026-09-16',
      'generation_config', jsonb_build_object('temperature',0.7,'top_p',0.9,'max_tokens',1024,'repetition_penalty',1.1),
      'turns', jsonb_build_array(
        jsonb_build_object('n',1,'actual','^[a-zA-Z0-9._,.]+$','score',2,'verdict','partial','reason','base correct but added unrequested ._, chars','response_s',35.7),
        jsonb_build_object('n',2,'actual','<think> English reasoning hallucinating unrequested ampersand + truncated JSON </think>','score',1,'verdict','fail','reason','thinking leak, requirement hallucination, truncated output','response_s',49.2),
        jsonb_build_object('n',3,'actual','','score',1,'verdict','fail','reason','empty response + console errors','response_s',4.5)
      ),
      'notes', 'temp 0.7: thinking leak into output stream, hallucinated requirements (ampersand), T3 empty.'
    )
  ),
  updated_at = now()
WHERE model_id = 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX#q4f16';

UPDATE public.ai_models SET
  compatibility_status = 'NOT_COMPATIBLE',
  is_enabled = false,
  temperature = 0.20,
  test_scores = COALESCE(test_scores, '{}'::jsonb) || jsonb_build_object(
    'marked_not_compatible', jsonb_build_object(
      'date','2026-09-16',
      'reason','sibling q4f16 failed e2e: R1 thinking overhead (31-58s/turn) + unstable JSON format across temperatures. NOT_COMPATIBLE without download per protocol.',
      'generation_config', jsonb_build_object('temperature',0.2,'top_p',0.9,'max_tokens',1024,'repetition_penalty',1.1)
    )
  ),
  updated_at = now()
WHERE model_id IN ('onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX#fp16','onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX#q4');

COMMIT;
