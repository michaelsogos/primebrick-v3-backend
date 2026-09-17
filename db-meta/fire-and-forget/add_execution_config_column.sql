-- Fire-and-forget migration: Add execution_config column to ai_models
--
-- Adds a JSONB column to store the execution strategy config that drives
-- the FE worker routing. Values are set empirically by the test harness,
-- NOT hardcoded here.
--
-- JSONB shape:
--   { strategy: "model_generate_kv_cache" | "pipeline_full_prefill" | "qwen3_5_vlm",
--     kv_cache_reuse: boolean,
--     sliding_window: boolean,
--     max_history_turns: number,
--     intent_detection: boolean }
--
-- Until the harness runs, execution_config is NULL and the FE defaults
-- to "pipeline_full_prefill" (safe fallback).
--
-- Idempotent: ALTER TABLE IF NOT EXISTS.
--
-- Date: 2026-09-14

BEGIN;

ALTER TABLE "public"."ai_models"
  ADD COLUMN IF NOT EXISTS "execution_config" jsonb;

COMMENT ON COLUMN public.ai_models.execution_config IS 'Execution strategy config — drives the FE worker routing. Set empirically by the test harness. NULL = use safe fallback (pipeline_full_prefill). JSONB: {strategy, kv_cache_reuse, sliding_window, max_history_turns, intent_detection}';

COMMIT;
