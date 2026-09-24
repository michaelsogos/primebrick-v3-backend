-- Fire-and-forget: create missing ai_cerebellum rows for enabled+COMPATIBLE
-- models, copying tuning values from the most similar existing row:
--   - regex × granite-4.0-micro-ONNX-web#q4f16    ← same model's json_config row
--   - json_config+regex × Qwen2.5-Coder-1.5B#q4f16 ← Qwen2.5-Coder-3B#q4f16
--   - json_config+regex × Qwen2.5-Coder-3B#q4      ← Qwen2.5-Coder-3B#q4f16
--   - regex × Qwen3-4B-ONNX#q4f16                  ← Qwen3-4B-ONNX#fp16 regex row
-- NOT_COMPATIBLE models (Phi-4-mini ×3) are intentionally skipped.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'dal:ai_cerebellum:*' | xargs redis-cli del

BEGIN;

-- regex × granite-4.0-micro — copy from the same model's json_config row
INSERT INTO public.ai_cerebellum
  (uuid, assistant_key, model_id, name, description_key, enable_thinking,
   temperature, top_p, max_tokens, repetition_penalty, execution_config,
   test_scores, recommendation, created_at, created_by, updated_at, updated_by, version)
SELECT gen_random_uuid(), 'regex', model_id,
       'app.smart.regex.ai.cerebellum_name', NULL, enable_thinking,
       temperature, top_p, max_tokens, repetition_penalty, execution_config,
       NULL, NULL, now(), 'devin', now(), 'devin', 1
FROM public.ai_cerebellum
WHERE assistant_key = 'json_config'
  AND model_id = 'onnx-community/granite-4.0-micro-ONNX-web#q4f16'
  AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.ai_cerebellum t
    WHERE t.assistant_key = 'regex'
      AND t.model_id = 'onnx-community/granite-4.0-micro-ONNX-web#q4f16'
      AND t.deleted_at IS NULL
  );

-- json_config + regex × Qwen2.5-Coder-1.5B and Qwen2.5-Coder-3B#q4 —
-- copy from the Qwen2.5-Coder-3B#q4f16 rows (same family, sibling variant)
INSERT INTO public.ai_cerebellum
  (uuid, assistant_key, model_id, name, description_key, enable_thinking,
   temperature, top_p, max_tokens, repetition_penalty, execution_config,
   test_scores, recommendation, created_at, created_by, updated_at, updated_by, version)
SELECT gen_random_uuid(), src.assistant_key, dst.model_id, src.name,
       NULL, src.enable_thinking,
       src.temperature, src.top_p, src.max_tokens, src.repetition_penalty,
       src.execution_config, NULL,
       -- Qwen2.5-Coder-1.5B gets no recommendation badge (untested variant);
       -- the other copies inherit the source row's recommendation
       CASE WHEN dst.model_id = 'onnx-community/Qwen2.5-Coder-1.5B-Instruct#q4f16'
            THEN NULL ELSE src.recommendation END,
       now(), 'devin', now(), 'devin', 1
FROM public.ai_cerebellum src
CROSS JOIN (VALUES
  ('onnx-community/Qwen2.5-Coder-1.5B-Instruct#q4f16'),
  ('onnx-community/Qwen2.5-Coder-3B-Instruct#q4')
) AS dst(model_id)
WHERE src.model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16'
  AND src.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.ai_cerebellum t
    WHERE t.assistant_key = src.assistant_key
      AND t.model_id = dst.model_id
      AND t.deleted_at IS NULL
  );

-- regex × Qwen3-4B#q4f16 — copy from the fp16 variant's regex row
INSERT INTO public.ai_cerebellum
  (uuid, assistant_key, model_id, name, description_key, enable_thinking,
   temperature, top_p, max_tokens, repetition_penalty, execution_config,
   test_scores, recommendation, created_at, created_by, updated_at, updated_by, version)
SELECT gen_random_uuid(), 'regex', 'onnx-community/Qwen3-4B-ONNX#q4f16',
       'app.smart.regex.ai.cerebellum_name', NULL, enable_thinking,
       temperature, top_p, max_tokens, repetition_penalty, execution_config,
       NULL, NULL, now(), 'devin', now(), 'devin', 1
FROM public.ai_cerebellum
WHERE assistant_key = 'regex'
  AND model_id = 'onnx-community/Qwen3-4B-ONNX#fp16'
  AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.ai_cerebellum t
    WHERE t.assistant_key = 'regex'
      AND t.model_id = 'onnx-community/Qwen3-4B-ONNX#q4f16'
      AND t.deleted_at IS NULL
  );

-- Qwen3-4B#fp16 (pre-existing rows): RECOMMENDED for both assistants
UPDATE public.ai_cerebellum
SET recommendation = 'RECOMMENDED', updated_at = now(), updated_by = 'devin',
    version = version + 1
WHERE model_id = 'onnx-community/Qwen3-4B-ONNX#fp16'
  AND deleted_at IS NULL
  AND recommendation IS DISTINCT FROM 'RECOMMENDED';

COMMIT;
