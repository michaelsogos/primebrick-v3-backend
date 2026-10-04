-- Primebrick: normalize ai_cerebellum model variant identity.
-- model_id becomes the BARE ai_models.model_id; dtype holds the variant
-- quantization (NULL for WebLLM models that encode it in model_id).
-- Runtime variant key remains `${model_id}#${dtype}` (modelVariantKey()).
-- Unique (assistant_key, model_id, dtype) NULLS NOT DISTINCT, non-partial:
-- a soft-deleted row reserves the key → recreate raises ERR04/ERR05.
-- Apply manually to existing DBs. Idempotent.

ALTER TABLE "public"."ai_cerebellum"
  ADD COLUMN IF NOT EXISTS "dtype" varchar(40);

-- Drop the 2-column unique FIRST: sibling dtype variants of the same repo
-- (e.g. Qwen3-4B-ONNX fp16 + q4f16) collapse onto the same bare model_id
-- during backfill and would violate it.
DROP INDEX IF EXISTS "public"."ai_cerebellum_assistant_model_uq";

-- Backfill: split 'repo#dtype'; when no '#', resolve dtype via ai_models
-- (e.g. E2E lifecycle models stored bare).
UPDATE "public"."ai_cerebellum" c SET
  "dtype" = COALESCE(
    NULLIF(split_part(c."model_id", '#', 2), ''),
    (SELECT m."dtype" FROM "public"."ai_models" m
      WHERE m."model_id" = c."model_id" AND m."deleted_at" IS NULL
      LIMIT 1)),
  "model_id" = split_part(c."model_id", '#', 1)
WHERE c."dtype" IS NULL OR position('#' in c."model_id") > 0;

-- New uniqueness model: non-partial, NULLS NOT DISTINCT so a
-- NULL-dtype (WebLLM) variant still enforces the triple.
CREATE UNIQUE INDEX IF NOT EXISTS "ai_cerebellum_assistant_model_dtype_uq"
  ON "public"."ai_cerebellum" ("assistant_key", "model_id", "dtype")
  NULLS NOT DISTINCT;

COMMENT ON COLUMN public.ai_cerebellum.model_id IS 'FK → ai_models.model_id (business key part of the variant identity)';
COMMENT ON COLUMN public.ai_cerebellum.dtype IS 'Model variant dtype (e.g. q4f16); NULL = WebLLM variant. Mirrors ai_models.dtype.';

-- list-config column label (en-GB + it-IT)
INSERT INTO system.translations (key, language, value, created_by, updated_by) VALUES
  ('system.entities.ai_cerebellum.fields.dtype', 'en-GB', 'Dtype', 'devin', 'devin'),
  ('system.entities.ai_cerebellum.fields.dtype', 'it-IT', 'Dtype', 'devin', 'devin')
ON CONFLICT (key, language) DO NOTHING;
