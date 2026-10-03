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
  "assistant_key", "model_id", "name", "execution_config",
  "created_by", "updated_by"
) VALUES
  ('guide', 'onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16', 'app.smart.guide.ai.cerebellum_name',
   '{"min_similarity": 0.35}'::jsonb, 'system', 'system')
ON CONFLICT DO NOTHING;

-- 2026-10-02: the Guide answer envelope is a JSON object — with the model
-- default max_tokens=256 a longer answer_markdown gets truncated mid-string
-- and the whole envelope fails to parse (raw JSON shown to the user).
-- 512 gives the prose room; parsing is also salvaged client-side as a
-- second line of defense.
UPDATE "public"."ai_cerebellum"
SET "max_tokens" = 512, "updated_by" = 'system'
WHERE "assistant_key" = 'guide'
  AND "model_id" = 'onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16'
  AND "max_tokens" IS DISTINCT FROM 512;

COMMIT;
