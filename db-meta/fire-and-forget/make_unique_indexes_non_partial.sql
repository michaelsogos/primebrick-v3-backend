-- Primebrick: business-key uniques are NON-PARTIAL — a soft-deleted row
-- must still reserve its key. Recreating an existing key (deleted or not)
-- raises a duplicate conflict; via DAL add() this surfaces as ERR04 (live
-- twin) or ERR05 (deleted twin, uuid returned for restore).
-- Apply manually to existing DBs. Idempotent.
--
-- Verified clean before writing this script: zero duplicate keys
-- (deleted rows included) on all affected tables.

-- ai_cerebellum: (assistant_key, model_id) was partial (live-only).
DROP INDEX IF EXISTS "ai_cerebellum_assistant_model_uq";
CREATE UNIQUE INDEX IF NOT EXISTS "ai_cerebellum_assistant_model_uq"
  ON "ai_cerebellum" ("assistant_key", "model_id");

-- translations (public / system / custom): (key, language) was partial.
DROP INDEX IF EXISTS "translations_key_language_uidx";
CREATE UNIQUE INDEX IF NOT EXISTS "translations_key_language_uidx"
  ON "public"."translations" ("key", "language");

DROP INDEX IF EXISTS "system"."system_translations_key_language_uidx";
CREATE UNIQUE INDEX IF NOT EXISTS "system_translations_key_language_uidx"
  ON "system"."translations" ("key", "language");

DROP INDEX IF EXISTS "custom"."custom_translations_key_language_uidx";
CREATE UNIQUE INDEX IF NOT EXISTS "custom_translations_key_language_uidx"
  ON "custom"."translations" ("key", "language");
