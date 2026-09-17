-- Enrich ai_models.name with parameter counts + quantization for ONNX models.
-- The `name` column is the single display name used by the FE in:
--   - /system/settings/ai page (model list)
--   - AI assistant sheet model selector dropdown
-- Previously name was a short label without parameter count or quantization.
-- Now it includes both (e.g. "Qwen2.5 Coder 3B (q4f16)") so users can:
--   - Compare model sizes at a glance
--   - Distinguish quantization variants of the same model family
--   - Evaluate power_level against actual parameter count
--
-- Derivation logic:
--   1. If name already ends with a quantization token like (q4f16), (fp16),
--      (q4), (int8), (q8), strip it, apply step 2-3, then re-append.
--   2. If name does not contain a parameter count (e.g. "3B", "1.5B", "700M"),
--      insert it based on known model family → params mapping.
--   3. Append the dtype from the `dtype` column in parentheses.

-- Drop the display_name column if it was added by a previous run of this patch.
ALTER TABLE ai_models DROP COLUMN IF EXISTS display_name;

-- Step 1: Strip existing quantization suffix from name (we'll re-add it).
UPDATE ai_models
SET name = regexp_replace(name, '\s*\((q[0-9]+f?16?|fp16|int8|q8|q4)\)$', '')
WHERE deleted_at IS NULL;

-- Step 2: Add parameter count to names that don't have one.
-- Map model_id → parameter count. Only for models missing the count in name.
UPDATE ai_models
SET name = CASE
    -- LFM2-700M → LFM2 700M (normalize dash to space)
    WHEN model_id = 'onnx-community/LFM2-700M-ONNX#q4f16' THEN 'LFM2 700M'
    -- Granite 4.0 Micro Web → 3B params
    WHEN model_id = 'onnx-community/granite-4.0-micro-ONNX-web#q4f16' THEN 'Granite 4.0 Micro 3B Web'
    -- Granite 4.0 H micro → 3B params (hybrid Mamba)
    WHEN model_id = 'onnx-community/granite-4.0-h-micro-ONNX#q4f16' THEN 'Granite 4.0 H Micro 3B'
    -- Granite-4.0-H-1b → 1.5B params (normalize name)
    WHEN model_id = 'onnx-community/granite-4.0-h-1b-ONNX#q4f16' THEN 'Granite 4.0 H 1.5B'
    -- Phi 3 mini 4k → 3.8B params
    WHEN model_id LIKE 'onnx-community/Phi-3-mini-4k-instruct-ONNX#%' THEN 'Phi 3 Mini 4K 3.8B'
    -- Phi 3.5 mini → 3.8B params
    WHEN model_id = 'onnx-community/Phi-3.5-mini-instruct-onnx-web#q4f16' THEN 'Phi 3.5 Mini 3.8B'
    -- Phi 3.5 Mini GQA → 3.8B params
    WHEN model_id = 'onnx-community/Phi-3.5-mini-instruct-ONNX-GQA#q4f16' THEN 'Phi 3.5 Mini GQA 3.8B'
    -- Trinity Nano Preview → 6B MoE (1B active)
    WHEN model_id = 'onnx-community/Trinity-Nano-Preview-ONNX#q4f16' THEN 'Trinity Nano Preview 6B MoE'
    -- LFM2 1.2B Tool → already has 1.2B
    -- LFM2-1.2B → normalize dash
    WHEN model_id = 'onnx-community/LFM2-1.2B-ONNX#q4f16' THEN 'LFM2 1.2B'
    -- Keep names that already have param count
    ELSE name
    END
WHERE deleted_at IS NULL;

-- Step 3: Append quantization (dtype) in parentheses.
UPDATE ai_models
SET name = CASE
    -- name already has a quantization suffix in parentheses → keep as-is
    WHEN name ~ '\((q[0-9]+f?16?|fp16|int8|q8|q4)\)$' THEN name
    -- ONNX models with dtype → append (dtype)
    WHEN dtype IS NOT NULL AND dtype != '' THEN name || ' (' || dtype || ')'
    -- WebLLM models → try extracting quant from model_id
    WHEN model_id ~ 'q[0-9]+f?16?(_[0-9]+)?-MLC$' THEN
        name || ' (' || substring(model_id FROM '(q[0-9]+f?16?)') || ')'
    WHEN model_id ~ 'fp16(_[0-9]+)?-MLC$' THEN
        name || ' (fp16)'
    -- Fallback: just use name
    ELSE name
    END
WHERE deleted_at IS NULL;
