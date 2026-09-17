-- Fire-and-forget migration: Migrate ai_models from WebLLM to Transformers.js
--
-- 1. Add `dtype` and `engine_type` columns to ai_models
-- 2. Set engine_type='webllm' for all existing rows
-- 3. Soft-delete ALL existing WebLLM models (deleted_at + deleted_by)
-- 4. Insert 10 new ONNX/Transformers.js models (7 Qwen + 3 Phi)
-- 5. Update ai_assistant_model config to the new default (Qwen3.5-2B-ONNX)
--
-- The old WebLLM rows are preserved (soft-deleted) for rollback/audit.
-- New rows use engine_type='transformers_js' and dtype='q4f16' (default).
-- download_size_mb and vram_mb are ESTIMATES — they will be overwritten
-- with measured values after harness testing (see harness phase).
--
-- Idempotent: ALTER TABLE IF NOT EXISTS + INSERT ON CONFLICT (model_id) DO NOTHING.
--
-- Date: 2026-09-14

BEGIN;

-- ─── 1. Add new columns ───
ALTER TABLE "public"."ai_models" ADD COLUMN IF NOT EXISTS "dtype" varchar(20);
ALTER TABLE "public"."ai_models" ADD COLUMN IF NOT EXISTS "engine_type" varchar(20) NOT NULL DEFAULT 'webllm';

COMMENT ON COLUMN public.ai_models.dtype IS 'ONNX quantization dtype for Transformers.js (q4f16, fp16, int8, q8, q4, fp32). NULL for WebLLM.';
COMMENT ON COLUMN public.ai_models.engine_type IS 'Inference engine: webllm or transformers_js.';

-- ─── 2. Set engine_type='webllm' for all existing rows (they are all WebLLM) ───
UPDATE "public"."ai_models" SET engine_type = 'webllm' WHERE engine_type IS NULL OR engine_type = '';

-- ─── 3. Soft-delete ALL existing WebLLM models ───
-- Preserve test_scores and metadata for audit. Only mark as deleted.
UPDATE "public"."ai_models"
SET deleted_at = NOW(),
    deleted_by = 'system_migration_transformers_js',
    is_enabled = false
WHERE deleted_at IS NULL
  AND engine_type = 'webllm';

-- ─── 4. Insert 10 new ONNX/Transformers.js models ───
-- All start as UNTESTED with estimated sizes (to be measured by harness).
-- is_enabled = true for the 7 Qwen models we tested with WebLLM.
-- The 3 Phi models start disabled until harness-tested.

INSERT INTO "public"."ai_models" (
  uuid, model_id, dtype, engine_type, name, label_key, description_key,
  power_level, rank, test_scores,
  is_enabled, enable_thinking, temperature, top_p, max_tokens, repetition_penalty,
  sort_order, download_size_mb, vram_mb, compatibility_status,
  created_at, created_by, updated_at, updated_by, version
) VALUES
-- 1. Qwen2.5 1.5B Instruct (text-only, pipeline text-generation)
('a1111111-0000-0000-0000-000000000001',
 'onnx-community/Qwen2.5-1.5B-Instruct', 'q4f16', 'transformers_js',
 'Qwen2.5 1.5B', 'system.entities.ai_model.qwen2.5_1.5b.label', 'system.entities.ai_model.qwen2.5_1.5b.description',
 2, 1.0, NULL,
 true, false, 0.30, 0.80, 256, 1.10,
 10, 940, 1630, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1),

-- 2. Qwen2.5 Coder 1.5B Instruct (text-only, pipeline text-generation)
('a1111111-0000-0000-0000-000000000002',
 'onnx-community/Qwen2.5-Coder-1.5B-Instruct', 'q4f16', 'transformers_js',
 'Qwen2.5 Coder 1.5B', 'system.entities.ai_model.qwen2.5_coder_1.5b.label', 'system.entities.ai_model.qwen2.5_coder_1.5b.description',
 2, 1.0, NULL,
 true, false, 0.30, 0.80, 256, 1.10,
 20, 940, 1630, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1),

-- 3. Qwen3 1.7B (text-only, pipeline text-generation, supports thinking)
('a1111111-0000-0000-0000-000000000003',
 'onnx-community/Qwen3-1.7B-ONNX', 'q4f16', 'transformers_js',
 'Qwen3 1.7B', 'system.entities.ai_model.qwen3_1.7b.label', 'system.entities.ai_model.qwen3_1.7b.description',
 3, 1.0, NULL,
 true, true, 0.60, 0.95, 1024, 1.10,
 30, 1100, 2037, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1),

-- 4. Qwen3.5 2B (multimodal, Qwen3_5ForConditionalGeneration + AutoProcessor)
('a1111111-0000-0000-0000-000000000004',
 'onnx-community/Qwen3.5-2B-ONNX', 'q4f16', 'transformers_js',
 'Qwen3.5 2B', 'system.entities.ai_model.qwen3.5_2b.label', 'system.entities.ai_model.qwen3.5_2b.description',
 4, 1.0, NULL,
 true, true, 0.60, 0.95, 1024, 1.10,
 40, 1032, 2245, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1),

-- 5. Qwen2.5 Coder 3B Instruct (text-only, pipeline text-generation)
('a1111111-0000-0000-0000-000000000005',
 'onnx-community/Qwen2.5-Coder-3B-Instruct', 'q4f16', 'transformers_js',
 'Qwen2.5 Coder 3B', 'system.entities.ai_model.qwen2.5_coder_3b.label', 'system.entities.ai_model.qwen2.5_coder_3b.description',
 3, 1.0, NULL,
 true, false, 0.30, 0.80, 256, 1.10,
 50, 1667, 2505, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1),

-- 6. Qwen3 4B (text-only, pipeline text-generation, supports thinking)
('a1111111-0000-0000-0000-000000000006',
 'onnx-community/Qwen3-4B-ONNX', 'q4f16', 'transformers_js',
 'Qwen3 4B', 'system.entities.ai_model.qwen3_4b.label', 'system.entities.ai_model.qwen3_4b.description',
 4, 1.0, NULL,
 true, true, 0.60, 0.95, 1024, 1.10,
 60, 2174, 3432, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1),

-- 7. Qwen3.5 4B (multimodal, Qwen3_5ForConditionalGeneration + AutoProcessor)
('a1111111-0000-0000-0000-000000000007',
 'onnx-community/Qwen3.5-4B-ONNX', 'q4f16', 'transformers_js',
 'Qwen3.5 4B', 'system.entities.ai_model.qwen3.5_4b.label', 'system.entities.ai_model.qwen3.5_4b.description',
 5, 1.0, NULL,
 true, true, 0.60, 0.95, 1024, 1.10,
 70, 2280, 3868, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1),

-- 8. Phi-3.5 mini instruct (text-only, pipeline text-generation, no thinking)
('a1111111-0000-0000-0000-000000000008',
 'onnx-community/Phi-3.5-mini-instruct-onnx-web', 'q4f16', 'transformers_js',
 'Phi 3.5 mini', 'system.entities.ai_model.phi_3.5_mini.label', 'system.entities.ai_model.phi_3.5_mini.description',
 4, 1.0, NULL,
 false, false, 0.30, 0.80, 256, 1.10,
 80, 2320, 3868, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1),

-- 9. Phi-3 mini 4k instruct (text-only, pipeline text-generation, no thinking)
('a1111111-0000-0000-0000-000000000009',
 'onnx-community/Phi-3-mini-4k-instruct-ONNX', 'q4f16', 'transformers_js',
 'Phi 3 mini 4k', 'system.entities.ai_model.phi_3_mini_4k.label', 'system.entities.ai_model.phi_3_mini_4k.description',
 3, 1.0, NULL,
 false, false, 0.30, 0.80, 256, 1.10,
 90, 2320, 3868, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1),

-- 10. Phi-4 mini instruct (text-only, pipeline text-generation, no thinking)
('a1111111-0000-0000-0000-000000000010',
 'onnx-community/Phi-4-mini-instruct-ONNX-GQA', 'q4f16', 'transformers_js',
 'Phi 4 mini', 'system.entities.ai_model.phi_4_mini.label', 'system.entities.ai_model.phi_4_mini.description',
 4, 1.0, NULL,
 false, false, 0.30, 0.80, 256, 1.10,
 100, 2320, 3868, 'UNTESTED',
 NOW(), 'system_migration_transformers_js', NOW(), 'system_migration_transformers_js', 1)

ON CONFLICT (model_id) DO NOTHING;

-- ─── 5. Update default model config to Qwen3.5-2B-ONNX ───
UPDATE "public"."config_entries"
SET value = 'onnx-community/Qwen3.5-2B-ONNX',
    updated_at = NOW()
WHERE key = 'ai_assistant_model';

COMMIT;
