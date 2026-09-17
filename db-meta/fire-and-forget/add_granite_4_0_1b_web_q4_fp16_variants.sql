-- Fire-and-forget migration: complete Granite 4.0 1B Web dtype coverage
-- Adds q4 and fp16 variants published in onnx-community/granite-4.0-1b-ONNX-web.
-- download_size_mb = real Hugging Face repository bytes required by each dtype,
-- including the shared tokenizer/config files, expressed in decimal MB.
-- Date: 2026-09-16

BEGIN;

UPDATE "public"."ai_models"
SET download_size_mb = 1254,
    updated_at = now(),
    updated_by = 'system_migration_granite_1b_variants'
WHERE model_id = 'onnx-community/granite-4.0-1b-ONNX-web#q4f16';

INSERT INTO "public"."ai_models" (uuid, model_id, name, power_level, is_enabled, enable_thinking,
  temperature, top_p, max_tokens, repetition_penalty, sort_order,
  created_by, updated_by, download_size_mb, vram_mb, compatibility_status, rank, dtype, engine_type)
VALUES
  ('a5555555-0000-4000-8000-000000000501','onnx-community/granite-4.0-1b-ONNX-web#q4',  'Granite 4.0 1B web (q4)',  2,false,false,'0.00','0.80',256,'1.10',179,'system_migration_granite_1b_variants','system_migration_granite_1b_variants',1788,NULL,'UNTESTED','1.0','q4','onnx'),
  ('a5555555-0000-4000-8000-000000000502','onnx-community/granite-4.0-1b-ONNX-web#fp16','Granite 4.0 1B web (fp16)',2,false,false,'0.00','0.80',256,'1.10',180,'system_migration_granite_1b_variants','system_migration_granite_1b_variants',3304,NULL,'UNTESTED','1.0','fp16','onnx')
ON CONFLICT (uuid) DO NOTHING;

COMMIT;
