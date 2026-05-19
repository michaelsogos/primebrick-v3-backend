-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-18T13:07:27.317Z
-- Note: user_profiles and user_profiles_audit already exist, only creating role_mappings

CREATE TABLE IF NOT EXISTS "public"."role_mappings" (
  "id" bigint generated always as identity NOT NULL,
  "idp_role" varchar(255) NOT NULL,
  "permissions" jsonb NOT NULL,
  "is_admin" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "role_mappings_idp_role_uq" ON "public"."role_mappings" ("idp_role");

CREATE TABLE IF NOT EXISTS "public"."role_mappings_audit" (
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
SELECT partman.create_parent('public.role_mappings_audit', 'changed_at', '1 month');

CREATE INDEX IF NOT EXISTS "role_mappings_audit_entity_uuid_idx" ON "public"."role_mappings_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "role_mappings_audit_action_idx" ON "public"."role_mappings_audit" ("action");

-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260518130727_create_public_user_profiles_public_role_mappings
-- content_sha256: TBD
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260518130727_create_public_user_profiles_public_role_mappings', 'TBD')
-- ON CONFLICT (patch_id) DO NOTHING;
