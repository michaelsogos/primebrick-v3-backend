-- Fire-and-forget: Add download_size_mb, vram_mb, compatibility_status to ai_models
-- and update all 15 models with WebLLM-sourced sizes + compatibility classification.
--
-- Sources:
--   vram_mb       → WebLLM prebuiltAppConfig.model_list[*].vram_required_MB
--   download_size_mb → HuggingFace repo total file size (mlc-ai/<model_id>, recursive=true)
--
-- Classification (based on empirical 3-turn Smart Regex test, 2026-09-10):
--   COMPATIBLE     → 8 models (3 baseline + 5 new recommended) — 3/3 turns correct
--   NOT_COMPATIBLE → 7 models — failed or partially failed the test
--
-- Idempotent: ALTER TABLE IF NOT EXISTS + UPDATE by model_id.
--
-- Date: 2026-09-10

BEGIN;

-- ─── 1. Add new columns ───
ALTER TABLE "public"."ai_models" ADD COLUMN IF NOT EXISTS "download_size_mb" integer;
ALTER TABLE "public"."ai_models" ADD COLUMN IF NOT EXISTS "vram_mb" numeric(8,2);
ALTER TABLE "public"."ai_models" ADD COLUMN IF NOT EXISTS "compatibility_status" varchar(30) NOT NULL DEFAULT 'UNTESTED';

COMMENT ON COLUMN public.ai_models.download_size_mb IS 'Download size in MB (total HuggingFace repo size, all shards + tokenizer)';
COMMENT ON COLUMN public.ai_models.vram_mb IS 'VRAM required in MB (from WebLLM prebuiltAppConfig vram_required_MB)';
COMMENT ON COLUMN public.ai_models.compatibility_status IS 'Compatibility status: COMPATIBLE, NOT_COMPATIBLE, UNTESTED';

-- ─── 2. Update COMPATIBLE models (8 total: 3 baseline + 5 new recommended) ───

-- Baseline models (already enabled, already have power_level)
UPDATE "public"."ai_models" SET
  vram_mb = 2036.66, download_size_mb = 939, compatibility_status = 'COMPATIBLE'
WHERE model_id = 'Qwen3-1.7B-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  vram_mb = 1629.75, download_size_mb = 840, compatibility_status = 'COMPATIBLE'
WHERE model_id = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  vram_mb = 3431.59, download_size_mb = 2174, compatibility_status = 'COMPATIBLE'
WHERE model_id = 'Qwen3-4B-q4f16_1-MLC';

-- New recommended models (set power_level + enable + compatibility)
UPDATE "public"."ai_models" SET
  power_level = 4, is_enabled = true,
  vram_mb = 2245.44, download_size_mb = 1032, compatibility_status = 'COMPATIBLE'
WHERE model_id = 'Qwen3.5-2B-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  power_level = 3, is_enabled = true,
  vram_mb = 1629.75, download_size_mb = 840, compatibility_status = 'COMPATIBLE'
WHERE model_id = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  power_level = 3, is_enabled = true,
  vram_mb = 2504.76, download_size_mb = 1667, compatibility_status = 'COMPATIBLE'
WHERE model_id = 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  power_level = 4, is_enabled = true,
  vram_mb = 2263.69, download_size_mb = 1733, compatibility_status = 'COMPATIBLE'
WHERE model_id = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  power_level = 4, is_enabled = true,
  vram_mb = 2263.69, download_size_mb = 1733, compatibility_status = 'COMPATIBLE'
WHERE model_id = 'Hermes-3-Llama-3.2-3B-q4f16_1-MLC';

-- ─── 3. Update NOT_COMPATIBLE models (7 total — failed or partial) ───

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1,
  vram_mb = 1629.49, download_size_mb = 426, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Qwen3.5-0.8B-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1,
  vram_mb = 944.62, download_size_mb = 276, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 3,
  vram_mb = 2504.76, download_size_mb = 1667, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Qwen2.5-3B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 1,
  vram_mb = 879.04, download_size_mb = 672, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 2,
  vram_mb = 1895.30, download_size_mb = 1424, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'gemma-2-2b-it-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 2,
  vram_mb = 1774.19, download_size_mb = 922, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'SmolLM2-1.7B-Instruct-q4f16_1-MLC';

UPDATE "public"."ai_models" SET
  is_enabled = false, power_level = 4,
  vram_mb = 3672.07, download_size_mb = 2053, compatibility_status = 'NOT_COMPATIBLE'
WHERE model_id = 'Phi-3.5-mini-instruct-q4f16_1-MLC';

COMMIT;
