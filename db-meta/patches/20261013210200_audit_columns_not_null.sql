-- Primebrick: entity → database patch
-- generatedAt: 2026-10-13T21:34:54.300Z
-- fixes original sin: audit columns must be NOT NULL
SET search_path TO "public", public;

-- public.api_keys
UPDATE "public"."api_keys" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."api_keys" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."api_keys" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."api_keys" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."api_keys" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."api_keys" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."api_keys" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."api_keys" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."api_keys" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."api_keys" ALTER COLUMN "version" SET NOT NULL;

-- public.config_entries
UPDATE "public"."config_entries" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."config_entries" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."config_entries" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."config_entries" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."config_entries" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."config_entries" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."config_entries" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."config_entries" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."config_entries" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."config_entries" ALTER COLUMN "version" SET NOT NULL;

-- public.customers
UPDATE "public"."customers" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."customers" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."customers" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."customers" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."customers" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."customers" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."customers" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."customers" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."customers" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."customers" ALTER COLUMN "version" SET NOT NULL;

-- public.mcp_oauth_clients
UPDATE "public"."mcp_oauth_clients" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."mcp_oauth_clients" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."mcp_oauth_clients" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "version" SET NOT NULL;

-- public.mfa_action_authorizations
UPDATE "public"."mfa_action_authorizations" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."mfa_action_authorizations" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."mfa_action_authorizations" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."mfa_action_authorizations" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."mfa_action_authorizations" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "version" SET NOT NULL;

-- public.organizations
UPDATE "public"."organizations" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."organizations" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."organizations" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."organizations" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."organizations" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."organizations" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."organizations" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."organizations" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."organizations" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."organizations" ALTER COLUMN "version" SET NOT NULL;

-- public.role_mappings
UPDATE "public"."role_mappings" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."role_mappings" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."role_mappings" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."role_mappings" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."role_mappings" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."role_mappings" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."role_mappings" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."role_mappings" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."role_mappings" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."role_mappings" ALTER COLUMN "version" SET NOT NULL;

-- public.service_registry
UPDATE "public"."service_registry" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."service_registry" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."service_registry" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."service_registry" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."service_registry" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."service_registry" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."service_registry" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."service_registry" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."service_registry" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."service_registry" ALTER COLUMN "version" SET NOT NULL;

-- public.user_invitations
UPDATE "public"."user_invitations" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."user_invitations" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."user_invitations" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."user_invitations" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."user_invitations" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."user_invitations" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."user_invitations" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."user_invitations" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."user_invitations" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."user_invitations" ALTER COLUMN "version" SET NOT NULL;

-- public.user_mfa_factors
UPDATE "public"."user_mfa_factors" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."user_mfa_factors" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."user_mfa_factors" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."user_mfa_factors" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."user_mfa_factors" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "version" SET NOT NULL;

-- public.user_passkeys
UPDATE "public"."user_passkeys" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."user_passkeys" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."user_passkeys" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."user_passkeys" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."user_passkeys" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "version" SET NOT NULL;

-- public.user_profiles
UPDATE "public"."user_profiles" SET "created_at" = COALESCE("created_at", "updated_at", now()) WHERE "created_at" IS NULL;
ALTER TABLE "public"."user_profiles" ALTER COLUMN "created_at" SET NOT NULL;
UPDATE "public"."user_profiles" SET "created_by" = COALESCE("created_by", 'system') WHERE "created_by" IS NULL;
ALTER TABLE "public"."user_profiles" ALTER COLUMN "created_by" SET NOT NULL;
UPDATE "public"."user_profiles" SET "updated_at" = COALESCE("updated_at", "created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "public"."user_profiles" ALTER COLUMN "updated_at" SET NOT NULL;
UPDATE "public"."user_profiles" SET "updated_by" = COALESCE("updated_by", 'system') WHERE "updated_by" IS NULL;
ALTER TABLE "public"."user_profiles" ALTER COLUMN "updated_by" SET NOT NULL;
UPDATE "public"."user_profiles" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;
ALTER TABLE "public"."user_profiles" ALTER COLUMN "version" SET NOT NULL;
