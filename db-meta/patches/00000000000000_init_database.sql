-- Primebrick: Database Initialization Script
-- This script consolidates all database schema changes into a single idempotent init script
-- It can be run multiple times safely on a fresh database
-- generatedAt: 2026-05-29T15:00:00.000Z

-- === Extensions ===
-- Create extensions with idempotent checks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    CREATE EXTENSION pgcrypto;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_partman') THEN
    CREATE EXTENSION pg_partman;
  END IF;
END $$;

-- === Schemas ===
CREATE SCHEMA IF NOT EXISTS emailsender;

GRANT ALL ON SCHEMA emailsender TO primebrick;
GRANT ALL ON SCHEMA emailsender TO public;

-- === Tables ===

-- customers table (merged from multiple patches)
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
  "onboarding_time_zone" varchar(100),
  "onboarding_at" timestamptz,
  "cloned_from" uuid,
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

COMMENT ON COLUMN public.customers.onboarding_at IS 'Customer onboarding instant, stored as timestamptz (UTC)';
COMMENT ON COLUMN public.customers.onboarding_time_zone IS 'IANA time zone for the user who set onboarding (display context; DST via IANA rules)';
COMMENT ON COLUMN public.customers.cloned_from IS 'UUID of the source record this customer was cloned from. Null if this is an original record (not a clone).';

-- customers_audit table
CREATE TABLE IF NOT EXISTS "public"."customers_audit" (
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

COMMENT ON COLUMN public.customers_audit.changed_by IS 'Identifier of the principal that produced the audit entry (falls back to "system" when no authenticated context is available).';

-- Indexes for customers_audit
CREATE INDEX IF NOT EXISTS "customers_audit_entity_uuid_idx" ON "public"."customers_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "customers_audit_action_idx" ON "public"."customers_audit" ("action");

-- pg_partman setup for customers_audit (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'partman' 
    AND table_name = 'part_config'
  ) OR NOT EXISTS (
    SELECT 1 FROM partman.part_config 
    WHERE parent_table = 'public.customers_audit'
  ) THEN
    PERFORM partman.create_parent('public.customers_audit', 'changed_at', '1 month');
  END IF;
EXCEPTION WHEN others THEN
  -- If pg_partman is not properly configured, skip silently
  NULL;
END $$;

-- user_profiles table (merged from multiple patches)
CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "idp_code" varchar(255) NOT NULL,
  "idp_org" varchar(255),
  "idp_username" varchar(255),
  "email" varchar(320),
  "display_name" varchar(255),
  "avatar_color" varchar(7),
  "avatar_initials" varchar(10),
  "is_active" boolean NOT NULL DEFAULT true,
  "is_admin" boolean NOT NULL DEFAULT false,
  "roles" jsonb,
  "last_synced_at" timestamptz,
  "is_verified" boolean DEFAULT false NOT NULL,
  "issuer" varchar(255),
  "email_verified" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  "deleted_at" timestamptz,
  "deleted_by" text,
  "auth_method_enforcer_dismissed" boolean NOT NULL DEFAULT false,
  "onboarding_completed" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_uuid_uq" ON "public"."user_profiles" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_idp_code_uq" ON "public"."user_profiles" ("idp_code");

COMMENT ON COLUMN public.user_profiles.avatar_color IS 'Avatar color hex code (e.g., #3b82f6) for user profile display';
COMMENT ON COLUMN public.user_profiles.is_active IS 'Whether the user account is active (mirrors Casdoor™ isForbidden)';
COMMENT ON COLUMN public.user_profiles.is_admin IS 'Whether the user has admin privileges (mirrors Casdoor™ isAdmin)';
COMMENT ON COLUMN public.user_profiles.roles IS 'Array of role names assigned to the user (mirrors Casdoor™ roles)';
COMMENT ON COLUMN public.user_profiles.last_synced_at IS 'Timestamp of last successful sync with Casdoor™';
COMMENT ON COLUMN public.user_profiles.auth_method_enforcer_dismissed IS 'Whether the user dismissed the auth method enforcer dialog (passkey/MFA prompt)';
COMMENT ON COLUMN public.user_profiles.onboarding_completed IS 'Whether the user completed the welcome/onboarding flow';

-- user_profiles_audit table
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

-- user_invitations table
CREATE TABLE IF NOT EXISTS "public"."user_invitations" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_profile_id" bigint NOT NULL,
  "token_hash" text NOT NULL,
  "status" text NOT NULL DEFAULT 'PENDING',
  "email" varchar(320) NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "expires_at" timestamptz NOT NULL,
  "completed_at" timestamptz,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  "otp_hash" text,
  "otp_expires_at" timestamptz,
  "otp_attempts" integer NOT NULL DEFAULT 0,
  "otp_verified_at" timestamptz,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_invitations_uuid_uq" ON "public"."user_invitations" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "user_invitations_token_hash_uq" ON "public"."user_invitations" ("token_hash");
CREATE INDEX IF NOT EXISTS "user_invitations_user_profile_id_idx" ON "public"."user_invitations" ("user_profile_id");
CREATE INDEX IF NOT EXISTS "user_invitations_status_idx" ON "public"."user_invitations" ("status");

COMMENT ON TABLE public.user_invitations IS 'Invitation tokens for user onboarding/welcome flow';
COMMENT ON COLUMN public.user_invitations.token_hash IS 'SHA-256 hash of the invitation token (raw token never stored)';
COMMENT ON COLUMN public.user_invitations.status IS 'PENDING | OTP_SENT | COMPLETED | EXPIRED | REVOKED';
COMMENT ON COLUMN public.user_invitations.otp_hash IS 'SHA-256 hash of the 6-digit OTP code (null if not sent)';
COMMENT ON COLUMN public.user_invitations.otp_expires_at IS 'OTP validity window (5 minutes from send)';
COMMENT ON COLUMN public.user_invitations.otp_attempts IS 'Failed OTP verify attempts (max 10)';
COMMENT ON COLUMN public.user_invitations.otp_verified_at IS 'When the user verified the OTP (gate for password set)';

-- user_passkeys table
CREATE TABLE IF NOT EXISTS "public"."user_passkeys" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_profile_id" bigint NOT NULL,
  "credential_id" text NOT NULL,
  "aaguid" text,
  "transports" jsonb,
  "label" varchar(100),
  "last_used_at" timestamptz,
  "authenticator_attachment" text,
  "user_agent" text,
  "os" text,
  "device_model" text,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_passkeys_uuid_uq" ON "public"."user_passkeys" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "user_passkeys_credential_id_uq" ON "public"."user_passkeys" ("credential_id");
CREATE INDEX IF NOT EXISTS "user_passkeys_user_profile_id_idx" ON "public"."user_passkeys" ("user_profile_id");

COMMENT ON TABLE public.user_passkeys IS 'Passkey credentials tracked in PG (mirrors Casdoor™ webauthnCredentials)';
COMMENT ON COLUMN public.user_passkeys.credential_id IS 'base64url credential ID from WebAuthn';
COMMENT ON COLUMN public.user_passkeys.aaguid IS 'Authenticator model identifier';
COMMENT ON COLUMN public.user_passkeys.transports IS 'JSON array of transports ["internal","hybrid","usb","nfc","ble"]';
COMMENT ON COLUMN public.user_passkeys.label IS 'User-given name (e.g. "Windows Hello™", "iPhone")';
COMMENT ON COLUMN public.user_passkeys.last_used_at IS 'Last time this credential was used to sign in (null until first signin after this feature ships)';
COMMENT ON COLUMN public.user_passkeys.authenticator_attachment IS 'platform | cross-platform (WebAuthn AuthenticatorAttachment)';
COMMENT ON COLUMN public.user_passkeys.user_agent IS 'navigator.userAgent captured at enrollment (truncated to 512 chars)';
COMMENT ON COLUMN public.user_passkeys.os IS 'OS inferred from UA at enrollment (e.g. Windows, macOS, iOS, Android, Linux)';
COMMENT ON COLUMN public.user_passkeys.device_model IS 'Device model inferred from UA at enrollment (e.g. "Windows PC", "Mac", "iPhone", "Pixel")';

-- user_mfa_factors table (MFA factors tracked in PG, mirrors Casdoor™ MFA setup)
CREATE TABLE IF NOT EXISTS "public"."user_mfa_factors" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_profile_id" bigint NOT NULL,
  "factor_type" text NOT NULL,
  "casdoor_mfa_type" text,
  "totp_secret_encrypted" text NOT NULL,
  "label" varchar(100),
  "is_enabled" boolean NOT NULL DEFAULT true,
  "is_preferred" boolean NOT NULL DEFAULT false,
  "last_used_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_mfa_factors_uuid_uq" ON "public"."user_mfa_factors" ("uuid");
CREATE INDEX IF NOT EXISTS "user_mfa_factors_user_profile_id_idx" ON "public"."user_mfa_factors" ("user_profile_id");

COMMENT ON TABLE public.user_mfa_factors IS 'MFA factors tracked in PG (mirrors Casdoor™ MFA setup)';
COMMENT ON COLUMN public.user_mfa_factors.factor_type IS 'Factor type: "totp" (v1 only)';
COMMENT ON COLUMN public.user_mfa_factors.casdoor_mfa_type IS 'Casdoor™ mfaType value: "app" for TOTP';
COMMENT ON COLUMN public.user_mfa_factors.label IS 'User-given name (e.g. "Google Authenticator™", "Authy™")';
COMMENT ON COLUMN public.user_mfa_factors.is_enabled IS 'Whether the factor is enabled';
COMMENT ON COLUMN public.user_mfa_factors.is_preferred IS 'Whether this is the preferred factor (shown first in challenge UI)';
COMMENT ON COLUMN public.user_mfa_factors.last_used_at IS 'When the factor was last used for verification';

-- mfa_action_authorizations table (single-use action authorization tokens for step-up MFA)
CREATE TABLE IF NOT EXISTS "public"."mfa_action_authorizations" (
  "id" bigint generated always as identity NOT NULL,
  "jti" text NOT NULL,
  "user_profile_id" bigint NOT NULL,
  "action" text NOT NULL,
  "target_resource" text NOT NULL,
  "token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "mfa_action_authorizations_jti_uq" ON "public"."mfa_action_authorizations" ("jti");
CREATE INDEX IF NOT EXISTS "mfa_action_authorizations_user_profile_id_idx" ON "public"."mfa_action_authorizations" ("user_profile_id");
CREATE INDEX IF NOT EXISTS "mfa_action_authorizations_expires_at_idx" ON "public"."mfa_action_authorizations" ("expires_at");

COMMENT ON TABLE public.mfa_action_authorizations IS 'Single-use action authorization tokens for step-up MFA';
COMMENT ON COLUMN public.mfa_action_authorizations.jti IS 'JWT jti claim — unique identifier of the action authorization token';
COMMENT ON COLUMN public.mfa_action_authorizations.action IS 'The action being authorized (create, update, delete, restore)';
COMMENT ON COLUMN public.mfa_action_authorizations.target_resource IS 'The target resource being acted upon (e.g. "organizations", "user_profiles")';
COMMENT ON COLUMN public.mfa_action_authorizations.token_hash IS 'SHA-256 hash of the JWT token (for lookup, never store the token itself)';
COMMENT ON COLUMN public.mfa_action_authorizations.expires_at IS 'When the token expires';
COMMENT ON COLUMN public.mfa_action_authorizations.used_at IS 'When the token was consumed by the middleware. NULL = not yet used';

-- role_mappings table
CREATE TABLE IF NOT EXISTS "public"."role_mappings" (
  "id" bigint generated always as identity NOT NULL,
  "idp_role" varchar(255) NOT NULL,
  "label_key" varchar(255),
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

-- role_mappings_audit table
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

-- pg_partman setup for role_mappings_audit (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'partman' 
    AND table_name = 'part_config'
  ) OR NOT EXISTS (
    SELECT 1 FROM partman.part_config 
    WHERE parent_table = 'public.role_mappings_audit'
  ) THEN
    PERFORM partman.create_parent('public.role_mappings_audit', 'changed_at', '1 month');
  END IF;
EXCEPTION WHEN others THEN
  -- If pg_partman is not properly configured, skip silently
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS "role_mappings_audit_entity_uuid_idx" ON "public"."role_mappings_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "role_mappings_audit_action_idx" ON "public"."role_mappings_audit" ("action");

-- auth_configurations table (Config Table standard: type/type_config/label_key/description_key/reserved)
CREATE TABLE IF NOT EXISTS "public"."auth_configurations" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(100) NOT NULL,
  "value" text,
  "type" varchar(50) NOT NULL DEFAULT 'string',
  "type_config" text,
  "label_key" varchar(100),
  "description_key" varchar(100),
  "reserved" boolean NOT NULL DEFAULT false,
  "group_key" varchar(100),
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  "deleted_at" timestamptz,
  "deleted_by" text,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_configurations_key_uq" ON "public"."auth_configurations" ("key");
CREATE INDEX IF NOT EXISTS "auth_configurations_deleted_at_idx" ON "public"."auth_configurations" ("deleted_at");

-- auth_configurations_audit table
CREATE TABLE IF NOT EXISTS "public"."auth_configurations_audit" (
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

COMMENT ON COLUMN public.auth_configurations_audit.changed_by IS 'Identifier of the principal that produced the audit entry (falls back to "system" when no authenticated context is available).';

-- Indexes for auth_configurations_audit
CREATE INDEX IF NOT EXISTS "auth_configurations_audit_entity_uuid_idx" ON "public"."auth_configurations_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "auth_configurations_audit_action_idx" ON "public"."auth_configurations_audit" ("action");

-- pg_partman setup for auth_configurations_audit (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'partman' 
    AND table_name = 'part_config'
  ) OR NOT EXISTS (
    SELECT 1 FROM partman.part_config 
    WHERE parent_table = 'public.auth_configurations_audit'
  ) THEN
    PERFORM partman.create_parent('public.auth_configurations_audit', 'changed_at', '1 month');
  END IF;
EXCEPTION WHEN others THEN
  -- If pg_partman is not properly configured, skip silently
  NULL;
END $$;

-- organizations table (merged from multiple patches)
CREATE TABLE IF NOT EXISTS "public"."organizations" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "idp_code" varchar(255) NOT NULL,
  "idp_owner" varchar(255),
  "idp_name" varchar(255),
  "display_name" varchar(255),
  "website_url" varchar(2048),
  "avatar" text,
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

-- organizations_audit table
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

-- pg_partman setup for organizations_audit (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'partman' 
    AND table_name = 'part_config'
  ) OR NOT EXISTS (
    SELECT 1 FROM partman.part_config 
    WHERE parent_table = 'public.organizations_audit'
  ) THEN
    PERFORM partman.create_parent('public.organizations_audit', 'changed_at', '1 month');
  END IF;
EXCEPTION WHEN others THEN
  -- If pg_partman is not properly configured, skip silently
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS "organizations_audit_entity_uuid_idx" ON "public"."organizations_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "organizations_audit_action_idx" ON "public"."organizations_audit" ("action");

-- service_registry table
CREATE TABLE IF NOT EXISTS "public"."service_registry" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(100) NOT NULL,
  "base_url" text NOT NULL,
  "endpoints" jsonb NOT NULL,
  "name" text,
  "description" text,
  "author" text,
  "github_repo_url" text,
  "service_version" text,
  "is_behind_scaler" boolean NOT NULL DEFAULT false,
  "status" text NOT NULL DEFAULT 'unknown',
  "last_health_check_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_registry_uuid_uq" ON "public"."service_registry" ("uuid");

-- One row per code when behind scaler
CREATE UNIQUE INDEX IF NOT EXISTS "service_registry_code_uq_scaler"
  ON "public"."service_registry" ("code") WHERE is_behind_scaler = true;

-- One row per (code, base_url) when not behind scaler
CREATE UNIQUE INDEX IF NOT EXISTS "service_registry_code_base_url_uq"
  ON "public"."service_registry" ("code", "base_url") WHERE is_behind_scaler = false;

-- === AI Chat tables ===
-- NOTE: The AI chat tables (docs_kb, ai_conversations, ai_messages,
-- ai_feedback, ai_telemetry) live in the "ai" schema and are created by the
-- AI microservice's own db-meta/patches/0002_ai_chat_tables.sql patch.
-- The AI microservice owns its schema (microservice isolation pattern).
-- auth_events stays in public because it is a BE concern (auth-event-logger
-- writes from the BE, and the BE's MCP entity registry exposes it).

-- auth_events: Audit auth events (login, logout, mfa_verify, passkey_signin, login_failed)
-- user_profile_uuid is NULLABLE: for failed login attempts there is no JWT and
-- no resolvable user UUID. attempted_username captures the username that was tried.
CREATE TABLE IF NOT EXISTS "public"."auth_events" (
  "id" bigint generated always as identity PRIMARY KEY,
  "user_profile_uuid" uuid,
  "attempted_username" text,
  "event_type" text NOT NULL,
  "event_at" timestamptz NOT NULL DEFAULT now(),
  "ip_address" inet,
  "user_agent" text,
  "success" boolean NOT NULL,
  "failure_reason" text
);

CREATE INDEX IF NOT EXISTS "auth_events_user_profile_uuid_event_at_idx"
  ON "public"."auth_events" ("user_profile_uuid", "event_at" DESC);
CREATE INDEX IF NOT EXISTS "auth_events_event_type_event_at_idx"
  ON "public"."auth_events" ("event_type", "event_at" DESC);
CREATE INDEX IF NOT EXISTS "auth_events_attempted_username_event_at_idx"
  ON "public"."auth_events" ("attempted_username", "event_at" DESC);

-- === Seed Data ===

-- Seed the only auto-created role mapping: 'administrators' (is_admin=true).
-- This matches the 'administrators' role in the admin user's JWT roles array.
-- All other roles are created by the user via the Settings > Roles UI.
INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by, version)
VALUES ('administrators', '[]'::jsonb, true, '2026-05-18T14:27:00Z', 'initial-setup', '2026-05-18T14:27:00Z', 'initial-setup', 1)
ON CONFLICT (idp_role) DO NOTHING;

-- Audit trail for the administrators role seed (INSERT record).
-- Uses 'initial-setup' as changed_by to distinguish seed/system inserts from user actions.
INSERT INTO public.role_mappings_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
SELECT id, uuid, 'INSERT', '2026-05-18T14:27:00Z', 'initial-setup', 1,
  jsonb_build_object(
    'idp_role', jsonb_build_object('old', null, 'new', idp_role),
    'is_admin', jsonb_build_object('old', null, 'new', is_admin),
    'permissions', jsonb_build_object('old', null, 'new', permissions)
  )
FROM public.role_mappings
WHERE idp_role = 'administrators'
AND NOT EXISTS (
  SELECT 1 FROM public.role_mappings_audit a
  WHERE a.entity_uuid = (SELECT uuid FROM public.role_mappings WHERE idp_role = 'administrators')
    AND a.action = 'INSERT'
);

-- Seed the 'auth_auditor' role mapping (read-only auth events audit).
-- Dedicated role for security/compliance team to inspect login logs.
-- Admin (is_admin=true) bypasses all checks; this role is for non-admin users.
-- Note: no audit trail seed for role_mappings because the table has no uuid column
-- (pre-existing schema limitation — administrators seed has the same gap).
INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by, version)
VALUES ('auth_auditor', '["auth_events.read.all"]'::jsonb, false, '2026-05-18T14:27:00Z', 'initial-setup', '2026-05-18T14:27:00Z', 'initial-setup', 1)
ON CONFLICT (idp_role) DO NOTHING;

-- Seed initial auth configuration values
INSERT INTO "public"."auth_configurations" ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by") VALUES
('idp_endpoint', 'http://localhost:8000', 'url', '{"validation":{"required":true,"required_error_label_key":"config.auth.idp_endpoint.errors.required","rules":{"url":{"protocols":["http","https"],"error_label_key":"config.auth.idp_endpoint.errors.invalidUrl"}}}}', 'config.auth.idp_endpoint.label', 'config.auth.idp_endpoint.description', true, 'idp_parameters', 'system'),
('idp_organization', 'ACME', 'string', '{"validation":{"required":true,"required_error_label_key":"config.auth.idp_organization.errors.required","rules":{"min":{"value":1,"error_label_key":"config.auth.idp_organization.errors.min"},"max":{"value":100,"error_label_key":"config.auth.idp_organization.errors.max"}}}}', 'config.auth.idp_organization.label', 'config.auth.idp_organization.description', true, 'idp_parameters', 'system'),
('oidc_issuer_url', 'http://localhost:8000', 'url', '{"validation":{"required":true,"required_error_label_key":"config.auth.oidc_issuer_url.errors.required","rules":{"url":{"protocols":["http","https"],"error_label_key":"config.auth.oidc_issuer_url.errors.invalidUrl"}}}}', 'config.auth.oidc_issuer_url.label', 'config.auth.oidc_issuer_url.description', true, 'oidc_parameters', 'system'),
('idp_type', 'casdoor', 'badge', '{"values":{"casdoor":{"label_key":"config.auth.idp_type.casdoor"},"keycloak":{"label_key":"config.auth.idp_type.keycloak"},"entra":{"label_key":"config.auth.idp_type.entra"},"okta":{"label_key":"config.auth.idp_type.okta"}},"validation":{"required":true,"required_error_label_key":"config.auth.idp_type.errors.required","rules":{}}}', 'config.auth.idp_type.label', 'config.auth.idp_type.description', true, 'idp_parameters', 'system'),
('oidc_client_id', '', 'string', '{"validation":{"required":true,"required_error_label_key":"config.auth.oidc_client_id.errors.required","rules":{"min":{"value":6,"error_label_key":"config.auth.oidc_client_id.errors.min"},"max":{"value":100,"error_label_key":"config.auth.oidc_client_id.errors.max"},"regex":{"pattern":"^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$","error_label_key":"config.auth.oidc_client_id.errors.invalidFormat"}}}}', 'config.auth.oidc_client_id.label', 'config.auth.oidc_client_id.description', true, 'oidc_parameters', 'system'),
('oidc_client_secret', '', 'secret', '{"validation":{"required":true,"required_error_label_key":"config.auth.oidc_client_secret.errors.required","rules":{"min":{"value":32,"error_label_key":"config.auth.oidc_client_secret.errors.min"},"max":{"value":256,"error_label_key":"config.auth.oidc_client_secret.errors.max"}}}}', 'config.auth.oidc_client_secret.label', 'config.auth.oidc_client_secret.description', true, 'oidc_parameters', 'system'),
('enable_email_verification_check', 'false', 'boolean', '{"validation":{"required":true,"required_error_label_key":"config.auth.enable_email_verification_check.errors.required","rules":{}}}', 'config.auth.enable_email_verification_check.label', 'config.auth.enable_email_verification_check.description', true, 'security_parameters', 'system'),
('enable_webauthn', 'true', 'boolean', '{"validation":{"required":true,"required_error_label_key":"config.auth.enable_webauthn.errors.required","rules":{}}}', 'config.auth.enable_webauthn.label', 'config.auth.enable_webauthn.description', true, 'security_parameters', 'system'),
('passkey_required', 'true', 'boolean', '{"validation":{"required":true,"required_error_label_key":"config.auth.passkey_required.errors.required","rules":{}}}', 'config.auth.passkey_required.label', 'config.auth.passkey_required.description', true, 'security_parameters', 'system'),
('enable_mfa', 'false', 'boolean', '{"validation":{"required":true,"required_error_label_key":"config.auth.enable_mfa.errors.required","rules":{}}}', 'config.auth.enable_mfa.label', 'config.auth.enable_mfa.description', true, 'security_parameters', 'system'),
('password_policy', 'letter_number_special', 'badge', '{"values":{"alpha_numeric":{"label_key":"config.auth.password_policy.alpha_numeric"},"letter_and_number":{"label_key":"config.auth.password_policy.letter_and_number"},"letter_number_special":{"label_key":"config.auth.password_policy.letter_number_special"},"mixed_case_special":{"label_key":"config.auth.password_policy.mixed_case_special"}},"validation":{"required":true,"required_error_label_key":"config.auth.password_policy.errors.required","rules":{}}}', 'config.auth.password_policy.label', 'config.auth.password_policy.description', true, 'security_parameters', 'system'),
('auth_mode', 'STANDALONE', 'badge', '{"values":{"STANDALONE":{"label_key":"config.auth.auth_mode.standalone","color":"sky-300"},"GATEWAY":{"label_key":"config.auth.auth_mode.gateway","color":"amber-300"}},"validation":{"required":true,"required_error_label_key":"config.auth.auth_mode.errors.required","rules":{}}}', 'config.auth.auth_mode.label', 'config.auth.auth_mode.description', true, 'idp_parameters', 'system'),
('auth_roles_path', 'roles', 'string', '{"validation":{"required":true,"required_error_label_key":"config.auth.auth_roles_path.errors.required","rules":{"min":{"value":3,"error_label_key":"config.auth.auth_roles_path.errors.min"},"max":{"value":255,"error_label_key":"config.auth.auth_roles_path.errors.max"},"regex":{"pattern":"^([_a-zA-Z0-9-]*[a-zA-Z0-9])(\\.([_a-zA-Z0-9-]*[a-zA-Z0-9]))*$","error_label_key":"config.auth.auth_roles_path.errors.invalidFormat"}}}}', 'config.auth.auth_roles_path.label', 'config.auth.auth_roles_path.description', true, 'oidc_parameters', 'system'),
('invitation_expiry_days', '7', 'integer', '{"validation":{"required":true,"required_error_label_key":"config.auth.invitation_expiry_days.errors.required","rules":{"min":{"value":1,"error_label_key":"config.auth.invitation_expiry_days.errors.min"},"max":{"value":90,"error_label_key":"config.auth.invitation_expiry_days.errors.max"}}}}', 'config.auth.invitation_expiry_days.label', 'config.auth.invitation_expiry_days.description', true, 'advanced_features', 'system'),
('admin_contact_email', '', 'string', '{"validation":{"required":true,"required_error_label_key":"config.auth.admin_contact_email.errors.required","rules":{"email":{"error_label_key":"config.auth.admin_contact_email.errors.invalidEmail"}}}}', 'config.auth.admin_contact_email.label', 'config.auth.admin_contact_email.description', true, 'system_settings', 'system'),
('notification_alert_secret', '', 'secret', '{"validation":{"required":true,"required_error_label_key":"config.auth.notification_alert_secret.errors.required","rules":{"min":{"value":32,"error_label_key":"config.auth.notification_alert_secret.errors.min"},"max":{"value":256,"error_label_key":"config.auth.notification_alert_secret.errors.max"}}}}', 'config.auth.notification_alert_secret.label', 'config.auth.notification_alert_secret.description', true, 'system_settings', 'system'),
('frontend_url', 'http://localhost:5173', 'url', '{"validation":{"required":true,"required_error_label_key":"config.auth.frontend_url.errors.required","rules":{"url":{"protocols":["http","https"],"error_label_key":"config.auth.frontend_url.errors.invalidUrl"}}}}', 'config.auth.frontend_url.label', 'config.auth.frontend_url.description', true, 'system_settings', 'system'),
('redis_url', 'redis://redis:6379', 'url', '{"validation":{"required":true,"required_error_label_key":"config.auth.redis_url.errors.required","rules":{"url":{"protocols":["redis","rediss","tcp","http","https"],"error_label_key":"config.auth.redis_url.errors.invalidUrl"}}}}', 'config.auth.redis_url.label', 'config.auth.redis_url.description', true, 'advanced_features', 'system'),
('mfa_challenge_token_ttl_seconds', '300', 'integer', '{"validation":{"required":true,"required_error_label_key":"config.auth.mfa_challenge_token_ttl_seconds.errors.required","rules":{"min":{"value":30,"error_label_key":"config.auth.mfa_challenge_token_ttl_seconds.errors.min"},"max":{"value":600,"error_label_key":"config.auth.mfa_challenge_token_ttl_seconds.errors.max"}}}}', 'config.auth.mfa_challenge_token_ttl_seconds.label', 'config.auth.mfa_challenge_token_ttl_seconds.description', true, 'security_parameters', 'system'),
('mfa_challenge_signing_secret', '', 'secret', '{"validation":{"required":true,"required_error_label_key":"config.auth.mfa_challenge_signing_secret.errors.required","rules":{"min":{"value":32,"error_label_key":"config.auth.mfa_challenge_signing_secret.errors.min"},"max":{"value":256,"error_label_key":"config.auth.mfa_challenge_signing_secret.errors.max"}}}}', 'config.auth.mfa_challenge_signing_secret.label', 'config.auth.mfa_challenge_signing_secret.description', true, 'security_parameters', 'system')
ON CONFLICT ("key") DO NOTHING;

-- Audit trail for the auth_configurations seed (INSERT record, version 1).
-- Uses 'initial-setup' as changed_by to distinguish seed/system inserts from user actions.
-- changed_at uses the actual created_at of each row (not a hardcoded timestamp).
-- Delta includes ALL columns to match the DAL's INSERT audit behavior (Phase 2).
INSERT INTO public.auth_configurations_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
SELECT id, uuid, 'INSERT', created_at, 'initial-setup', 1,
  jsonb_strip_nulls(jsonb_build_object(
    'id', jsonb_build_object('old', null, 'new', id),
    'uuid', jsonb_build_object('old', null, 'new', uuid),
    'key', jsonb_build_object('old', null, 'new', key),
    'value', jsonb_build_object('old', null, 'new', value),
    'type', jsonb_build_object('old', null, 'new', type),
    'type_config', jsonb_build_object('old', null, 'new', type_config),
    'label_key', jsonb_build_object('old', null, 'new', label_key),
    'description_key', jsonb_build_object('old', null, 'new', description_key),
    'reserved', jsonb_build_object('old', null, 'new', reserved),
    'group_key', jsonb_build_object('old', null, 'new', group_key),
    'created_at', jsonb_build_object('old', null, 'new', created_at),
    'created_by', jsonb_build_object('old', null, 'new', COALESCE(created_by, 'system')),
    'updated_at', jsonb_build_object('old', null, 'new', updated_at),
    'updated_by', jsonb_build_object('old', null, 'new', COALESCE(updated_by, created_by, 'system')),
    'version', jsonb_build_object('old', null, 'new', version),
    'deleted_at', jsonb_build_object('old', null, 'new', deleted_at),
    'deleted_by', jsonb_build_object('old', null, 'new', deleted_by)
  ))
FROM public.auth_configurations
WHERE NOT EXISTS (
  SELECT 1 FROM public.auth_configurations_audit a
  WHERE a.entity_uuid = auth_configurations.uuid
    AND a.action = 'INSERT'
);

-- === Patch Registry Table ===
CREATE TABLE IF NOT EXISTS "public"."primebrick_database_patches" (
  "patch_id" text PRIMARY KEY,
  "content_sha256" text NOT NULL,
  "applied_at" timestamptz DEFAULT now()
);

-- === patch registry (repeatable runs) ===
-- patch_id: 00000000000000_init_database
-- content_sha256: TBD
-- After apply:
-- INSERT INTO public.primebrick_database_patches (patch_id, content_sha256)
-- VALUES ('00000000000000_init_database', 'TBD')
-- ON CONFLICT (patch_id) DO NOTHING;
