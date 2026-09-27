-- Fire-and-forget: engine_type normalization + derived working_set + power_level
--
-- 1. Add ws provenance columns (working_set_source / working_set_detail).
--    'e2e_measured' values come from GPUBuffer-tracked VRAM in the FE worker
--    and already include KV — ws is REPLACED, never kv re-added.
-- 2. Normalize engine_type 'transformersjs' → 'onnx' (post-rename typo used
--    by 5 later scripts; same engine, DTO enum only allows 'onnx'/'webllm').
-- 3. Backfill kv_cache_bytes_per_token for ONNX rows missing it — values
--    computed from each repo's HF config.json:
--      kv = 2 × attention_layers × kv_heads × head_dim × 2B (fp16 KV)
--    Nemotron-3-Nano is a hybrid mamba/attention MoE — only its 4 attention
--    layers hold KV; mamba state is constant-size (weights, not per-token).
--    flops_per_token stays NULL for these rows: HF exposes no parameter
--    count for ONNX repos (safetensors metadata absent).
-- 4. Fill working_set_mb on every onnx row where derivable:
--      ws = COALESCE(vram_mb, download_size_mb) + kv_cache_bytes_per_token×8192
--    Verified formula: exact match on all 65 previously computed rows.
-- 5. Recompute power_level = bucket(working_set_mb) on EVERY onnx row —
--    agnostic, regardless of deleted/compatibility status:
--      ≤1200→1, ≤2200→2, ≤4000→3, ≤7000→4, else 5 (same LEVEL_REQUIREMENT_MB
--      the FE machine rank uses → power_level <= machine_rank means "fits").
--
-- REDIS CACHE INVALIDATION REQUIRED: dal:ai_models* (entity @Cached 5min).
--
-- Expected impact (verified on live DB):
--   47 engine_type renames; ws recomputed on ~96 onnx rows;
--   4 rows corrected for KV double-count (source → e2e_measured), incl.
--   one ALIVE model: Phi-3.5-mini-instruct-ONNX-GQA#q4f16 ws 5257→2185
--   (real measured footprint — power_level 4→2, correct per measure);
--   38 further power_level changes (all 2→1, small deleted models);
--   26 webllm rows untouched.

BEGIN;

-- ─── 0. Columns ───
ALTER TABLE public.ai_models
  ADD COLUMN IF NOT EXISTS working_set_source varchar(20) NOT NULL DEFAULT 'hf_estimate',
  ADD COLUMN IF NOT EXISTS working_set_detail jsonb;
COMMENT ON COLUMN public.ai_models.working_set_source IS
 'hf_estimate = COALESCE(vram_mb,download_size_mb)+kv*8192; e2e_measured = GPUBuffer-tracked total (KV already inside, never re-add)';
COMMENT ON COLUMN public.ai_models.working_set_detail IS
 '{weights_mb,kv_mb,ctx_ref,measured_vram_bytes,measured_at,measured_ctx_tokens}';

-- ─── 1. engine_type typo normalization ───
UPDATE public.ai_models
SET engine_type = 'onnx', updated_at = now(), updated_by = 'system_engine_normalize', version = version + 1
WHERE engine_type = 'transformersjs';

-- ─── 2. kv_cache_bytes_per_token backfill (group B — config.json derived) ───
UPDATE ai_models SET kv_cache_bytes_per_token = 76800,  updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1 WHERE model_id = 'onnx-community/EXAONE-3.5-2.4B-Instruct'          AND kv_cache_bytes_per_token IS NULL;
UPDATE ai_models SET kv_cache_bytes_per_token = 35840,  updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1 WHERE model_id = 'onnx-community/gemma-4-E2B-it-ONNX'               AND kv_cache_bytes_per_token IS NULL;
UPDATE ai_models SET kv_cache_bytes_per_token = 86016,  updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1 WHERE model_id = 'onnx-community/gemma-4-E4B-it-ONNX'               AND kv_cache_bytes_per_token IS NULL;
UPDATE ai_models SET kv_cache_bytes_per_token = 16384,  updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1 WHERE model_id = 'onnx-community/NVIDIA-Nemotron-3-Nano-4B-BF16-ONNX' AND kv_cache_bytes_per_token IS NULL;
UPDATE ai_models SET kv_cache_bytes_per_token = 49152,  updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1 WHERE model_id = 'onnx-community/Qwen3.5-2B-ONNX'                   AND kv_cache_bytes_per_token IS NULL;
UPDATE ai_models SET kv_cache_bytes_per_token = 131072, updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1 WHERE model_id = 'onnx-community/Qwen3.5-4B-ONNX'                   AND kv_cache_bytes_per_token IS NULL;

-- ─── 3. working_set_mb — recompute EVERY onnx hf_estimate row ───
-- Idempotent: exact formula already verified on all 65 populated rows.
UPDATE public.ai_models
SET working_set_mb = round(COALESCE(vram_mb, download_size_mb)
       + kv_cache_bytes_per_token * 8192 / 1048576.0),
    working_set_source = 'hf_estimate',
    updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1
WHERE engine_type = 'onnx' AND working_set_source = 'hf_estimate'
  AND kv_cache_bytes_per_token IS NOT NULL
  AND COALESCE(vram_mb, download_size_mb) IS NOT NULL;

-- ─── 3b. Latent double-count fix (audit-proven measured vram_mb) ───
-- persistVram() wrote REAL GPUBuffer-tracked totals (weights+KV+scratch)
-- into vram_mb on these 4 rows; the ws formula then re-added kv on top.
-- Correction: ws = measured total directly (KV already inside),
-- source='e2e_measured'; vram_mb restored to the pre-measurement
-- estimate (audit delta "old" values).
UPDATE public.ai_models SET working_set_mb = 4677, working_set_source = 'e2e_measured', vram_mb = 3903,
  working_set_detail = '{"measured_vram_mb":4677,"note":"GPUBuffer-tracked total incl. KV; estimate restored to vram_mb"}'::jsonb,
  updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1
WHERE model_id = 'onnx-community/gemma-4-E4B-it-ONNX' AND dtype = 'q4f16';
UPDATE public.ai_models SET working_set_mb = 2684, working_set_source = 'e2e_measured', vram_mb = 800,
  working_set_detail = '{"measured_vram_mb":2684,"note":"GPUBuffer-tracked total incl. KV; estimate restored to vram_mb"}'::jsonb,
  updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1
WHERE model_id = 'onnx-community/granite-4.0-micro-ONNX-web' AND dtype = 'q4f16';
UPDATE public.ai_models SET working_set_mb = 2185, working_set_source = 'e2e_measured', vram_mb = 3800,
  working_set_detail = '{"measured_vram_mb":2185,"note":"GPUBuffer-tracked total incl. KV; estimate restored to vram_mb"}'::jsonb,
  updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1
WHERE model_id = 'onnx-community/Phi-3.5-mini-instruct-ONNX-GQA' AND dtype = 'q4f16';
UPDATE public.ai_models SET working_set_mb = 2257, working_set_source = 'e2e_measured', vram_mb = 2505,
  working_set_detail = '{"measured_vram_mb":2257,"note":"GPUBuffer-tracked total incl. KV; estimate restored to vram_mb"}'::jsonb,
  updated_at = now(), updated_by = 'system_ws_backfill', version = version + 1
WHERE model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct' AND dtype = 'q4f16';

-- ─── 4. power_level recompute — every onnx row, agnostic ───
UPDATE public.ai_models
SET power_level = CASE
    WHEN working_set_mb <= 1200 THEN 1
    WHEN working_set_mb <= 2200 THEN 2
    WHEN working_set_mb <= 4000 THEN 3
    WHEN working_set_mb <= 7000 THEN 4
    ELSE 5
  END,
  updated_at = now(), updated_by = 'system_power_level_recompute',
  version = version + 1
WHERE engine_type = 'onnx' AND working_set_mb IS NOT NULL
  AND power_level <> CASE
    WHEN working_set_mb <= 1200 THEN 1
    WHEN working_set_mb <= 2200 THEN 2
    WHEN working_set_mb <= 4000 THEN 3
    WHEN working_set_mb <= 7000 THEN 4
    ELSE 5
  END;

COMMIT;
