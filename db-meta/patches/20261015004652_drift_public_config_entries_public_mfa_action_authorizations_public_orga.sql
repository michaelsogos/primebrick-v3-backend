-- Primebrick: entity → database patch
-- pb:requires-review
-- generatedAt: 2026-10-15T00:46:52.947Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── review section (runs only after approval) ──
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."config_entries" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."config_entries" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."config_entries" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."config_entries" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."config_entries" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."organizations" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."organizations" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."organizations" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."organizations" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."organizations" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."role_mappings" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."role_mappings" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."role_mappings" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."role_mappings" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."role_mappings" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_invitations" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_invitations" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_invitations" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_invitations" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_invitations" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_profiles" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_profiles" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_profiles" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_profiles" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_profiles" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."api_keys" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."api_keys" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."api_keys" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."api_keys" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."api_keys" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."customers" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."customers" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."customers" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."customers" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."customers" ALTER COLUMN "version" DROP NOT NULL;
-- REVIEW type change "schemas" entity≈array:text db≈array:_text (may rewrite the table)
ALTER TABLE "public"."service_registry" ALTER COLUMN "schemas" TYPE text[];
-- REVIEW nullability "created_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."service_registry" ALTER COLUMN "created_at" DROP NOT NULL;
-- REVIEW nullability "created_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."service_registry" ALTER COLUMN "created_by" DROP NOT NULL;
-- REVIEW nullability "updated_at" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."service_registry" ALTER COLUMN "updated_at" DROP NOT NULL;
-- REVIEW nullability "updated_by" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."service_registry" ALTER COLUMN "updated_by" DROP NOT NULL;
-- REVIEW nullability "version" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."service_registry" ALTER COLUMN "version" DROP NOT NULL;

-- WARN: DB-only index "config_entries_deleted_at_idx" on public.config_entries — not dropped
-- WARN: DB-only index "mfa_action_authorizations_user_profile_id_idx" on public.mfa_action_authorizations — not dropped
-- WARN: DB-only index "mfa_action_authorizations_expires_at_idx" on public.mfa_action_authorizations — not dropped
-- WARN: DB-only index "user_invitations_user_profile_id_idx" on public.user_invitations — not dropped
-- WARN: DB-only index "user_invitations_status_idx" on public.user_invitations — not dropped
-- WARN: DB-only index "user_mfa_factors_user_profile_id_idx" on public.user_mfa_factors — not dropped
-- WARN: DB-only index "user_passkeys_user_profile_id_idx" on public.user_passkeys — not dropped
-- WARN: DB-only index "service_registry_code_uq_scaler" on public.service_registry — not dropped
-- WARN: DB-only index "service_registry_code_base_url_uq" on public.service_registry — not dropped
