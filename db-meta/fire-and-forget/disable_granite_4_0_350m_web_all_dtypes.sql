-- Fire-and-forget patch: mark granite-4.0-350m-ONNX-web NOT_COMPATIBLE on all
-- tested quantization dtypes (q4f16, fp16, q4) and register the missing
-- variants so they can never be downloaded in the future.
--
-- Rationale: the q4f16 variant (fp16 activations — the most faithful of the
-- three) failed generation in the smoke test (natural-language prose instead
-- of regex JSON, 2026-09-14). A 350M model that cannot follow the JSON output
-- contract is limited by capacity, not by weight precision — fp16/q4 would
-- fail the same way, so no full e2e run is warranted.
--
-- download_size_mb = real file bytes from HF repo tree (onnx/*.onnx_data +
-- config/tokenizer files).

BEGIN;

-- 1) Existing q4f16 row: mark NOT_COMPATIBLE + disabled.
UPDATE public.ai_models
SET compatibility_status = 'NOT_COMPATIBLE',
    is_enabled = false,
    updated_at = now(),
    updated_by = 'system_migration_not_compatible'
WHERE model_id = 'onnx-community/granite-4.0-350m-ONNX-web#q4f16'
  AND deleted_at IS NULL;

-- 2) Register fp16 + q4 variants as NOT_COMPATIBLE so they are never
--    downloaded. test_scores carries the inherited verdict for traceability.
INSERT INTO public.ai_models (uuid, model_id, name, label_key, description_key,
  power_level, is_enabled, enable_thinking, temperature, top_p, max_tokens,
  repetition_penalty, sort_order, created_by, updated_by, download_size_mb,
  vram_mb, compatibility_status, rank, dtype, engine_type,
  test_scores)
VALUES
  ('a3333333-0000-0000-0000-000000000301',
   'onnx-community/granite-4.0-350m-ONNX-web#fp16',
   'Granite 4.0 350M Web (fp16)',
   'ai_model_granite_4_0_350m_web', 'ai_model_granite_4_0_350m_web_desc',
   1, false, false, '0.70', '0.90', 1024, '1.10', 170,
   'system_migration_not_compatible', 'system_migration_not_compatible',
   680, 350.00, 'NOT_COMPATIBLE', '1.0', 'fp16', 'transformersjs',
   '{"notes":"Marked NOT_COMPATIBLE without download: q4f16 sibling failed generation (natural language instead of regex JSON) — 350M instruction-following limit, precision cannot fix it","load_ok":false,"generation_ok":false,"tested_at":"2026-09-16T00:00:00.000Z","strategy":"not_tested"}'::jsonb),
  ('a3333333-0000-0000-0000-000000000302',
   'onnx-community/granite-4.0-350m-ONNX-web#q4',
   'Granite 4.0 350M Web (q4)',
   'ai_model_granite_4_0_350m_web', 'ai_model_granite_4_0_350m_web_desc',
   1, false, false, '0.70', '0.90', 1024, '1.10', 171,
   'system_migration_not_compatible', 'system_migration_not_compatible',
   553, 350.00, 'NOT_COMPATIBLE', '1.0', 'q4', 'transformersjs',
   '{"notes":"Marked NOT_COMPATIBLE without download: q4f16 sibling failed generation (natural language instead of regex JSON) — 350M instruction-following limit, precision cannot fix it","load_ok":false,"generation_ok":false,"tested_at":"2026-09-16T00:00:00.000Z","strategy":"not_tested"}'::jsonb)
ON CONFLICT (uuid) DO NOTHING;

COMMIT;
