-- Create system.client_registry on existing environments.
-- (This exact DDL is part of 00000000000000_init_database.sql for fresh envs;
-- this script only applies it to databases created before that patch.)

CREATE TABLE IF NOT EXISTS "system"."client_registry" (
  "id" BIGSERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  "ua_prefix" VARCHAR(255) NOT NULL,
  "client_key_hash" VARCHAR(255) NOT NULL,
  "source" VARCHAR(20) NOT NULL DEFAULT 'manual',
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" VARCHAR(255) NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_by" VARCHAR(255) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" VARCHAR(255),
  CONSTRAINT "client_registry_source_ck" CHECK ("source" IN ('registry', 'manual'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "system_client_registry_ua_prefix_uidx"
  ON "system"."client_registry" ("ua_prefix");
