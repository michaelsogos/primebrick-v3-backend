-- user_preferences — per-user key/value preference store (public schema).
-- One row per (user_uuid, key); value is free-shape jsonb owned by the
-- key's consumer contract (first consumer: `favorite_pages`, string[] of
-- FE route paths). Self-service only — reads/writes scoped to req.user.id.
-- The (user_uuid, key) composite unique doubles as the per-user lookup index.

CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_uuid" uuid NOT NULL,
  "key" varchar(128) NOT NULL,
  "value" jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_preferences_uuid_uq" ON "public"."user_preferences" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "user_preferences_user_key_uidx" ON "public"."user_preferences" ("user_uuid", "key");
