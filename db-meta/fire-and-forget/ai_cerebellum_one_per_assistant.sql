-- Fire-and-forget migration: enforce ONE cerebellum per (assistant, model)
--
-- The cerebellum is the model's specialization for a specific assistant —
-- not a library of named presets. Therefore:
--   1. drop the (assistant, model, name) uniqueness and the is_default index
--   2. add uniqueness on (assistant_key, model_id)
--   3. remove the extra 'precise' seed row
--   4. rename seeds to the assistant display names
--
-- Order matters: extra rows are removed BEFORE the new unique index.
--
-- Date: 2026-10-02

BEGIN;

-- 1. Remove extra tunings — keep exactly one row per (assistant, model).
DELETE FROM "public"."ai_cerebellum"
WHERE "name" = 'precise';

-- 2. Swap the uniqueness model.
DROP INDEX IF EXISTS "public"."ai_cerebellum_assistant_model_name_uq";
DROP INDEX IF EXISTS "public"."ai_cerebellum_default_uq";

CREATE UNIQUE INDEX IF NOT EXISTS "ai_cerebellum_assistant_model_uq"
  ON "public"."ai_cerebellum" ("assistant_key", "model_id")
  WHERE "deleted_at" IS NULL;

-- 3. Seed rows carry the assistant display-name i18n key (resolved through
--    $t() in the footer selector, same convention as the sheet title) and
--    are pre-selected.
UPDATE "public"."ai_cerebellum"
SET "name" = 'app.smart.regex.ai.cerebellum_name', "is_default" = true, "updated_by" = 'system', "updated_at" = now()
WHERE "assistant_key" = 'regex' AND "deleted_at" IS NULL;

UPDATE "public"."ai_cerebellum"
SET "name" = 'app.smart.json.ai.cerebellum_name', "is_default" = true, "updated_by" = 'system', "updated_at" = now()
WHERE "assistant_key" = 'json_config' AND "deleted_at" IS NULL;

COMMIT;
