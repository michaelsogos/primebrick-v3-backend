-- Fire-and-forget migration: complete standard dtype coverage for
-- NVIDIA Nemotron 3 Nano 4B and Granite 4.0 H Micro 3B retest campaign.
-- download_size_mb = weight files + shared tokenizer/config (~4MB), decimal MB.
-- Granite H Micro ships with kv_cache_reuse=false (Mamba past_conv/past_ssm
-- crash on KV reuse, same class as Granite 4.0 H 1.5B / 350M).
-- Date: 2026-09-16

BEGIN;

INSERT INTO "public"."ai_models" (uuid, model_id, name, power_level, is_enabled, enable_thinking,
  temperature, top_p, max_tokens, repetition_penalty, sort_order,
  created_by, updated_by, download_size_mb, vram_mb, compatibility_status, rank, dtype, engine_type, execution_config)
VALUES
  ('a6666666-0000-4000-8000-000000000601','onnx-community/NVIDIA-Nemotron-3-Nano-4B-BF16-ONNX#q4',  'NVIDIA Nemotron 3 Nano 4B (q4)',  3,false,false,'0.00','0.80',256,'1.10',61,'system_migration_nemotron_micro_variants','system_migration_nemotron_micro_variants',2560,NULL,'UNTESTED','1.0','q4','onnx',NULL),
  ('a6666666-0000-4000-8000-000000000602','onnx-community/NVIDIA-Nemotron-3-Nano-4B-BF16-ONNX#fp16','NVIDIA Nemotron 3 Nano 4B (fp16)',3,false,false,'0.00','0.80',256,'1.10',62,'system_migration_nemotron_micro_variants','system_migration_nemotron_micro_variants',7955,NULL,'UNTESTED','1.0','fp16','onnx',NULL),
  ('a6666666-0000-4000-8000-000000000603','onnx-community/granite-4.0-h-micro-ONNX#q4',  'Granite 4.0 H Micro 3B (q4)',  3,false,false,'0.00','0.80',256,'1.10',77,'system_migration_nemotron_micro_variants','system_migration_nemotron_micro_variants',2161,NULL,'UNTESTED','1.0','q4','onnx','{"kv_cache_reuse":false,"sliding_window":true,"intent_detection":true,"max_history_turns":6}'::jsonb),
  ('a6666666-0000-4000-8000-000000000604','onnx-community/granite-4.0-h-micro-ONNX#fp16','Granite 4.0 H Micro 3B (fp16)',3,false,false,'0.00','0.80',256,'1.10',78,'system_migration_nemotron_micro_variants','system_migration_nemotron_micro_variants',6391,NULL,'UNTESTED','1.0','fp16','onnx','{"kv_cache_reuse":false,"sliding_window":true,"intent_detection":true,"max_history_turns":6}'::jsonb)
ON CONFLICT (uuid) DO NOTHING;

COMMIT;
