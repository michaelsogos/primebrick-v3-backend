-- Fire-and-forget: Insert OLMo-2-0425-1B-Instruct (batch 3 candidate).
--
-- VRAM from WebLLM prebuiltAppConfig.vram_required_MB.
-- Download size from HuggingFace repo total (recursive=true).
-- Inserted as UNTESTED — will be updated after empirical test.
--
-- Idempotent via ON CONFLICT (model_id).
--
-- Date: 2026-09-10

BEGIN;

INSERT INTO "public"."ai_models" (
  "model_id", "name", "label_key", "description_key",
  "power_level", "is_enabled", "enable_thinking",
  "temperature", "top_p", "max_tokens", "repetition_penalty",
  "sort_order", "download_size_mb", "vram_mb", "compatibility_status",
  "created_by", "updated_by", "version"
) VALUES
(
  'OLMo-2-0425-1B-Instruct-q4f16_1-MLC',
  'OLMo-2 1B',
  'system.entities.ai_model.olmo2_1b.label',
  'system.entities.ai_model.olmo2_1b.description',
  2, true, false,
  0.30, 0.80, 256, 1.10,
  160, 806, 1776.75, 'UNTESTED',
  'system', 'system', 1
)
ON CONFLICT ("model_id") DO NOTHING;

COMMIT;
