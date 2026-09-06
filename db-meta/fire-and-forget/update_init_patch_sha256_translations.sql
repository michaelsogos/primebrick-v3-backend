-- Fire-and-forget: Update content_sha256 for init_database patch in the patch registry.
-- The init patch was modified to add:
--   1. CREATE SCHEMA system + grants
--   2. public.translations table + indexes
--   3. system.translations table + indexes
--
-- This script:
--   - Creates the schema/tables/indexes on existing databases (idempotent via IF NOT EXISTS)
--   - Updates the patch registry hash
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-09-06
-- Old sha256: 288d8d3052ee44e59cb6763b414d9e41e0dfd9b79482421f64bf0d00e977067b
-- New sha256: 02923856413030a876337ec176569c9feb1bbff6f16cd1634fc47046447fcecd
-- Reason: Added system schema, public.translations + system.translations tables with composite unique indexes.

BEGIN;

-- 1. Create system schema (idempotent).
CREATE SCHEMA IF NOT EXISTS system;
GRANT ALL ON SCHEMA system TO primebrick;
GRANT ALL ON SCHEMA system TO public;

-- 2. Create public.translations table (idempotent).
CREATE TABLE IF NOT EXISTS "public"."translations" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "translations_key_language_uidx"
  ON "public"."translations" ("key", "language")
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "translations_language_idx"
  ON "public"."translations" ("language")
  WHERE "deleted_at" IS NULL;

-- 3. Create system.translations table (idempotent).
CREATE TABLE IF NOT EXISTS "system"."translations" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "system_translations_key_language_uidx"
  ON "system"."translations" ("key", "language")
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "system_translations_language_idx"
  ON "system"."translations" ("language")
  WHERE "deleted_at" IS NULL;

-- 4. Update the patch registry hash so db:migrate skips the init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = '02923856413030a876337ec176569c9feb1bbff6f16cd1634fc47046447fcecd'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '02923856413030a876337ec176569c9feb1bbff6f16cd1634fc47046447fcecd';

COMMIT;
