-- Fire-and-forget patch: per-assistant compatibility + per-assistant default.
--
-- Schema:
--   ai_cerebellum.is_compatible  bool NOT NULL DEFAULT true  — a cerebellum
--     row declares "this (assistant, model, dtype) combo is known-good";
--     false = empirically proven broken for THAT assistant only.
--   ai_cerebellum.is_default     bool NOT NULL DEFAULT false — at most one
--     default per assistant_key (partial unique index).
--   ai_models.compatibility_status (varchar) → is_compatible (bool): model-
--     level flag, false only on absolute failures (load crash, zero tokens,
--     dead repo). Semantics unchanged, type normalized to bool for coherence
--     with the cerebellum flag.
--
-- Seed: empirical results of the 2026-10-06/07 regex+json+guide campaigns —
-- see ai-plans/model-compatibility-rework-and-react-guide-tests.md.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli del dal:ai_cerebellum:list dal:ai_model:list dal:config_entries:list

BEGIN;

-- ─── Schema ──────────────────────────────────────────────────────────

ALTER TABLE ai_cerebellum
  ADD COLUMN IF NOT EXISTS is_compatible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS ai_cerebellum_one_default_per_assistant_uq
  ON ai_cerebellum (assistant_key) WHERE is_default AND deleted_at IS NULL;

ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS is_compatible boolean;
UPDATE ai_models SET is_compatible = (compatibility_status = 'COMPATIBLE');
ALTER TABLE ai_models
  ALTER COLUMN is_compatible SET NOT NULL,
  ALTER COLUMN is_compatible SET DEFAULT true,
  DROP COLUMN compatibility_status;

-- ─── Model-level NOT compatible (absolute failures) ───────────────────

-- gpt2: 0/5 regex + 0/5 json — base model, never produces a candidate.
-- Qwen2.5-3B-Instruct: repo does not exist on HF (bogus catalog entry).
-- Phi-3.5-mini-GQA: guide gibberish + ~2/5 regex. Phi-4-mini / -GQA / -web:
-- repetition collapse / multi-external-data upstream load failure.
-- Qwen3.5-2B/4B: kv pipeline inputNames error + zero-token hang both modes.
-- gemma-4-E4B: meta-monologue, malformed Action Input, ~3tps timeouts.
UPDATE ai_models SET is_compatible = false, version = version + 1, updated_at = now(), updated_by = 'devin'
  WHERE deleted_at IS NULL AND model_id IN (
    'openai-community/gpt2',
    'onnx-community/Qwen2.5-3B-Instruct',
    'onnx-community/Phi-3.5-mini-instruct-ONNX-GQA',
    'onnx-community/Phi-4-mini-instruct-ONNX',
    'onnx-community/Phi-4-mini-instruct-ONNX-GQA',
    'onnx-community/Phi-4-mini-instruct-web-q4f16',
    'onnx-community/Qwen3.5-2B-ONNX',
    'onnx-community/Qwen3.5-4B-ONNX',
    'onnx-community/gemma-4-E4B-it-ONNX'
  );

-- ─── Cerebellum flags ─────────────────────────────────────────────────

-- FULL not-compatible: every cerebellum row of a model-level-NC model.
UPDATE ai_cerebellum SET is_compatible = false, version = version + 1, updated_at = now(), updated_by = 'devin'
  WHERE deleted_at IS NULL AND model_id IN (
    'openai-community/gpt2',
    'onnx-community/Qwen2.5-3B-Instruct',
    'onnx-community/Phi-3.5-mini-instruct-ONNX-GQA',
    'onnx-community/Phi-4-mini-instruct-ONNX',
    'onnx-community/Phi-4-mini-instruct-ONNX-GQA',
    'onnx-community/Phi-4-mini-instruct-web-q4f16',
    'onnx-community/Qwen3.5-2B-ONNX',
    'onnx-community/Qwen3.5-4B-ONNX',
    'onnx-community/gemma-4-E4B-it-ONNX'
  );

-- Guide-only NC (works elsewhere, broken/dangerous on the guide):
--  Coder-1.5B q4f16  — deterministic crash both configs (Expand kv-on, wasm OOB kv-off)
--  Llama-3.2-3B q4f16 — fabricates out-of-domain answers (cake recipe), 2 configs
--  granite-micro-web q4f16 — hallucinated Observation paths, false NO_MATCH (1.38)
UPDATE ai_cerebellum SET is_compatible = false, version = version + 1, updated_at = now(), updated_by = 'devin'
  WHERE deleted_at IS NULL AND assistant_key = 'guide' AND (model_id, dtype) IN (
    ('onnx-community/Qwen2.5-Coder-1.5B-Instruct', 'q4f16'),
    ('onnx-community/Llama-3.2-3B-Instruct-ONNX', 'q4f16'),
    ('onnx-community/granite-4.0-micro-ONNX-web', 'q4f16')
  );

-- Regex-only NC: granite-4.0-h-micro produces INVALID regex syntax
-- ([a-za-.z0-9], score 2.19) — works for json (3.39) and guide (3.62,
-- the only non-Qwen passing the guide). No regex row exists → INSERT an
-- explicit incompatible row (block must be explicit, not absence).
INSERT INTO ai_cerebellum
  (uuid, assistant_key, model_id, dtype, name, is_compatible, is_default,
   version, created_at, created_by, updated_at, updated_by)
VALUES
  (gen_random_uuid(), 'regex', 'onnx-community/granite-4.0-h-micro-ONNX', 'q4f16',
   'app.smart.regex.ai.cerebellum_name', false, false, 1, now(), 'devin', now(), 'devin');

-- ─── Per-assistant defaults: Qwen2.5-Coder-3B q4f16 for all three ─────

UPDATE ai_cerebellum SET is_default = true, version = version + 1, updated_at = now(), updated_by = 'devin'
  WHERE deleted_at IS NULL AND assistant_key = 'guide'
    AND model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct' AND dtype = 'q4f16';
UPDATE ai_cerebellum SET is_default = true, version = version + 1, updated_at = now(), updated_by = 'devin'
  WHERE deleted_at IS NULL AND assistant_key = 'regex'
    AND model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct' AND dtype = 'q4f16';
UPDATE ai_cerebellum SET is_default = true, version = version + 1, updated_at = now(), updated_by = 'devin'
  WHERE deleted_at IS NULL AND assistant_key = 'json_config'
    AND model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct' AND dtype = 'q4f16';

-- ─── New catalog entry: opalitestudios/Qwen2.5-3B-Instruct-ONNX q4f16 ──
-- transformers.js export of plain Qwen2.5-3B-Instruct (the onnx-community
-- repo never existed — dead catalog entry flagged above). Guide row created
-- compatible-by-default: untested combos must be testable from the panel.

INSERT INTO ai_models
  (uuid, model_id, dtype, engine_type, name, power_level, rank,
   enable_thinking, temperature, top_p, max_tokens, repetition_penalty,
   sort_order, download_size_mb, is_compatible, execution_config,
   version, created_at, created_by, updated_at, updated_by)
VALUES
  (gen_random_uuid(), 'opalitestudios/Qwen2.5-3B-Instruct-ONNX', 'q4f16', 'onnx',
   'Qwen2.5 3B Instruct (q4f16)', 3, 1.0,
   false, 0.00, 0.80, 256, 1.10,
   51, 2227, true,
   '{"kv_cache_reuse":false,"sliding_window":true,"intent_detection":true,"max_history_turns":6}',
   1, now(), 'devin', now(), 'devin');

INSERT INTO ai_cerebellum
  (uuid, assistant_key, model_id, dtype, name, is_compatible, is_default,
   execution_config, version, created_at, created_by, updated_at, updated_by)
VALUES
  (gen_random_uuid(), 'guide', 'opalitestudios/Qwen2.5-3B-Instruct-ONNX', 'q4f16',
   'app.smart.guide.ai.cerebellum_name', true, false,
   '{"kv_cache_reuse":true,"agent_dialect":"react_classic","answer_mode":"in_context"}',
   1, now(), 'devin', now(), 'devin');

-- ─── Column label translations (renamed field) ────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.is_compatible', 'en-GB', 'Compatible', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_model.fields.is_compatible', 'it-IT', 'Compatibile', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_model.fields.is_compatible', 'fr-FR', 'Compatible', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_model.fields.is_compatible', 'es-ES', 'Compatible', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_model.fields.is_compatible', 'de-DE', 'Kompatibel', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_model.fields.is_compatible', 'pt-PT', 'Compatível', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_compatible', 'en-GB', 'Compatible', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_compatible', 'it-IT', 'Compatibile', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_compatible', 'fr-FR', 'Compatible', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_compatible', 'es-ES', 'Compatible', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_compatible', 'de-DE', 'Kompatibel', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_compatible', 'pt-PT', 'Compatível', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'en-GB', 'Default', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'it-IT', 'Predefinito', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'fr-FR', 'Par défaut', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'es-ES', 'Predeterminado', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'de-DE', 'Standard', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'pt-PT', 'Padrão', now(), 'devin', now(), 'devin', 1)
ON CONFLICT (key, language) DO NOTHING;

COMMIT;
