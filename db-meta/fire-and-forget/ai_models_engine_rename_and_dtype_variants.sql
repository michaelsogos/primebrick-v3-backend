-- Fire-and-forget migration: engine naming + per-dtype variant rows
--
-- 1. Rename engine_type 'transformers_js' -> 'onnx' (user-facing engine names:
--    'webllm' = WebLLM/MLC stack, 'onnx' = Transformers.js + onnxruntime-web).
-- 2. model_id becomes '<hf_repo>#<dtype>' — e.g. 'onnx-community/Qwen2.5-1.5B-Instruct#q8'.
--    Required because ai_models.model_id is UNIQUE and we now keep one row per
--    quantization variant. The FE strips the '#dtype' suffix before calling
--    HuggingFace (the dtype column already carries the transformers.js dtype).
-- 3. Rename existing ONNX rows so the name carries the quantization variant.
-- 4. Update download_size_mb on existing rows with REAL file sizes from HF.
-- 5. Insert one row per (repo, dtype) variant actually published upstream.
--    All variants start disabled + UNTESTED; enabled one at a time during
--    empirical testing.
-- 6. Add engine_type badge translations (onnx + webllm).
--
-- Idempotent: UPDATEs are value-guarded, INSERTs use ON CONFLICT (uuid) DO NOTHING.
-- Date: 2026-09-14

BEGIN;

-- ─── 1. Engine rename ───
UPDATE "public"."ai_models" SET engine_type = 'onnx' WHERE engine_type = 'transformers_js';

-- ─── 2+3+4. Existing ONNX rows: suffixed model_id, variant name, real size ───
UPDATE "public"."ai_models" SET model_id='onnx-community/Qwen2.5-0.5B-Instruct#q4f16',         name='Qwen2.5 0.5B (q4f16)',       download_size_mb=512  WHERE id=48;
UPDATE "public"."ai_models" SET model_id='onnx-community/Qwen2.5-1.5B-Instruct#q8',            name='Qwen2.5 1.5B (int8)',        download_size_mb=1579 WHERE id=38;
UPDATE "public"."ai_models" SET model_id='onnx-community/Qwen2.5-Coder-1.5B-Instruct#q4f16',   name='Qwen2.5 Coder 1.5B (q4f16)', download_size_mb=1344 WHERE id=39;
UPDATE "public"."ai_models" SET model_id='onnx-community/Qwen3-1.7B-ONNX#q4f16',               name='Qwen3 1.7B (q4f16)',         download_size_mb=1426 WHERE id=40;
UPDATE "public"."ai_models" SET model_id='onnx-community/Qwen3.5-2B-ONNX#q4f16',               name='Qwen3.5 2B (q4f16)',         download_size_mb=1384 WHERE id=41;
UPDATE "public"."ai_models" SET model_id='onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16',     name='Qwen2.5 Coder 3B (q4f16)',   download_size_mb=2367 WHERE id=42;
UPDATE "public"."ai_models" SET model_id='onnx-community/Qwen3-4B-ONNX#q4f16',                 name='Qwen3 4B (q4f16)',           download_size_mb=2833 WHERE id=43;
UPDATE "public"."ai_models" SET model_id='onnx-community/Qwen3.5-4B-ONNX#q4f16',               name='Qwen3.5 4B (q4f16)',         download_size_mb=2803 WHERE id=44;
UPDATE "public"."ai_models" SET model_id='onnx-community/Phi-3.5-mini-instruct-onnx-web#q4f16',name='Phi 3.5 mini (q4f16)',       download_size_mb=2317 WHERE id=45;
UPDATE "public"."ai_models" SET model_id='onnx-community/Phi-3-mini-4k-instruct-ONNX#q4f16',   name='Phi 3 mini 4k (q4f16)',      download_size_mb=2292 WHERE id=46;
UPDATE "public"."ai_models" SET model_id='onnx-community/Phi-4-mini-instruct-ONNX-GQA#q4f16',  name='Phi 4 mini (q4f16)',         download_size_mb=3067 WHERE id=47;

-- Point the configured default at a suffixed variant id
UPDATE "public"."auth_configurations" SET value='onnx-community/Phi-3.5-mini-instruct-onnx-web#q4f16'
WHERE key='ai_assistant_model' AND value LIKE 'onnx-community/%' AND value NOT LIKE '%#%';

-- ─── 5. Per-dtype variant rows ───
-- download_size_mb = real file bytes from HF repo tree; vram_mb = NULL until measured.
INSERT INTO "public"."ai_models" (uuid, model_id, name, power_level, is_enabled, enable_thinking,
  temperature, top_p, max_tokens, repetition_penalty, sort_order,
  created_by, updated_by, download_size_mb, vram_mb, compatibility_status, rank, dtype, engine_type)
VALUES
  -- Qwen2.5-0.5B-Instruct ─────────────────────────────────────────
  ('a2222222-0000-0000-0000-000000000001','onnx-community/Qwen2.5-0.5B-Instruct#q8',  'Qwen2.5 0.5B (int8)', 1,false,false,'0.00','0.80',256,'1.10', 50,'system_migration_dtype_variants','system_migration_dtype_variants', 512,NULL,'UNTESTED','1.0','q8','onnx'),
  ('a2222222-0000-0000-0000-000000000002','onnx-community/Qwen2.5-0.5B-Instruct#fp16','Qwen2.5 0.5B (fp16)', 1,false,false,'0.00','0.80',256,'1.10', 51,'system_migration_dtype_variants','system_migration_dtype_variants', 997,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-0000-0000-000000000003','onnx-community/Qwen2.5-0.5B-Instruct#q4',  'Qwen2.5 0.5B (q4)',   1,false,false,'0.00','0.80',256,'1.10', 52,'system_migration_dtype_variants','system_migration_dtype_variants', 786,NULL,'UNTESTED','1.0','q4','onnx'),
  ('a2222222-0000-0000-0000-000000000004','onnx-community/Qwen2.5-0.5B-Instruct#bnb4','Qwen2.5 0.5B (bnb4)', 1,false,false,'0.00','0.80',256,'1.10', 53,'system_migration_dtype_variants','system_migration_dtype_variants', 764,NULL,'UNTESTED','1.0','bnb4','onnx'),
  -- Qwen2.5-1.5B-Instruct ─────────────────────────────────────────
  ('a2222222-0000-0000-0000-000000000011','onnx-community/Qwen2.5-1.5B-Instruct#fp16','Qwen2.5 1.5B (fp16)', 2,false,false,'0.00','0.80',256,'1.10', 54,'system_migration_dtype_variants','system_migration_dtype_variants',3105,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-0000-0000-000000000012','onnx-community/Qwen2.5-1.5B-Instruct#q4f16','Qwen2.5 1.5B (q4f16)',2,false,false,'0.00','0.80',256,'1.10', 55,'system_migration_dtype_variants','system_migration_dtype_variants',1222,NULL,'UNTESTED','1.0','q4f16','onnx'),
  ('a2222222-0000-0000-0000-000000000013','onnx-community/Qwen2.5-1.5B-Instruct#q4',  'Qwen2.5 1.5B (q4)',   2,false,false,'0.00','0.80',256,'1.10', 56,'system_migration_dtype_variants','system_migration_dtype_variants',1788,NULL,'UNTESTED','1.0','q4','onnx'),
  ('a2222222-0000-0000-0000-000000000014','onnx-community/Qwen2.5-1.5B-Instruct#bnb4','Qwen2.5 1.5B (bnb4)', 2,false,false,'0.00','0.80',256,'1.10', 57,'system_migration_dtype_variants','system_migration_dtype_variants',1706,NULL,'UNTESTED','1.0','bnb4','onnx'),
  -- Qwen2.5-Coder-1.5B-Instruct ───────────────────────────────────
  ('a2222222-0000-0000-0000-000000000021','onnx-community/Qwen2.5-Coder-1.5B-Instruct#q8',  'Qwen2.5 Coder 1.5B (int8)', 2,false,false,'0.00','0.80',256,'1.10', 58,'system_migration_dtype_variants','system_migration_dtype_variants',1795,NULL,'UNTESTED','1.0','q8','onnx'),
  ('a2222222-0000-0000-0000-000000000022','onnx-community/Qwen2.5-Coder-1.5B-Instruct#fp16','Qwen2.5 Coder 1.5B (fp16)', 2,false,false,'0.00','0.80',256,'1.10', 59,'system_migration_dtype_variants','system_migration_dtype_variants',3564,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-0000-0000-000000000023','onnx-community/Qwen2.5-Coder-1.5B-Instruct#q4',  'Qwen2.5 Coder 1.5B (q4)',   2,false,false,'0.00','0.80',256,'1.10', 60,'system_migration_dtype_variants','system_migration_dtype_variants',1916,NULL,'UNTESTED','1.0','q4','onnx'),
  ('a2222222-0000-0000-0000-000000000024','onnx-community/Qwen2.5-Coder-1.5B-Instruct#bnb4','Qwen2.5 Coder 1.5B (bnb4)', 2,false,false,'0.00','0.80',256,'1.10', 61,'system_migration_dtype_variants','system_migration_dtype_variants',1820,NULL,'UNTESTED','1.0','bnb4','onnx'),
  -- Qwen2.5-Coder-3B-Instruct ─────────────────────────────────────
  ('a2222222-0000-0000-0000-000000000031','onnx-community/Qwen2.5-Coder-3B-Instruct#q8',  'Qwen2.5 Coder 3B (int8)',  3,false,false,'0.00','0.80',256,'1.10', 62,'system_migration_dtype_variants','system_migration_dtype_variants',3416,NULL,'UNTESTED','1.0','q8','onnx'),
  ('a2222222-0000-0000-0000-000000000032','onnx-community/Qwen2.5-Coder-3B-Instruct#fp16','Qwen2.5 Coder 3B (fp16)',  3,false,false,'0.00','0.80',256,'1.10', 63,'system_migration_dtype_variants','system_migration_dtype_variants',6804,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-0000-0000-000000000033','onnx-community/Qwen2.5-Coder-3B-Instruct#q4',  'Qwen2.5 Coder 3B (q4)',    3,false,false,'0.00','0.80',256,'1.10', 64,'system_migration_dtype_variants','system_migration_dtype_variants',3191,NULL,'UNTESTED','1.0','q4','onnx'),
  ('a2222222-0000-0000-0000-000000000034','onnx-community/Qwen2.5-Coder-3B-Instruct#bnb4','Qwen2.5 Coder 3B (bnb4)',  3,false,false,'0.00','0.80',256,'1.10', 65,'system_migration_dtype_variants','system_migration_dtype_variants',2999,NULL,'UNTESTED','1.0','bnb4','onnx'),
  -- Qwen3-1.7B-ONNX ───────────────────────────────────────────────
  ('a2222222-0000-0000-0000-000000000041','onnx-community/Qwen3-1.7B-ONNX#q8',  'Qwen3 1.7B (int8)', 2,false,true,'0.00','0.80',256,'1.10', 66,'system_migration_dtype_variants','system_migration_dtype_variants',1742,NULL,'UNTESTED','1.0','q8','onnx'),
  ('a2222222-0000-0000-0000-000000000042','onnx-community/Qwen3-1.7B-ONNX#fp16','Qwen3 1.7B (fp16)', 2,false,true,'0.00','0.80',256,'1.10', 67,'system_migration_dtype_variants','system_migration_dtype_variants',3452,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-0000-0000-000000000043','onnx-community/Qwen3-1.7B-ONNX#q4',  'Qwen3 1.7B (q4)',   2,false,true,'0.00','0.80',256,'1.10', 68,'system_migration_dtype_variants','system_migration_dtype_variants',2147,NULL,'UNTESTED','1.0','q4','onnx'),
  ('a2222222-0000-0000-0000-000000000044','onnx-community/Qwen3-1.7B-ONNX#bnb4','Qwen3 1.7B (bnb4)', 2,false,true,'0.00','0.80',256,'1.10', 69,'system_migration_dtype_variants','system_migration_dtype_variants',2059,NULL,'UNTESTED','1.0','bnb4','onnx'),
  -- Qwen3-4B-ONNX (only fp16 + q4f16 exist upstream) ──────────────
  ('a2222222-0000-0000-0000-000000000051','onnx-community/Qwen3-4B-ONNX#fp16','Qwen3 4B (fp16)', 4,false,true,'0.00','0.80',256,'1.10', 70,'system_migration_dtype_variants','system_migration_dtype_variants',8055,NULL,'UNTESTED','1.0','fp16','onnx'),
  -- Qwen3.5-2B-ONNX ───────────────────────────────────────────────
  ('a2222222-0000-0000-0000-000000000061','onnx-community/Qwen3.5-2B-ONNX#q8',  'Qwen3.5 2B (int8)', 3,false,true,'0.00','0.80',256,'1.10', 71,'system_migration_dtype_variants','system_migration_dtype_variants',2767,NULL,'UNTESTED','1.0','q8','onnx'),
  ('a2222222-0000-0000-0000-000000000062','onnx-community/Qwen3.5-2B-ONNX#fp16','Qwen3.5 2B (fp16)', 3,false,true,'0.00','0.80',256,'1.10', 72,'system_migration_dtype_variants','system_migration_dtype_variants',4781,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-0000-0000-000000000063','onnx-community/Qwen3.5-2B-ONNX#q4',  'Qwen3.5 2B (q4)',   3,false,true,'0.00','0.80',256,'1.10', 73,'system_migration_dtype_variants','system_migration_dtype_variants',1535,NULL,'UNTESTED','1.0','q4','onnx'),
  -- Qwen3.5-4B-ONNX ───────────────────────────────────────────────
  ('a2222222-0000-0000-0000-000000000071','onnx-community/Qwen3.5-4B-ONNX#q8',  'Qwen3.5 4B (int8)', 4,false,true,'0.00','0.80',256,'1.10', 74,'system_migration_dtype_variants','system_migration_dtype_variants',5604,NULL,'UNTESTED','1.0','q8','onnx'),
  ('a2222222-0000-0000-0000-000000000072','onnx-community/Qwen3.5-4B-ONNX#fp16','Qwen3.5 4B (fp16)', 4,false,true,'0.00','0.80',256,'1.10', 75,'system_migration_dtype_variants','system_migration_dtype_variants',9685,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-0000-0000-000000000073','onnx-community/Qwen3.5-4B-ONNX#q4',  'Qwen3.5 4B (q4)',   4,false,true,'0.00','0.80',256,'1.10', 76,'system_migration_dtype_variants','system_migration_dtype_variants',3107,NULL,'UNTESTED','1.0','q4','onnx'),
  -- Phi-3-mini-4k-instruct-ONNX ───────────────────────────────────
  ('a2222222-0000-0000-0000-000000000081','onnx-community/Phi-3-mini-4k-instruct-ONNX#fp16','Phi 3 mini 4k (fp16)', 3,false,false,'0.00','0.80',256,'1.10', 77,'system_migration_dtype_variants','system_migration_dtype_variants',7643,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-0000-0000-000000000082','onnx-community/Phi-3-mini-4k-instruct-ONNX#q4',  'Phi 3 mini 4k (q4)',   3,false,false,'0.00','0.80',256,'1.10', 78,'system_migration_dtype_variants','system_migration_dtype_variants',2723,NULL,'UNTESTED','1.0','q4','onnx'),
  -- Phi-4-mini-instruct-ONNX-GQA ──────────────────────────────────
  ('a2222222-0000-0000-0000-000000000091','onnx-community/Phi-4-mini-instruct-ONNX-GQA#fp16','Phi 4 mini (fp16)', 3,false,false,'0.00','0.80',256,'1.10', 79,'system_migration_dtype_variants','system_migration_dtype_variants',7698,NULL,'UNTESTED','1.0','fp16','onnx'),
  ('a2222222-0000-0000-0000-000000000092','onnx-community/Phi-4-mini-instruct-ONNX-GQA#q4',  'Phi 4 mini (q4)',   3,false,false,'0.00','0.80',256,'1.10', 80,'system_migration_dtype_variants','system_migration_dtype_variants',4524,NULL,'UNTESTED','1.0','q4','onnx')
ON CONFLICT (uuid) DO NOTHING;

-- ─── 6. engine_type badge translations ───
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.engine_type.onnx', 'en-GB', 'ONNX',  now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.onnx', 'it-IT', 'ONNX',  now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.onnx', 'fr-FR', 'ONNX',  now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.onnx', 'es-ES', 'ONNX',  now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.onnx', 'de-DE', 'ONNX',  now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.onnx', 'pt-PT', 'ONNX',  now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.webllm', 'en-GB', 'WebLLM', now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.webllm', 'it-IT', 'WebLLM', now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.webllm', 'fr-FR', 'WebLLM', now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.webllm', 'es-ES', 'WebLLM', now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.webllm', 'de-DE', 'WebLLM', now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1),
  ('system.entities.ai_model.engine_type.webllm', 'pt-PT', 'WebLLM', now(), 'migration-dtype-variants', now(), 'migration-dtype-variants', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
