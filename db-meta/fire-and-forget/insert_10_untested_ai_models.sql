-- Fire-and-forget: Insert 10 new untested WebLLM models into ai_models.
--
-- These models are candidates for Smart Regex. They are inserted with
-- is_enabled=true and compatibility_status='UNTESTED' so they can be
-- selected and tested via the Smart Regex UI.
--
-- After empirical testing, a follow-up UPDATE will set:
--   - COMPATIBLE models: proper power_level, is_enabled=true
--   - NOT_COMPATIBLE models: is_enabled=false
--
-- VRAM from WebLLM prebuiltAppConfig.vram_required_MB.
-- Download size from HuggingFace repo total (recursive=true).
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
  'Qwen3.5-4B-q4f16_1-MLC',
  'Qwen3.5 4B',
  'system.entities.ai_model.qwen3.5_4b.label',
  'system.entities.ai_model.qwen3.5_4b.description',
  4, true, true,
  0.60, 0.95, 2048, 1.10,
  40, 2280, 3867.82, 'UNTESTED',
  'system', 'system', 1
),
(
  'Phi-4-mini-instruct-q4f16_1-MLC',
  'Phi-4 Mini',
  'system.entities.ai_model.phi4_mini.label',
  'system.entities.ai_model.phi4_mini.description',
  3, true, false,
  0.30, 0.80, 256, 1.10,
  50, 2079, 3437.58, 'UNTESTED',
  'system', 'system', 1
),
(
  'gemma3-1b-it-q4f16_1-MLC',
  'Gemma 3 1B',
  'system.entities.ai_model.gemma3_1b.label',
  'system.entities.ai_model.gemma3_1b.description',
  2, true, false,
  0.30, 0.80, 256, 1.10,
  60, 574, 711.07, 'UNTESTED',
  'system', 'system', 1
),
(
  'Ministral-3-3B-Instruct-2512-BF16-q4f16_1-MLC',
  'Ministral 3 3B Instruct',
  'system.entities.ai_model.ministral3_3b_instruct.label',
  'system.entities.ai_model.ministral3_3b_instruct.description',
  3, true, false,
  0.30, 0.80, 256, 1.10,
  70, 1856, 2863.69, 'UNTESTED',
  'system', 'system', 1
),
(
  'Ministral-3-3B-Reasoning-2512-q4f16_1-MLC',
  'Ministral 3 3B Reasoning',
  'system.entities.ai_model.ministral3_3b_reasoning.label',
  'system.entities.ai_model.ministral3_3b_reasoning.description',
  4, true, true,
  0.60, 0.95, 2048, 1.10,
  80, 1856, 2863.69, 'UNTESTED',
  'system', 'system', 1
),
(
  'Qwen3-0.6B-q4f16_1-MLC',
  'Qwen3 0.6B',
  'system.entities.ai_model.qwen3_0.6b.label',
  'system.entities.ai_model.qwen3_0.6b.description',
  1, true, true,
  0.60, 0.95, 2048, 1.10,
  90, 335, 1403.34, 'UNTESTED',
  'system', 'system', 1
),
(
  'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC',
  'Qwen2.5 Coder 0.5B',
  'system.entities.ai_model.qwen2.5_coder_0.5b.label',
  'system.entities.ai_model.qwen2.5_coder_0.5b.description',
  1, true, false,
  0.30, 0.80, 256, 1.10,
  100, 276, 944.62, 'UNTESTED',
  'system', 'system', 1
),
(
  'Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC',
  'Qwen2.5 Math 1.5B',
  'system.entities.ai_model.qwen2.5_math_1.5b.label',
  'system.entities.ai_model.qwen2.5_math_1.5b.description',
  2, true, false,
  0.30, 0.80, 256, 1.10,
  110, 840, 1629.75, 'UNTESTED',
  'system', 'system', 1
),
(
  'stablelm-2-zephyr-1_6b-q4f16_1-MLC',
  'StableLM 2 Zephyr 1.6B',
  'system.entities.ai_model.stablelm2_zephyr_1.6b.label',
  'system.entities.ai_model.stablelm2_zephyr_1.6b.description',
  2, true, false,
  0.30, 0.80, 256, 1.10,
  120, 890, 2087.66, 'UNTESTED',
  'system', 'system', 1
),
(
  'gemma-2b-it-q4f16_1-MLC',
  'Gemma 2 2B',
  'system.entities.ai_model.gemma2_2b.label',
  'system.entities.ai_model.gemma2_2b.description',
  2, true, false,
  0.30, 0.80, 256, 1.10,
  130, 1366, 1476.52, 'UNTESTED',
  'system', 'system', 1
)
ON CONFLICT ("model_id") DO NOTHING;

COMMIT;
