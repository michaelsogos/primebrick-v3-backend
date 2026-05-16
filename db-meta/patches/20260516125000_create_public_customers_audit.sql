-- Primebrick: audit table for customers
-- generatedAt: 2026-05-16T12:50:00.000Z

CREATE TABLE IF NOT EXISTS "public"."customers_audit" (
  "id" bigint generated always as identity NOT NULL,
  "entity_id" bigint NOT NULL,
  "entity_uuid" uuid NOT NULL,
  "action" text NOT NULL,
  "changed_at" timestamptz NOT NULL,
  "version" integer NOT NULL,
  "delta" jsonb NOT NULL,
  PRIMARY KEY ("id", "changed_at")
) PARTITION BY RANGE ("changed_at");

-- pg_partman setup for monthly partitioning
SELECT partman.create_parent('public.customers_audit', 'changed_at', '1 month');

-- Indexes
CREATE INDEX IF NOT EXISTS "customers_audit_entity_uuid_idx" ON "public"."customers_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "customers_audit_action_idx" ON "public"."customers_audit" ("action");

-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260516125000_create_public_customers_audit
-- content_sha256: TBD
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260516125000_create_public_customers_audit', 'TBD')
-- ON CONFLICT (patch_id) DO NOTHING;
