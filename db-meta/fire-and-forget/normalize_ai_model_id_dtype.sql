-- Normalize ai_models.model_id: bare HF repo id; dtype lives in the dtype column.
-- The variant identity is the derived key '<repo>#<dtype>' — computed at runtime,
-- never stored in ai_models.
--
-- ai_cerebellum.model_id keeps '<repo>#<dtype>' values (variant-scoped tunings:
-- dtype changes the perf envelope, so tunings belong to the variant, not the repo).
-- Its FK to ai_models(model_id) can no longer resolve bare repos and is dropped;
-- variant resolution is enforced at the app layer (variantKey).

BEGIN;

-- 1. Drop the cerebellum FK (targets the single-column unique we are replacing).
ALTER TABLE public.ai_cerebellum DROP CONSTRAINT IF EXISTS ai_cerebellum_model_id_fk;
COMMENT ON COLUMN public.ai_cerebellum.model_id IS 'Variant key "<repo>#<dtype>" — derived identity, see ai_models.model_id comment. Not a hard FK: resolved at the app layer.';

-- 2. Drop the single-column unique before stripping '#' (it would collide).
DROP INDEX IF EXISTS public.ai_models_model_id_uq;

-- 3. Strip the legacy '#<dtype>' suffix from model_id (dtype column already
--    carries the same value — verified identical on all rows).
UPDATE public.ai_models
SET model_id = split_part(model_id, '#', 1)
WHERE position('#' in model_id) > 0;

-- 4. Composite unique on (model_id, dtype) — matches the entity meta
--    (@Unique('ai_models_model_id_dtype_uq') on both columns).
--    NOT partial: soft-deleted rows still hold the key — a deleted variant
--    must be RESTORED, never duplicated (BE returns the deleted-exists
--    error so the FE can direct the user to restore).
CREATE UNIQUE INDEX IF NOT EXISTS ai_models_model_id_dtype_uq
  ON public.ai_models (model_id, dtype);

COMMENT ON COLUMN public.ai_models.model_id IS 'Bare HF repo id (e.g. onnx-community/Qwen3-4B-ONNX). The dtype column carries the quantization; the runtime variant key is "<model_id>#<dtype>", computed — never stored.';
COMMENT ON COLUMN public.ai_models.dtype IS 'ONNX quantization variant inside the repo (q4f16, fp16, fp32, q8…). Together with model_id forms the unique variant identity.';

COMMIT;
