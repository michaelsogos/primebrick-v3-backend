-- Primebrick: entity → database patch
-- pb:requires-review
-- pb:segments
-- generatedAt: 2026-11-24T18:13:12.499Z

ALTER TABLE "public"."mcp_oauth_clients" ADD COLUMN IF NOT EXISTS "created_by" text DEFAULT 'system' NOT NULL;
ALTER TABLE "public"."mcp_oauth_clients" ADD COLUMN IF NOT EXISTS "updated_by" text DEFAULT 'system' NOT NULL;
-- pb:begin-no-transaction
CREATE INDEX CONCURRENTLY IF NOT EXISTS "sequences_binding_key_default_from_idx" ON "system"."sequences" ("binding_key", "default_from" DESC NULLS LAST) WHERE deleted_at IS NULL;
-- pb:end-no-transaction

-- ── review section (runs only after approval) ──
-- set default "is_admin" → false (db=(none))
ALTER TABLE "public"."role_mappings" ALTER COLUMN "is_admin" SET DEFAULT false;
-- set default "is_preferred" → false (db=(none))
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "is_preferred" SET DEFAULT false;
-- REVIEW nullability "permissions" entity=false db=true (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."api_keys" ALTER COLUMN "permissions" SET NOT NULL;
-- REVIEW nullability "is_system" entity=false db=true (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."api_keys" ALTER COLUMN "is_system" SET NOT NULL;
-- REVIEW nullability "is_active" entity=false db=true (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."api_keys" ALTER COLUMN "is_active" SET NOT NULL;
-- set default "permissions" → '[]'::jsonb (db=(none))
ALTER TABLE "public"."api_keys" ALTER COLUMN "permissions" SET DEFAULT '[]'::jsonb;
-- set default "is_system" → false (db=(none))
ALTER TABLE "public"."api_keys" ALTER COLUMN "is_system" SET DEFAULT false;
-- set default "is_active" → false (db=(none))
ALTER TABLE "public"."api_keys" ALTER COLUMN "is_active" SET DEFAULT false;
-- set default "created_at" → now() (db=(none))
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "created_at" SET DEFAULT now();
-- set default "updated_at" → now() (db=(none))
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "updated_at" SET DEFAULT now();
-- set default "version" → 1 (db=(none))
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "version" SET DEFAULT 1;
-- set default "client_id_issued_at" → now() (db=(none))
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "client_id_issued_at" SET DEFAULT now();

-- WARN: DB-only index "user_mfa_factors_user_profile_uuid_idx" on public.user_mfa_factors — not dropped
