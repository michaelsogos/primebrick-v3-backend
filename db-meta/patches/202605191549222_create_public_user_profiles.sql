-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-19T15:49:22.237Z
-- Note: pg_partman partitioning removed for simplicity; can be added later if needed

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "idp_code" varchar(255) NOT NULL,
  "email" varchar(320),
  "display_name" varchar(255),
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  "deleted_at" timestamptz,
  "deleted_by" text,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_uuid_uq" ON "public"."user_profiles" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_idp_code_uq" ON "public"."user_profiles" ("idp_code");

CREATE TABLE IF NOT EXISTS "public"."user_profiles_audit" (
  "id" bigint generated always as identity NOT NULL,
  "entity_id" bigint NOT NULL,
  "entity_uuid" uuid NOT NULL,
  "action" text NOT NULL,
  "changed_at" timestamptz NOT NULL,
  "changed_by" text NOT NULL DEFAULT 'system',
  "version" integer NOT NULL,
  "delta" jsonb NOT NULL,
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "user_profiles_audit_entity_uuid_idx" ON "public"."user_profiles_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "user_profiles_audit_action_idx" ON "public"."user_profiles_audit" ("action");

-- === database patch registry (repeatable runs) ===
-- patch_id: 202605191549222_create_public_user_profiles
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('202605191549222_create_public_user_profiles', 'TBD')
-- ON CONFLICT (patch_id) DO NOTHING;
