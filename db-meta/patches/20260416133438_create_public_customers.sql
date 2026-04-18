-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-04-16T13:34:38.176Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "public"."customers" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(20) NOT NULL,
  "email" varchar(320),
  "phone" varchar(64),
  "status" text NOT NULL,
  "first_name" text,
  "last_name" text,
  "company_name" text,
  "status_reason" text,
  "local_address" text,
  "local_city" text,
  "local_state" text,
  "local_country" text,
  "local_zip" text,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  "deleted_at" timestamptz,
  "deleted_by" text,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customers_uuid_uq" ON "public"."customers" ("uuid");


-- === patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/schema-meta-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260416133438_create_public_customers
-- content_sha256: ef9500449dfba4104df149facd88e662584d5ab10ceda271175579c2431c0b6a
-- After apply:
-- INSERT INTO public.primebrick_schema_meta_patch (patch_id, content_sha256)
-- VALUES ('20260416133438_create_public_customers', 'ef9500449dfba4104df149facd88e662584d5ab10ceda271175579c2431c0b6a')
-- ON CONFLICT (patch_id) DO NOTHING;
