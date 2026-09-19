-- Migration 00000000000009: Create `custom` schema + custom.translations
--
-- The `custom` schema is the segregation boundary for user-owned data that is
-- neither project seed data nor service-module data — cross-system and
-- cross-organization, globally shared across all authenticated users.
--
-- Phase 1 creates custom.translations: user-created translation rows (first
-- consumer: Smart JSON assistant error_label_key generation). User keys MUST
-- start with the `custom.` prefix (enforced at the API layer); keys that
-- already exist in public/system/module tables stay there — they are
-- seed/module-owned and reusable, not user data.
--
-- Future phases may add other `custom.*` tables (e.g. user configurations)
-- under the same boundary.
--
-- Idempotent: uses IF NOT EXISTS for all DDL.

BEGIN;

-- === Schema ===
CREATE SCHEMA IF NOT EXISTS "custom";

GRANT ALL ON SCHEMA "custom" TO primebrick;
GRANT ALL ON SCHEMA "custom" TO public;

-- === Table ===

-- custom.translations (user-created keys: custom.* — global, shared, cross-org)
CREATE TABLE IF NOT EXISTS "custom"."translations" (
  "id" BIGSERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  "key" VARCHAR(255) NOT NULL,
  "language" VARCHAR(10) NOT NULL,
  "value" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" VARCHAR(255) NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_by" VARCHAR(255) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" VARCHAR(255)
);

CREATE UNIQUE INDEX IF NOT EXISTS "custom_translations_key_language_uidx"
  ON "custom"."translations" ("key", "language")
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "custom_translations_language_idx"
  ON "custom"."translations" ("language")
  WHERE "deleted_at" IS NULL;

COMMIT;
