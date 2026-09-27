-- Fire-and-forget migration: seed the 'guide' cerebellum
--
-- One cerebellum per (assistant_key, model_id). All param columns NULL →
-- the Guide assistant fully inherits the ai_models defaults until
-- test-driven tuning fills them. `name` is the assistant display-name i18n
-- key, resolved through $t() in the chat footer selector.
--
-- Targets the currently enabled default model
-- (config_entries.ai_assistant_model = onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16).
--
-- Date: 2026-09-27

BEGIN;

INSERT INTO "public"."ai_cerebellum" (
  "assistant_key", "model_id", "name",
  "created_by", "updated_by"
) VALUES
  ('guide', 'onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16', 'app.smart.guide.ai.cerebellum_name', 'system', 'system')
ON CONFLICT DO NOTHING;

COMMIT;
