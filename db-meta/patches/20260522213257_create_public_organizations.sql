-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-22T21:32:57.008Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "public"."organizations" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "idp_code" varchar(255) NOT NULL,
  "display_name" varchar(255),
  "website_url" varchar(2048),
  "last_synced_at" timestamp with time zone,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  "deleted_at" timestamptz,
  "deleted_by" text,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "organizations_uuid_uq" ON "public"."organizations" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_idp_code_uq" ON "public"."organizations" ("idp_code");

CREATE TABLE IF NOT EXISTS "public"."organizations_audit" (
  "id" bigint generated always as identity NOT NULL,
  "entity_id" bigint NOT NULL,
  "entity_uuid" uuid NOT NULL,
  "action" text NOT NULL,
  "changed_at" timestamptz NOT NULL,
  "changed_by" text NOT NULL DEFAULT 'system',
  "version" integer NOT NULL,
  "delta" jsonb NOT NULL,
  PRIMARY KEY ("id", "changed_at")
) PARTITION BY RANGE ("changed_at");

-- pg_partman setup for monthly partitioning
SELECT partman.create_parent('public.organizations_audit', 'changed_at', '1 month');

CREATE INDEX IF NOT EXISTS "organizations_audit_entity_uuid_idx" ON "public"."organizations_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "organizations_audit_action_idx" ON "public"."organizations_audit" ("action");

-- TYPE mismatch "cloned_from" entity≈text db≈uuid — manual ALTER TYPE / migration

-- NULLABILITY "is_active" entity=false db=true — manual ALTER COLUMN … SET/DROP NOT NULL
-- NULLABILITY "is_admin" entity=false db=true — manual ALTER COLUMN … SET/DROP NOT NULL

-- TYPE mismatch "is_admin" entity≈text db≈bool — manual ALTER TYPE / migration


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260522213257_create_public_organizations
-- content_sha256: f16f173eea3e000ee1789b3ec5ef6cb5fd3a5b3637f282141ea78634efa1b2a9
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260522213257_create_public_organizations', 'f16f173eea3e000ee1789b3ec5ef6cb5fd3a5b3637f282141ea78634efa1b2a9')
-- ON CONFLICT (patch_id) DO NOTHING;
