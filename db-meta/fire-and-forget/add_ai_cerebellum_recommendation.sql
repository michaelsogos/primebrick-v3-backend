-- Fire-and-forget patch: `recommendation` badge on ai_cerebellum tunings.
--
-- A nullable tag ('RECOMMENDED' | 'NOT_RECOMMENDED' | NULL) shown as a
-- visual hint in the assistant cerebellum dropdown: it tells the user which
-- tuning presets are advised for that assistant (e.g. regex on Phi 3.5 GQA
-- is recommended, json_config on the same model is not). Purely cosmetic —
-- it does NOT affect auto-selection, sorting or execution.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del
--   redis-cli del dal:ai_cerebellum:list

BEGIN;

ALTER TABLE ai_cerebellum ADD COLUMN IF NOT EXISTS recommendation varchar(20) NULL;

-- Seed values: empirically validated E2E tunings (see test_scores evidence).
UPDATE ai_cerebellum SET recommendation = 'RECOMMENDED', version = version + 1, updated_at = now(), updated_by = 'devin'
  WHERE deleted_at IS NULL AND assistant_key = 'regex'
    AND model_id IN (
      'onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16',
      'onnx-community/Phi-3.5-mini-instruct-ONNX-GQA#q4f16'
    );

UPDATE ai_cerebellum SET recommendation = 'NOT_RECOMMENDED', version = version + 1, updated_at = now(), updated_by = 'devin'
  WHERE deleted_at IS NULL AND assistant_key = 'json_config'
    AND model_id = 'onnx-community/Phi-3.5-mini-instruct-ONNX-GQA#q4f16';

-- ─── Badge labels (× 6 languages) ────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.ai.cerebellum.recommended', 'en-GB', 'Recommended', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.recommended', 'it-IT', 'Consigliato', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.recommended', 'fr-FR', 'Recommandé', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.recommended', 'es-ES', 'Recomendado', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.recommended', 'de-DE', 'Empfohlen', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.recommended', 'pt-PT', 'Recomendado', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.not_recommended', 'en-GB', 'Not recommended', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.not_recommended', 'it-IT', 'Non consigliato', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.not_recommended', 'fr-FR', 'Non recommandé', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.not_recommended', 'es-ES', 'No recomendado', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.not_recommended', 'de-DE', 'Nicht empfohlen', now(), 'devin', now(), 'devin', 1),
  ('app.smart.ai.cerebellum.not_recommended', 'pt-PT', 'Não recomendado', now(), 'devin', now(), 'devin', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
