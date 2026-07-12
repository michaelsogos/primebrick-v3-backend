-- Fire-and-forget: Create api_keys table for existing live DB.
-- Run this ONCE on the existing live database.

CREATE TABLE IF NOT EXISTS "public"."api_keys" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "key_hash" text NOT NULL,
  "key_prefix" varchar(20) NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "permissions" jsonb DEFAULT '[]',
  "is_system" boolean DEFAULT FALSE,
  "is_active" boolean DEFAULT TRUE,
  "expires_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_uuid_uq" ON "public"."api_keys" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_key_hash_uq" ON "public"."api_keys" ("key_hash");
