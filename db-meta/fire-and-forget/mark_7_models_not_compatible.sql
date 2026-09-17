-- Fire-and-forget: Mark 7 models as NOT_COMPATIBLE based on empirical testing.
--
-- These models produced ZERO valid regex output across all tests (E2E + harness):
--   - SmallThinker 3B Preview: thinking prose only
--   - TinyLlama 1.1B Chat v1.0: placeholder "..." only
--   - Granite 4.0 H 350m: echo of prompt
--   - ERNIE 4.5 0.3B: tool calling, no regex
--   - Qwen3 0.6B DQ: thinking prose only
--   - Qwen1.5 0.5B Chat: literal "..." output
--   - DeepSeek R1 Distill Qwen 1.5B: thinking prose only
--
-- They are marked NOT_COMPATIBLE and disabled so they no longer appear in the
-- Smart Regex model selector and will not be re-tested.
--
-- Date: 2026-09-14

UPDATE "public"."ai_models"
SET compatibility_status = 'NOT_COMPATIBLE',
    is_enabled = false,
    updated_at = NOW(),
    updated_by = 'system_empirical_test',
    version = version + 1
WHERE model_id IN (
  'onnx-community/SmallThinker-3B-Preview-ONNX#q4f16',
  'onnx-community/TinyLlama-1.1B-Chat-v1.0-ONNX#q4f16',
  'onnx-community/granite-4.0-h-350m-ONNX#q4f16',
  'onnx-community/ERNIE-4.5-0.3B-ONNX#q4f16',
  'onnx-community/Qwen3-0.6B-DQ-ONNX#q4f16',
  'onnx-community/Qwen1.5-0.5B-Chat-ONNX#q4f16',
  'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX#q4f16'
)
  AND deleted_at IS NULL;
