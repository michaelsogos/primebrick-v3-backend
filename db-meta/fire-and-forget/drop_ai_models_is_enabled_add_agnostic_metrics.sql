-- Fire-and-forget:
--  1. ai_models: add agnostic architecture-derived metric columns
--     (kv_cache_bytes_per_token, flops_per_token, working_set_mb) — computed
--     from each model HuggingFace config.json, machine-independent.
--  2. Soft-delete the is_enabled=false alive rows — disabled is now
--     expressed by soft delete (recoverable, still in catalog snapshot).
--  3. Drop ai_models.is_enabled — CRUD back to standard soft-delete/restore.
--  4. Backfill derived metrics (ctx reference 8192).
--  5. Hard-delete dead translation keys.
--
-- REDIS CACHE INVALIDATION REQUIRED: translations:i18n:* and dal:ai_models*

BEGIN;

ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS kv_cache_bytes_per_token bigint;
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS flops_per_token numeric;
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS working_set_mb numeric;

UPDATE public.ai_models
SET deleted_at = now(), deleted_by = 'system', updated_at = now(), version = version + 1
WHERE is_enabled = false AND deleted_at IS NULL;

ALTER TABLE public.ai_models DROP COLUMN IF EXISTS is_enabled;

DELETE FROM system.translations
WHERE key IN (
  'system.entities.ai_model.fields.is_enabled',
  'system.entities.ai_model.enabled.true',
  'system.entities.ai_model.enabled.false'
);
UPDATE ai_models SET kv_cache_bytes_per_token = 196608, flops_per_token = 3422552064, working_set_mb = 2646, updated_at = now() WHERE model_id = 'HuggingFaceTB/SmolLM2-1.7B-Instruct' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 73728, flops_per_token = 6675234816, working_set_mb = NULL, updated_at = now() WHERE model_id = 'HuggingFaceTB/SmolLM3-3B-ONNX' AND dtype = 'bnb4';
UPDATE ai_models SET kv_cache_bytes_per_token = 73728, flops_per_token = 6675234816, working_set_mb = 6743, updated_at = now() WHERE model_id = 'HuggingFaceTB/SmolLM3-3B-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 73728, flops_per_token = 6675234816, working_set_mb = 3419, updated_at = now() WHERE model_id = 'HuggingFaceTB/SmolLM3-3B-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 73728, flops_per_token = 6675234816, working_set_mb = 2700, updated_at = now() WHERE model_id = 'HuggingFaceTB/SmolLM3-3B-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 73728, flops_per_token = 6675234816, working_set_mb = NULL, updated_at = now() WHERE model_id = 'HuggingFaceTB/SmolLM3-3B-ONNX' AND dtype = 'q8';
UPDATE ai_models SET kv_cache_bytes_per_token = 20480, flops_per_token = 1128267776, working_set_mb = 677, updated_at = now() WHERE model_id = 'onnx-community/Apertus-v1.1-0.5B-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 20480, flops_per_token = 1128267776, working_set_mb = 560, updated_at = now() WHERE model_id = 'onnx-community/Apertus-v1.1-0.5B-Instruct-QAD-INT4-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 3825205248, working_set_mb = 1496, updated_at = now() WHERE model_id = 'onnx-community/Apertus-v1.1-1.5B-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 3825205248, working_set_mb = 1156, updated_at = now() WHERE model_id = 'onnx-community/Apertus-v1.1-1.5B-Instruct-QAD-INT4-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 98304, flops_per_token = 10066329600, working_set_mb = 3768, updated_at = now() WHERE model_id = 'onnx-community/Apertus-v1.1-4B-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 98304, flops_per_token = 10066329600, working_set_mb = 3168, updated_at = now() WHERE model_id = 'onnx-community/Apertus-v1.1-4B-Instruct-QAD-INT4-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = 496, updated_at = now() WHERE model_id = 'onnx-community/Atomight-V2.2-UltraThink-0.5B-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 3439808512, working_set_mb = 2016, updated_at = now() WHERE model_id = 'onnx-community/Bonsai-1.7B-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 196608, flops_per_token = 2692743168, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/deepseek-coder-1.3b-instruct-ONNX' AND dtype = 'bnb4';
UPDATE ai_models SET kv_cache_bytes_per_token = 196608, flops_per_token = 2692743168, working_set_mb = 4229, updated_at = now() WHERE model_id = 'onnx-community/deepseek-coder-1.3b-instruct-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 196608, flops_per_token = 2692743168, working_set_mb = 2601, updated_at = now() WHERE model_id = 'onnx-community/deepseek-coder-1.3b-instruct-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 196608, flops_per_token = 2692743168, working_set_mb = 2389, updated_at = now() WHERE model_id = 'onnx-community/deepseek-coder-1.3b-instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 196608, flops_per_token = 2692743168, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/deepseek-coder-1.3b-instruct-ONNX' AND dtype = 'q8';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3553886208, working_set_mb = 3724, updated_at = now() WHERE model_id = 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3553886208, working_set_mb = 2224, updated_at = now() WHERE model_id = 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3553886208, working_set_mb = 1724, updated_at = now() WHERE model_id = 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 1191968768, working_set_mb = 1296, updated_at = now() WHERE model_id = 'onnx-community/distil-qwen3-0.6b-text2sql-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 18432, flops_per_token = 721420288, working_set_mb = 533, updated_at = now() WHERE model_id = 'onnx-community/ERNIE-4.5-0.3B-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 73728, flops_per_token = 3338665984, working_set_mb = 1906, updated_at = now() WHERE model_id = 'onnx-community/Falcon3-1B-Instruct' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 121634816, working_set_mb = 296, updated_at = now() WHERE model_id = 'onnx-community/Falcon-H1-Tiny-90M-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 155189248, working_set_mb = 316, updated_at = now() WHERE model_id = 'onnx-community/Falcon-H1-Tiny-Multilingual-100M-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 18432, flops_per_token = 871628800, working_set_mb = 571, updated_at = now() WHERE model_id = 'onnx-community/functiongemma-270m-it-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 26624, flops_per_token = 1999503360, working_set_mb = 971, updated_at = now() WHERE model_id = 'onnx-community/gemma-3-1b-it-ONNX-GQA' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 26624, flops_per_token = 1999503360, working_set_mb = 971, updated_at = now() WHERE model_id = 'onnx-community/gemma-3-1b-it-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 18432, flops_per_token = 536084480, working_set_mb = 417, updated_at = now() WHERE model_id = 'onnx-community/gemma-3-270m-it-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 5066731520, working_set_mb = 2640, updated_at = now() WHERE model_id = 'onnx-community/granite-3.0-2b-instruct' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 5066731520, working_set_mb = 2640, updated_at = now() WHERE model_id = 'onnx-community/granite-3.0-2b-instruct' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 5066731520, working_set_mb = 2640, updated_at = now() WHERE model_id = 'onnx-community/granite-3.0-2b-instruct' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 3263168512, working_set_mb = 3944, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-1b-ONNX-web' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 3263168512, working_set_mb = 2428, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-1b-ONNX-web' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 3263168512, working_set_mb = 1894, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-1b-ONNX-web' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 704643072, working_set_mb = 574, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-350m-ONNX-web' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 704643072, working_set_mb = 574, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-350m-ONNX-web' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 704643072, working_set_mb = 574, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-350m-ONNX-web' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 2321547264, working_set_mb = 2140, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-h-1b-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 556793856, working_set_mb = 911, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-h-350m-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 556793856, working_set_mb = 509, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-h-350m-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 556793856, working_set_mb = 487, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-h-350m-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 5276434432, working_set_mb = 7031, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-h-micro-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 5276434432, working_set_mb = 2801, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-h-micro-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 5276434432, working_set_mb = 2590, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-h-micro-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 81920, flops_per_token = 6805258240, working_set_mb = 3324, updated_at = now() WHERE model_id = 'onnx-community/granite-4.0-micro-ONNX-web' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 18432, flops_per_token = 871633920, working_set_mb = 571, updated_at = now() WHERE model_id = 'onnx-community/Home-FunctionGemma-270m-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 3288334336, working_set_mb = 1056, updated_at = now() WHERE model_id = 'onnx-community/LFM2-1.2B-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 3288334336, working_set_mb = 1456, updated_at = now() WHERE model_id = 'onnx-community/LFM2-1.2B-Tool-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 1023410176, working_set_mb = 606, updated_at = now() WHERE model_id = 'onnx-community/LFM2-350M-Extract-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 1023410176, working_set_mb = 511, updated_at = now() WHERE model_id = 'onnx-community/LFM2-350M-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 889192448, working_set_mb = 511, updated_at = now() WHERE model_id = 'onnx-community/LFM2.5-350M-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 2113929216, working_set_mb = 756, updated_at = now() WHERE model_id = 'onnx-community/LFM2-700M-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 2471493632, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-1B-Instruct-ONNX' AND dtype = 'bnb4';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 2471493632, working_set_mb = 2744, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-1B-Instruct-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 2471493632, working_set_mb = 1949, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-1B-Instruct-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 2471493632, working_set_mb = 1346, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-1B-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 2471493632, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-1B-Instruct-ONNX' AND dtype = 'q8';
UPDATE ai_models SET kv_cache_bytes_per_token = 32768, flops_per_token = 2471493632, working_set_mb = 1494, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-1B-Instruct-q4f16' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 6425149440, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-3B-Instruct-ONNX' AND dtype = 'bnb4';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 6425149440, working_set_mb = 9456, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-3B-Instruct-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 6425149440, working_set_mb = 4301, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-3B-Instruct-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 6425149440, working_set_mb = 3303, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-3B-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 6425149440, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Llama-3.2-3B-Instruct-ONNX' AND dtype = 'q8';
UPDATE ai_models SET kv_cache_bytes_per_token = 23040, flops_per_token = 286064640, working_set_mb = 305, updated_at = now() WHERE model_id = 'onnx-community/MobileLLM-125M' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 262144, flops_per_token = 4831838208, working_set_mb = 3848, updated_at = now() WHERE model_id = 'onnx-community/nanochat-d32-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = 570, updated_at = now() WHERE model_id = 'onnx-community/NuExtract-1.5-tiny-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 1191968768, working_set_mb = 1457, updated_at = now() WHERE model_id = 'onnx-community/Osmosis-Structure-0.6B-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 393216, flops_per_token = 7641759744, working_set_mb = 11072, updated_at = now() WHERE model_id = 'onnx-community/Phi-3.5-mini-instruct-ONNX-GQA' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 393216, flops_per_token = 7641759744, working_set_mb = 5772, updated_at = now() WHERE model_id = 'onnx-community/Phi-3.5-mini-instruct-ONNX-GQA' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 393216, flops_per_token = 7641759744, working_set_mb = 5257, updated_at = now() WHERE model_id = 'onnx-community/Phi-3.5-mini-instruct-ONNX-GQA' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 393216, flops_per_token = 7641759744, working_set_mb = 6940, updated_at = now() WHERE model_id = 'onnx-community/Phi-3.5-mini-instruct-onnx-web' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 393216, flops_per_token = 7641759744, working_set_mb = 10715, updated_at = now() WHERE model_id = 'onnx-community/Phi-3-mini-4k-instruct-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 393216, flops_per_token = 7641759744, working_set_mb = 5795, updated_at = now() WHERE model_id = 'onnx-community/Phi-3-mini-4k-instruct-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 393216, flops_per_token = 7641759744, working_set_mb = 6940, updated_at = now() WHERE model_id = 'onnx-community/Phi-3-mini-4k-instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 131072, flops_per_token = 7671644160, working_set_mb = 8722, updated_at = now() WHERE model_id = 'onnx-community/Phi-4-mini-instruct-ONNX-GQA' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 131072, flops_per_token = 7671644160, working_set_mb = 5548, updated_at = now() WHERE model_id = 'onnx-community/Phi-4-mini-instruct-ONNX-GQA' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 131072, flops_per_token = 7671644160, working_set_mb = 4892, updated_at = now() WHERE model_id = 'onnx-community/Phi-4-mini-instruct-ONNX-GQA' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 131072, flops_per_token = 7671644160, working_set_mb = 4892, updated_at = now() WHERE model_id = 'onnx-community/Phi-4-mini-instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 131072, flops_per_token = 7671644160, working_set_mb = 4434, updated_at = now() WHERE model_id = 'onnx-community/Phi-4-mini-instruct-web-q4f16' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 98304, flops_per_token = 927727616, working_set_mb = 1268, updated_at = now() WHERE model_id = 'onnx-community/Qwen1.5-0.5B-Chat-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = 596, updated_at = now() WHERE model_id = 'onnx-community/Qwen2-0.5B-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = 496, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct-abliterated-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct' AND dtype = 'bnb4';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = 1093, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = 1107, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct' AND dtype = 'fp32';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = 882, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = 796, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-0.5B-Instruct' AND dtype = 'q8';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-1.5B-Instruct' AND dtype = 'bnb4';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = 3329, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-1.5B-Instruct' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = 6408, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-1.5B-Instruct' AND dtype = 'fp32';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = 2012, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-1.5B-Instruct' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = 1446, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-1.5B-Instruct' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = 1854, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-1.5B-Instruct' AND dtype = 'q8';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 987922432, working_set_mb = 596, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-0.5B-Instruct' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-1.5B-Instruct' AND dtype = 'bnb4';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = 3788, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-1.5B-Instruct' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = 2140, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-1.5B-Instruct' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = 1854, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-1.5B-Instruct' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-1.5B-Instruct' AND dtype = 'q8';
UPDATE ai_models SET kv_cache_bytes_per_token = 36864, flops_per_token = 6171394048, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct' AND dtype = 'bnb4';
UPDATE ai_models SET kv_cache_bytes_per_token = 36864, flops_per_token = 6171394048, working_set_mb = 7092, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 36864, flops_per_token = 6171394048, working_set_mb = 3479, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 36864, flops_per_token = 6171394048, working_set_mb = 2545, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 36864, flops_per_token = 6171394048, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct' AND dtype = 'q8';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 1191968768, working_set_mb = 1296, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-0.6B-DQ-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 1191968768, working_set_mb = 1466, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-0.6B-heretic-abliterated-uncensored-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 1191968768, working_set_mb = 1466, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-0.6B-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 1191968768, working_set_mb = 1466, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-0.6B-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 3440902144, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-1.7B-ONNX' AND dtype = 'bnb4';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 3440902144, working_set_mb = 4348, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-1.7B-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 3440902144, working_set_mb = 3043, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-1.7B-ONNX' AND dtype = 'q4';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 3440902144, working_set_mb = 2933, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-1.7B-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 114688, flops_per_token = 3440902144, working_set_mb = NULL, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-1.7B-ONNX' AND dtype = 'q8';
UPDATE ai_models SET kv_cache_bytes_per_token = 147456, flops_per_token = 8044544000, working_set_mb = 9207, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-4B-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 147456, flops_per_token = 8044544000, working_set_mb = 4584, updated_at = now() WHERE model_id = 'onnx-community/Qwen3-4B-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 36864, flops_per_token = 6171394048, working_set_mb = 2288, updated_at = now() WHERE model_id = 'onnx-community/SmallThinker-3B-Preview-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 23040, flops_per_token = 268959744, working_set_mb = 450, updated_at = now() WHERE model_id = 'onnx-community/SmolLM-135M-Instruct-fp16-ONNX' AND dtype = 'fp16';
UPDATE ai_models SET kv_cache_bytes_per_token = 23040, flops_per_token = 268959744, working_set_mb = 315, updated_at = now() WHERE model_id = 'onnx-community/SmolLM2-135M-Instruct-ONNX-MHA' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 40960, flops_per_token = 723517440, working_set_mb = 680, updated_at = now() WHERE model_id = 'onnx-community/SmolLM2-360M-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 768, flops_per_token = 1597440, working_set_mb = 8, updated_at = now() WHERE model_id = 'onnx-community/Supra2-Nano-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 12288, flops_per_token = 103546880, working_set_mb = 146, updated_at = now() WHERE model_id = 'onnx-community/Supra-50M-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 22528, flops_per_token = 2199912448, working_set_mb = 876, updated_at = now() WHERE model_id = 'onnx-community/TinyLlama-1.1B-Chat-v1.0-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 28672, flops_per_token = 3087138816, working_set_mb = 1724, updated_at = now() WHERE model_id = 'onnx-community/TinySwallow-1.5B-Instruct-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 57344, flops_per_token = 2170552320, working_set_mb = 3448, updated_at = now() WHERE model_id = 'onnx-community/Trinity-Nano-Preview-ONNX' AND dtype = 'q4f16';
UPDATE ai_models SET kv_cache_bytes_per_token = 43008, flops_per_token = 5033164800, working_set_mb = 1536, updated_at = now() WHERE model_id = 'RASMUS/MiniCPM5-2B-ONNX' AND dtype = 'q4f16';
COMMIT;
