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
COMMENT ON COLUMN public.user_profiles.is_active IS 'Whether the user account is active (mirrors Casdoor isForbidden)';
COMMENT ON COLUMN public.user_profiles.is_admin IS 'Whether the user has admin privileges (mirrors Casdoor isAdmin)';
COMMENT ON COLUMN public.user_profiles.roles IS 'Array of role names assigned to the user (mirrors Casdoor roles)';
COMMENT ON COLUMN public.user_profiles.last_synced_at IS 'Timestamp of last successful sync with Casdoor';
COMMENT ON COLUMN public.user_profiles.auth_method_enforcer_dismissed IS 'Whether the user dismissed the auth method enforcer prompt (passkey/MFA)';
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

COMMENT ON TABLE public.user_passkeys IS 'Passkey credentials tracked in PG (mirrors Casdoor webauthnCredentials)';
COMMENT ON COLUMN public.user_passkeys.credential_id IS 'base64url credential ID from WebAuthn';
COMMENT ON COLUMN public.user_passkeys.aaguid IS 'Authenticator model identifier';
COMMENT ON COLUMN public.user_passkeys.transports IS 'JSON array of transports ["internal","hybrid","usb","nfc","ble"]';
COMMENT ON COLUMN public.user_passkeys.label IS 'User-given name (e.g. "Windows Hello", "iPhone")';
COMMENT ON COLUMN public.user_passkeys.last_used_at IS 'Last time this credential was used to sign in (null until first signin after this feature ships)';
COMMENT ON COLUMN public.user_passkeys.authenticator_attachment IS 'platform | cross-platform (WebAuthn AuthenticatorAttachment)';
COMMENT ON COLUMN public.user_passkeys.user_agent IS 'navigator.userAgent captured at enrollment (truncated to 512 chars)';
COMMENT ON COLUMN public.user_passkeys.os IS 'OS inferred from UA at enrollment (e.g. Windows, macOS, iOS, Android, Linux)';
COMMENT ON COLUMN public.user_passkeys.device_model IS 'Device model inferred from UA at enrollment (e.g. "Windows PC", "Mac", "iPhone", "Pixel")';

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

-- auth_configurations table
CREATE TABLE IF NOT EXISTS "public"."auth_configurations" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(50) NOT NULL,
  "value" text NOT NULL,
  "description" text,
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

-- Seed initial auth configuration values
INSERT INTO "public"."auth_configurations" ("key", "value", "description", "created_by") VALUES
('casdoor_endpoint', 'http://localhost:8000', 'URL base del server Casdoor', 'system'),
('casdoor_organization', 'ACME', 'Nome dell organization di riferimento', 'system'),
('casdoor_client_id', 'primebrick-api', 'Client ID della nostra applicazione', 'system'),
('casdoor_admin_username', 'admin', 'Username dell utente amministratore standard', 'system'),
('casdoor_admin_role', 'administrators', 'Nome del ruolo amministrativo', 'system'),
('oidc_issuer_url', 'http://localhost:8000', 'OIDC issuer URL per validazione token', 'system'),
('oidc_issuer_type', 'casdoor', 'Tipo di IDP (casdoor, keycloak, auth0)', 'system'),
('oidc_client_id', '', 'OIDC client ID reale generato da Casdoor', 'system'),
('enable_email_verification_check', 'false', 'Abilita il controllo emailVerified sul JWT durante il login (true/false)', 'system'),
('enable_formauth', 'true', 'Abilita il login con form username/password (true/false). Almeno uno tra enable_formauth e enable_webauthn deve essere true.', 'system'),
('enable_webauthn', 'true', 'Abilita il login passwordless con WebAuthn / passkey (true/false). Almeno uno tra enable_formauth e enable_webauthn deve essere true.', 'system'),
('passkey_required', 'true', 'Se true, la passkey e obbligatoria: il prompt di enrollment non puo essere saltato e il checkbox Non mostrare piu e nascosto (true/false).', 'system'),
('enable_mfa', 'false', 'Abilita MFA / 2FA (login MFA + step-up MFA). Quando false, il login non brancha su MFA e il middleware step-up passa through (true/false).', 'system'),
('password_policy', 'letter_number_special', 'Active password complexity policy (alpha_numeric | letter_and_number | letter_number_special | mixed_case_special)', 'system'),
('auth_mode', 'STANDALONE', 'Authentication operating mode (STANDALONE | GATEWAY). STANDALONE = API validates JWT via OIDC discovery; GATEWAY = trusted reverse proxy forwards user identity via headers.', 'system'),
('auth_roles_path', 'roles', 'Dotted path to extract the roles array from a JWT payload (e.g. "roles" for Casdoor/Entra, "realm_access.roles" for Keycloak realm roles).', 'system'),
('invitation_expiry_days', '7', 'Invitation token expiry in days', 'system'),
('admin_contact_email', '', 'Admin email for unauthorized action alerts and mailto: links. If empty, BE falls back to first user with is_admin=true.', 'system'),
('notification_alert_secret', '', 'HMAC secret for unauthorized-action alert links in emails. Auto-generated (32 random bytes hex) on first use if empty.', 'system'),
('frontend_url', 'http://localhost:5173', 'Frontend application base URL (used for email links, e.g. welcome page). In production, set to the public HTTPS URL.', 'system'),
('redis_url', 'redis://redis:6379', 'Redis cache URL. Empty = cache disabled (best-effort, system valid without it). Default: dockerized Redis (Docker network name). Change to external Redis URL if needed.', 'system')
ON CONFLICT ("key") DO NOTHING;

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
