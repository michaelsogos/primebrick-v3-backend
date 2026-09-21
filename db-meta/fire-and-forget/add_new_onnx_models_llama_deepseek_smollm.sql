-- Fire-and-forget migration: additional ONNX models for empirical matrix
-- Adds per-dtype rows for newly discovered onnx-community / HuggingFaceTB exports:
--   deepseek-coder-1.3b-instruct-ONNX, Llama-3.2-1B-Instruct-ONNX,
--   Llama-3.2-1B-Instruct-q4f16 (alternate monolithic export — A/B test vs
--   external-data export), Llama-3.2-3B-Instruct-ONNX, SmolLM3-3B-ONNX.
-- download_size_mb = real file bytes from HF repo tree; vram_mb measured later.
-- Rows start disabled + UNTESTED except SmolLM3, which is permanently NOT_COMPATIBLE.
-- Date: 2026-09-14

BEGIN;

INSERT INTO "public"."ai_models" (uuid, model_id, name, power_level, is_enabled, enable_thinking,
  temperature, top_p, max_tokens, repetition_penalty, sort_order,
  created_by, updated_by, download_size_mb, vram_mb, compatibility_status, rank, dtype, engine_type)
VALUES
  -- deepseek-coder-1.3b-instruct-ONNX ─────────────────────────────
  ('a2222222-0000-4xxx0000-000000000101','onnx-community/deepseek-coder-1.3b-instruct-ONNX#q8',   'DeepSeek Coder 1.3B (int8)',  2,false,false,'0.00','0.80',256,'1.10', 90,'system_migration_new_models','system_migration_new_models',1347,NULL,'UNTESTED','1.0','q8','onnx'),
  ('a2222222-0000-4xxx0000-000000000102','onnx-community/deepseek-coder-1.3b-instruct-ONNX#fp16', 'DeepSeek Coder 1.3B (fp16)',  2,false,false,'0.00','0.80',256,'1.10', 91,'system_migration_new_models','system_migration_new_models',2693,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-4xxx0000-000000000103','onnx-community/deepseek-coder-1.3b-instruct-ONNX#q4f16','DeepSeek Coder 1.3B (q4f16)', 2,false,false,'0.00','0.80',256,'1.10', 92,'system_migration_new_models','system_migration_new_models', 853,NULL,'UNTESTED','1.0','q4f16','onnx'),
  ('a2222222-0000-4xxx0000-000000000104','onnx-community/deepseek-coder-1.3b-instruct-ONNX#q4',   'DeepSeek Coder 1.3B (q4)',    2,false,false,'0.00','0.80',256,'1.10', 93,'system_migration_new_models','system_migration_new_models',1065,NULL,'UNTESTED','1.0','q4','onnx'),
  ('a2222222-0000-4xxx0000-000000000105','onnx-community/deepseek-coder-1.3b-instruct-ONNX#bnb4', 'DeepSeek Coder 1.3B (bnb4)',  2,false,false,'0.00','0.80',256,'1.10', 94,'system_migration_new_models','system_migration_new_models', 985,NULL,'UNTESTED','1.0','bnb4','onnx'),
  -- Llama-3.2-1B-Instruct-ONNX ────────────────────────────────────
  ('a2222222-0000-4xxx0000-000000000111','onnx-community/Llama-3.2-1B-Instruct-ONNX#q8',   'Llama 3.2 1B (int8)',  1,false,false,'0.00','0.80',256,'1.10', 95,'system_migration_new_models','system_migration_new_models',1237,NULL,'UNTESTED','1.0','q8','onnx'),
  ('a2222222-0000-4xxx0000-000000000112','onnx-community/Llama-3.2-1B-Instruct-ONNX#fp16', 'Llama 3.2 1B (fp16)',  1,false,false,'0.00','0.80',256,'1.10', 96,'system_migration_new_models','system_migration_new_models',2488,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-4xxx0000-000000000113','onnx-community/Llama-3.2-1B-Instruct-ONNX#q4f16','Llama 3.2 1B (q4f16)', 1,false,false,'0.00','0.80',256,'1.10', 97,'system_migration_new_models','system_migration_new_models',1090,NULL,'UNTESTED','1.0','q4f16','onnx'),
  ('a2222222-0000-4xxx0000-000000000114','onnx-community/Llama-3.2-1B-Instruct-ONNX#q4',   'Llama 3.2 1B (q4)',    1,false,false,'0.00','0.80',256,'1.10', 98,'system_migration_new_models','system_migration_new_models',1693,NULL,'UNTESTED','1.0','q4','onnx'),
  ('a2222222-0000-4xxx0000-000000000115','onnx-community/Llama-3.2-1B-Instruct-ONNX#bnb4', 'Llama 3.2 1B (bnb4)',  1,false,false,'0.00','0.80',256,'1.10', 99,'system_migration_new_models','system_migration_new_models',1599,NULL,'UNTESTED','1.0','bnb4','onnx'),
  -- Llama-3.2-1B-Instruct-q4f16 (alternate monolithic export) ─────
  ('a2222222-0000-4xxx0000-000000000116','onnx-community/Llama-3.2-1B-Instruct-q4f16#q4f16','Llama 3.2 1B alt-export (q4f16)',1,false,false,'0.00','0.80',256,'1.10',100,'system_migration_new_models','system_migration_new_models',1238,NULL,'UNTESTED','1.0','q4f16','onnx'),
  -- Llama-3.2-3B-Instruct-ONNX ────────────────────────────────────
  ('a2222222-0000-4xxx0000-000000000121','onnx-community/Llama-3.2-3B-Instruct-ONNX#q8',   'Llama 3.2 3B (int8)',  3,false,false,'0.00','0.80',256,'1.10',101,'system_migration_new_models','system_migration_new_models',3213,NULL,'UNTESTED','1.0','q8','onnx'),
  ('a2222222-0000-4xxx0000-000000000122','onnx-community/Llama-3.2-3B-Instruct-ONNX#fp16', 'Llama 3.2 3B (fp16)',  3,false,false,'0.00','0.80',256,'1.10',102,'system_migration_new_models','system_migration_new_models',8560,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-4xxx0000-000000000123','onnx-community/Llama-3.2-3B-Instruct-ONNX#q4f16','Llama 3.2 3B (q4f16)', 3,false,false,'0.00','0.80',256,'1.10',103,'system_migration_new_models','system_migration_new_models',2407,NULL,'UNTESTED','1.0','q4f16','onnx'),
  ('a2222222-0000-4xxx0000-000000000124','onnx-community/Llama-3.2-3B-Instruct-ONNX#q4',   'Llama 3.2 3B (q4)',    3,false,false,'0.00','0.80',256,'1.10',104,'system_migration_new_models','system_migration_new_models',3405,NULL,'UNTESTED','1.0','q4','onnx'),
  ('a2222222-0000-4xxx0000-000000000125','onnx-community/Llama-3.2-3B-Instruct-ONNX#bnb4', 'Llama 3.2 3B (bnb4)',  3,false,false,'0.00','0.80',256,'1.10',105,'system_migration_new_models','system_migration_new_models',3162,NULL,'UNTESTED','1.0','bnb4','onnx'),
  -- SmolLM3-3B-ONNX (official HuggingFaceTB export) ───────────────
  ('a2222222-0000-4xxx0000-000000000131','HuggingFaceTB/SmolLM3-3B-ONNX#q8',   'SmolLM3 3B (int8)',  3,false,true,'0.00','0.80',256,'1.10',106,'system_migration_new_models','system_migration_new_models',3109,NULL,'NOT_COMPATIBLE','1.0','q8','onnx'),
  ('a2222222-0000-4xxx0000-000000000132','HuggingFaceTB/SmolLM3-3B-ONNX#fp16', 'SmolLM3 3B (fp16)',  3,false,true,'0.00','0.80',256,'1.10',107,'system_migration_new_models','system_migration_new_models',6167,NULL,'NOT_COMPATIBLE','1.0','fp16','onnx'),
  ('a2222222-0000-4xxx0000-000000000133','HuggingFaceTB/SmolLM3-3B-ONNX#q4f16','SmolLM3 3B (q4f16)', 3,false,true,'0.00','0.80',256,'1.10',108,'system_migration_new_models','system_migration_new_models',2124,NULL,'NOT_COMPATIBLE','1.0','q4f16','onnx'),
  ('a2222222-0000-4xxx0000-000000000134','HuggingFaceTB/SmolLM3-3B-ONNX#q4',   'SmolLM3 3B (q4)',    3,false,true,'0.00','0.80',256,'1.10',109,'system_migration_new_models','system_migration_new_models',2843,NULL,'NOT_COMPATIBLE','1.0','q4','onnx'),
  ('a2222222-0000-4xxx0000-000000000135','HuggingFaceTB/SmolLM3-3B-ONNX#bnb4', 'SmolLM3 3B (bnb4)',  3,false,true,'0.00','0.80',256,'1.10',110,'system_migration_new_models','system_migration_new_models',2667,NULL,'NOT_COMPATIBLE','1.0','bnb4','onnx')
ON CONFLICT (uuid) DO NOTHING;

COMMIT;
