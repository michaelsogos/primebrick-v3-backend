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
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_uuid_uq" ON "public"."user_profiles" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_idp_code_uq" ON "public"."user_profiles" ("idp_code");

COMMENT ON COLUMN public.user_profiles.avatar_color IS 'Avatar color hex code (e.g., #3b82f6) for user profile display';
COMMENT ON COLUMN public.user_profiles.is_active IS 'Whether the user account is active (mirrors Casdoor isForbidden)';
COMMENT ON COLUMN public.user_profiles.is_admin IS 'Whether the user has admin privileges (mirrors Casdoor isAdmin)';
COMMENT ON COLUMN public.user_profiles.roles IS 'Array of role names assigned to the user (mirrors Casdoor roles)';
COMMENT ON COLUMN public.user_profiles.last_synced_at IS 'Timestamp of last successful sync with Casdoor';

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
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_registry_uuid_uq" ON "public"."service_registry" ("uuid");

-- === Seed Data ===

-- Seed initial role mappings
INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by, version)
VALUES ('administrators', '[]'::jsonb, true, '2026-05-18T14:27:00Z', 'system', '2026-05-18T14:27:00Z', 'system', 1)
ON CONFLICT (idp_role) DO NOTHING;

INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by, version)
VALUES ('sales',
  '["customers:list", "customers:read", "customers:create", "customers:update"]'::jsonb,
  false,
  '2026-05-18T14:27:00Z',
  'system',
  '2026-05-18T14:27:00Z',
  'system',
  1
)
ON CONFLICT (idp_role) DO NOTHING;

INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by, version)
VALUES ('customer_service',
  '["customers:list", "customers:read", "customers:update"]'::jsonb,
  false,
  '2026-05-18T14:27:00Z',
  'system',
  '2026-05-18T14:27:00Z',
  'system',
  1
)
ON CONFLICT (idp_role) DO NOTHING;

INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by, version)
VALUES ('hr',
  '[]'::jsonb,
  false,
  '2026-05-18T14:27:00Z',
  'system',
  '2026-05-18T14:27:00Z',
  'system',
  1
)
ON CONFLICT (idp_role) DO NOTHING;

INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by, version)
VALUES ('ops',
  '[]'::jsonb,
  false,
  '2026-05-18T14:27:00Z',
  'system',
  '2026-05-18T14:27:00Z',
  'system',
  1
)
ON CONFLICT (idp_role) DO NOTHING;

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
('password_policy', 'letter_number_special', 'Active password complexity policy (alpha_numeric | letter_and_number | letter_number_special | mixed_case_special)', 'system'),
('auth_mode', 'STANDALONE', 'Authentication operating mode (STANDALONE | GATEWAY). STANDALONE = API validates JWT via OIDC discovery; GATEWAY = trusted reverse proxy forwards user identity via headers.', 'system'),
('auth_roles_path', 'roles', 'Dotted path to extract the roles array from a JWT payload (e.g. "roles" for Casdoor/Entra, "realm_access.roles" for Keycloak realm roles).', 'system')
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
