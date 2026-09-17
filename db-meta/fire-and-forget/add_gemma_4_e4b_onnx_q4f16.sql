-- Fire-and-forget migration: add onnx-community/gemma-4-E4B-it-ONNX#q4f16
-- for empirical evaluation against the regex-assistant harness.
--
-- Notes:
-- - Gemma 4 E4B: ~4.5B effective params (~8B incl. embeddings), 42 layers,
--   128K context, native system role, multimodal (text/image/audio in, text out).
-- - q4f16 dtype files (HF repo tree, 2026-04): decoder_model_merged_q4f16
--   ~1979MB + embed_tokens_q4f16 ~1924MB (+ optional vision/audio encoders
--   ~260MB, not fetched by the text-generation pipeline). download_size_mb
--   records the text-path weight bytes; corrected after the run if evidence
--   differs.
-- - enable_thinking=false: thinking mode exists but is disabled per protocol.
-- - execution_config=NULL → safe fallback (no KV reuse, sliding window);
--   the harness will fill it with measured values.
-- - compatibility_status=COMPATIBLE is required for the model to appear in
--   the FE selector (the DAL pre-filters non-COMPATIBLE rows). The owner
--   decides the final status after reading the persisted evidence.
-- Date: 2026-09-17

BEGIN;

INSERT INTO "public"."ai_models" (uuid, model_id, name, power_level, is_enabled, enable_thinking,
  temperature, top_p, max_tokens, repetition_penalty, sort_order,
  created_by, updated_by, download_size_mb, vram_mb, compatibility_status, rank, dtype, engine_type, execution_config)
VALUES
  ('a7777777-0000-4000-8000-000000000702','onnx-community/gemma-4-E4B-it-ONNX#q4f16','Gemma 4 E4B it (q4f16)',3,true,false,'0.00','0.80',256,'1.10',121,'system_migration_gemma4_eval','system_migration_gemma4_eval',3903,NULL,'COMPATIBLE','1.0','q4f16','onnx',NULL)
ON CONFLICT (uuid) DO NOTHING;

COMMIT;
