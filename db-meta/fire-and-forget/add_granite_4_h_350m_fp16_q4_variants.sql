-- Fire-and-forget patch: register and persist the final three-dtype Smart Regex
-- E2E verdict for Granite 4.0 H 350M. All dtypes are NOT_COMPATIBLE: no turn
-- reached the success threshold in either the 0.7 baseline or 0.2 tuned run.

BEGIN;

INSERT INTO public.ai_models (
  uuid, model_id, name, power_level, is_enabled, enable_thinking,
  temperature, top_p, max_tokens, repetition_penalty, sort_order,
  created_by, updated_by, download_size_mb, vram_mb,
  compatibility_status, rank, dtype, engine_type, execution_config
) VALUES
  ('a5555555-0000-4000-8000-000000000401',
   'onnx-community/granite-4.0-h-350m-ONNX#q4',
   'Granite-4.0-H-350m (q4)', 1, false, false,
   0.20, 0.90, 256, 1.10, 177,
   'system_granite_h_retest', 'system_granite_h_retest', 253, NULL,
   'NOT_COMPATIBLE', 1.0, 'q4', 'transformersjs', '{"kv_cache_reuse":false,"sliding_window":true}'::jsonb),
  ('a5555555-0000-4000-8000-000000000402',
   'onnx-community/granite-4.0-h-350m-ONNX#fp16',
   'Granite-4.0-H-350m (fp16)', 1, false, false,
   0.20, 0.90, 256, 1.10, 178,
   'system_granite_h_retest', 'system_granite_h_retest', 655, NULL,
   'NOT_COMPATIBLE', 1.4, 'fp16', 'transformersjs', '{"kv_cache_reuse":false,"sliding_window":true}'::jsonb)
ON CONFLICT (uuid) DO NOTHING;

UPDATE public.ai_models SET
  power_level = 1, is_enabled = false, compatibility_status = 'NOT_COMPATIBLE',
  temperature = 0.20, max_tokens = 256, rank = 1.0,
  download_size_mb = 231, vram_mb = NULL,
  execution_config = '{"kv_cache_reuse":false,"sliding_window":true}'::jsonb,
  test_scores = jsonb_build_object(
    'protocol', 'e2e_5turn_s1_fixed_v2_retest',
    'tested_at', '2026-09-16T18:20:00.000Z',
    'score_detail', jsonb_build_object('quality',0.96,'speed',1.0,'score',1.0,'success','0/5'),
    'generation_config', jsonb_build_object('temperature',0.2,'top_p',0.9,'max_tokens',256,'repetition_penalty',1.1,'do_sample',true,'enable_thinking',false),
    'execution_config', jsonb_build_object('kv_cache_reuse',false,'sliding_window',true),
    'weights', jsonb_build_object('model_onnx_bytes',1905888,'external_data_bytes',236435712,'shared_cache_bytes',4140297,'measured_cache_bytes',242481897),
    'load', jsonb_build_object('load_time_ms',16303,'warmup_time_ms',0,'memory_usage_bytes',NULL,'vram_measurement','unavailable via WebGPU API'),
    'turns', jsonb_build_array(
      jsonb_build_object('n',1,'prompt','solo lettere e numeri','expected','^[a-zA-Z0-9]+$','actual','^\w+$','actual_response',$raw${"patterns": [{"pattern": "^\\w+$", "flags": ""}]}$raw$,'score',2,'verdict','partial','reason','\\w also accepts underscore','response_s',8.024,'speed_score',2,'first_token_latency_ms',5393,'tokens_per_second',2.0,'tokens_generated',16,'prompt_token_count',599,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',2,'prompt','aggiungiamo anche il punto e la virgola','expected','^[a-zA-Z0-9.,]+$','actual',NULL,'actual_response',$raw${"patterns": [{"pattern": "^\\w+$", "flags": ""}, {"pattern": "^\\.", "flags": "."}, {"pattern": "^\\,", "flags": ","}]$raw$,'score',1,'verdict','fail','reason','malformed JSON and invalid flags','response_s',10.722,'speed_score',0,'first_token_latency_ms',3278,'tokens_per_second',3.5,'tokens_generated',38,'prompt_token_count',668,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',3,'prompt','aggiungiamo underscore e trattino','expected','^[a-zA-Z0-9.,_-]+$','actual',NULL,'actual_response',$raw${"patterns": [{"pattern": "^\\w+$", "flags": ""}, {"pattern": "^_+", "flags": "+"}]$raw$,'score',1,'verdict','fail','reason','malformed JSON and invalid flag','response_s',11.002,'speed_score',0,'first_token_latency_ms',3928,'tokens_per_second',2.5,'tokens_generated',27,'prompt_token_count',755,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',4,'prompt','rimuoviamo il punto','expected','^[a-zA-Z0-9_-]+$','actual','^\w+$','actual_response',$raw${"patterns": [{"pattern": "^\\w+$", "flags": ""}]}$raw$,'score',2,'verdict','partial','reason','ignored edit and over-accepts underscore history','response_s',7.49,'speed_score',2,'first_token_latency_ms',4252,'tokens_per_second',2.1,'tokens_generated',16,'prompt_token_count',830,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',5,'prompt','solo lettere minuscole da 3 a 5 caratteri','expected','^[a-z]{3,5}$','actual','^\w{3,5}$','actual_response',$raw${"patterns": [{"pattern": "^\\w{3,5}$", "flags": ""}]}$raw$,'score',2,'verdict','partial','reason','accepts uppercase, digits and underscore','response_s',9.164,'speed_score',1,'first_token_latency_ms',4316,'tokens_per_second',2.2,'tokens_generated',20,'prompt_token_count',894,'kv_cache_hit_ratio',0)
    ),
    'baseline_temp_07', jsonb_build_object('success','0/5','outputs',jsonb_build_array('\u00ac','^\.\.','^\.','\.','^.{3,5}$'),'response_s',jsonb_build_array(8.042,5.357,7.368,8.678,11.179),'notes','Same failure class with more sampling drift.'),
    'notes', 'No successful turns. Emits valid-but-wrong regexes, malformed multi-choice JSON and invalid regex flags. Temperature 0.2 did not fix instruction following.'
  ),
  updated_at = now(), updated_by = 'system_granite_h_retest'
WHERE model_id = 'onnx-community/granite-4.0-h-350m-ONNX#q4f16';

UPDATE public.ai_models SET
  power_level = 1, is_enabled = false, compatibility_status = 'NOT_COMPATIBLE',
  temperature = 0.20, max_tokens = 256, rank = 1.0,
  download_size_mb = 253, vram_mb = NULL,
  execution_config = '{"kv_cache_reuse":false,"sliding_window":true}'::jsonb,
  test_scores = jsonb_build_object(
    'protocol', 'e2e_5turn_s1_fixed_v2_retest',
    'tested_at', '2026-09-16T18:22:00.000Z',
    'score_detail', jsonb_build_object('quality',0.96,'speed',1.4,'score',1.0,'success','0/5'),
    'generation_config', jsonb_build_object('temperature',0.2,'top_p',0.9,'max_tokens',256,'repetition_penalty',1.1,'do_sample',true,'enable_thinking',false),
    'execution_config', jsonb_build_object('kv_cache_reuse',false,'sliding_window',true),
    'weights', jsonb_build_object('model_onnx_bytes',1849840,'external_data_bytes',258859776,'shared_cache_bytes',4140297,'measured_cache_bytes',264849913),
    'load', jsonb_build_object('load_time_ms',17130,'warmup_time_ms',0,'memory_usage_bytes',NULL,'vram_measurement','unavailable via WebGPU API'),
    'turns', jsonb_build_array(
      jsonb_build_object('n',1,'prompt','solo lettere e numeri','expected','^[a-zA-Z0-9]+$','actual','^\w+$','actual_response',$raw${"patterns": [{"pattern": "^\\w+$", "flags": ""}]}$raw$,'score',2,'verdict','partial','reason','\\w also accepts underscore','response_s',11.326,'speed_score',0,'first_token_latency_ms',7378,'tokens_per_second',1.4,'tokens_generated',16,'prompt_token_count',599,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',2,'prompt','aggiungiamo anche il punto e la virgola','expected','^[a-zA-Z0-9.,]+$','actual',NULL,'actual_response',$raw${"patterns": [{"pattern": "^\\w+$", "flags": ""}, {"pattern": "^\\.", "flags": "."}]}$raw$,'score',1,'verdict','fail','reason','invalid regex flag and no combined pattern','response_s',9.908,'speed_score',1,'first_token_latency_ms',3846,'tokens_per_second',2.8,'tokens_generated',28,'prompt_token_count',668,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',3,'prompt','aggiungiamo underscore e trattino','expected','^[a-zA-Z0-9.,_-]+$','actual',NULL,'actual_response',$raw${"patterns": [{"pattern": "^\\w+$", "flags": ""}, {"pattern": "^_+", "flags": "+"}]$raw$,'score',1,'verdict','fail','reason','malformed JSON and invalid flag','response_s',8.515,'speed_score',2,'first_token_latency_ms',4036,'tokens_per_second',3.2,'tokens_generated',27,'prompt_token_count',745,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',4,'prompt','rimuoviamo il punto','expected','^[a-zA-Z0-9_-]+$','actual','^\w+$','actual_response',$raw${"patterns": [{"pattern": "^\\w+$", "flags": ""}]}$raw$,'score',2,'verdict','partial','reason','stale response; ignores previous requested characters','response_s',7.177,'speed_score',2,'first_token_latency_ms',4343,'tokens_per_second',2.2,'tokens_generated',16,'prompt_token_count',820,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',5,'prompt','solo lettere minuscole da 3 a 5 caratteri','expected','^[a-z]{3,5}$','actual','^\w{3,5}$','actual_response',$raw${"patterns": [{"pattern": "^\\w{3,5}$", "flags": ""}]}$raw$,'score',2,'verdict','partial','reason','accepts uppercase, digits and underscore','response_s',7.72,'speed_score',2,'first_token_latency_ms',4381,'tokens_per_second',2.6,'tokens_generated',20,'prompt_token_count',884,'kv_cache_hit_ratio',0)
    ),
    'baseline_temp_07', jsonb_build_object('success','0/5','outputs',jsonb_build_array('^\w+$','^\w+$','^\w+$','^\w+$','^\w{3,5}$'),'response_s',jsonb_build_array(8.217,5.34,5.321,8.899,8.755),'notes','Stale repeated answer; temperature 0.2 did not improve quality.'),
    'notes', 'No successful turns. Repeats ^\\w+$ and cannot combine incremental edits; malformed alternatives use invalid flags.'
  ),
  updated_at = now(), updated_by = 'system_granite_h_retest'
WHERE model_id = 'onnx-community/granite-4.0-h-350m-ONNX#q4';

UPDATE public.ai_models SET
  power_level = 1, is_enabled = false, compatibility_status = 'NOT_COMPATIBLE',
  temperature = 0.20, max_tokens = 256, rank = 1.4,
  download_size_mb = 655, vram_mb = NULL,
  execution_config = '{"kv_cache_reuse":false,"sliding_window":true}'::jsonb,
  test_scores = jsonb_build_object(
    'protocol', 'e2e_5turn_s1_fixed_v2_retest',
    'tested_at', '2026-09-16T18:24:00.000Z',
    'score_detail', jsonb_build_object('quality',1.08,'speed',2.8,'score',1.4,'success','0/5'),
    'generation_config', jsonb_build_object('temperature',0.2,'top_p',0.9,'max_tokens',256,'repetition_penalty',1.1,'do_sample',true,'enable_thinking',false),
    'execution_config', jsonb_build_object('kv_cache_reuse',false,'sliding_window',true),
    'weights', jsonb_build_object('model_onnx_bytes',1823316,'external_data_bytes',681315840,'shared_cache_bytes',4140297,'measured_cache_bytes',687279453),
    'load', jsonb_build_object('load_time_ms',41005,'warmup_time_ms',0,'memory_usage_bytes',NULL,'vram_measurement','unavailable via WebGPU API'),
    'turns', jsonb_build_array(
      jsonb_build_object('n',1,'prompt','solo lettere e numeri','expected','^[a-zA-Z0-9]+$','actual','\p{Letter}+','actual_response',$raw${"patterns": [{"pattern": "\\p{Letter}+", "flags": ""}]}$raw$,'score',2,'verdict','partial','reason','letters only, no digits or anchors','response_s',9.081,'speed_score',1,'first_token_latency_ms',6099,'tokens_per_second',2.0,'tokens_generated',18,'prompt_token_count',599,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',2,'prompt','aggiungiamo anche il punto e la virgola','expected','^[a-zA-Z0-9.,]+$','actual','\\.','actual_response',$raw${"patterns": [{"pattern": "\\\\.", "flags": ""}]}$raw$,'score',2,'verdict','partial','reason','matches a backslash sequence instead of the requested class','response_s',5.33,'speed_score',3,'first_token_latency_ms',3208,'tokens_per_second',2.6,'tokens_generated',14,'prompt_token_count',672,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',3,'prompt','aggiungiamo underscore e trattino','expected','^[a-zA-Z0-9.,_-]+$','actual','_','actual_response',$raw${"patterns": [{"pattern": "_", "flags": ""}]}$raw$,'score',2,'verdict','partial','reason','only underscore; lost the existing class','response_s',5.487,'speed_score',3,'first_token_latency_ms',3374,'tokens_per_second',2.4,'tokens_generated',13,'prompt_token_count',733,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',4,'prompt','rimuoviamo il punto','expected','^[a-zA-Z0-9_-]+$','actual',NULL,'actual_response','{"patterns": []}','score',1,'verdict','fail','reason','empty patterns array','response_s',4.267,'speed_score',4,'first_token_latency_ms',3881,'tokens_per_second',1.2,'tokens_generated',5,'prompt_token_count',791,'kv_cache_hit_ratio',0),
      jsonb_build_object('n',5,'prompt','solo lettere minuscole da 3 a 5 caratteri','expected','^[a-z]{3,5}$','actual','[a-z]{3,5}$','actual_response',$raw${"patterns": [{"pattern": "[a-z]{3,5}$","flags":""}]}$raw$,'score',2,'verdict','partial','reason','missing start anchor','response_s',6.662,'speed_score',3,'first_token_latency_ms',3348,'tokens_per_second',3.0,'tokens_generated',20,'prompt_token_count',844,'kv_cache_hit_ratio',0)
    ),
    'baseline_temp_07', jsonb_build_object('success','0/5','outputs',jsonb_build_array('\p{Letter}+\p{Digit}','\p{Letter}\p{Digit}|\.|','\p{Letter}\p{Digit}|.','\p{Letter}\p{Digit}','\b\w{3}+'),'response_s',jsonb_build_array(9.28,6.26,6.453,6.545,7.07),'notes','Malformed and semantically wrong regexes; temperature 0.2 remained unsuccessful.'),
    'notes', 'No successful turns. fp16 improves surface syntax but still loses context, emits empty patterns and never produces a correct regex.'
  ),
  updated_at = now(), updated_by = 'system_granite_h_retest'
WHERE model_id = 'onnx-community/granite-4.0-h-350m-ONNX#fp16';

COMMIT;
