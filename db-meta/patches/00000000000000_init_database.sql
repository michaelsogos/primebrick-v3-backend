-- 00000000000000 — be schema baseline: consolidated 'as if first time' shape.
-- Replaces the accumulated 127-patch chain (00000000000000-14 + 2026* deltas).
-- Entity-generated section: all registry-declared tables, partman *_audit
-- partitions, declared indexes. Handwritten supplement: objects the registry
-- cannot declare — the three translations tables (gateway-owned CRUD:
-- public=app.*, system=system.*, custom=custom.*), the custom schema, and
-- client_shield_registry CHECK constraints.

-- ─── Platform extensions ────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS "partman";
CREATE EXTENSION IF NOT EXISTS "pg_partman" SCHEMA "partman";

-- ─── custom schema (user-owned data boundary) ───────────────────────────

CREATE SCHEMA IF NOT EXISTS "custom";
GRANT ALL ON SCHEMA "custom" TO primebrick;
GRANT ALL ON SCHEMA "custom" TO public;

-- ─── Entity tables, indexes, audit partitions (entity-declared) ─────────

CREATE TABLE IF NOT EXISTS "public"."auth_events" (
  "id" bigint generated always as identity NOT NULL,
  "user_profile_uuid" uuid,
  "attempted_username" text,
  "event_type" text NOT NULL,
  "event_at" timestamptz NOT NULL,
  "ip_address" inet,
  "user_agent" text,
  "success" boolean NOT NULL,
  "failure_reason" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."config_entries" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "deleted_at" timestamptz,
  "deleted_by" text,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(100) NOT NULL,
  "value" text,
  "type" varchar(50) NOT NULL,
  "type_config" text,
  "label_key" varchar(100),
  "description_key" varchar(100),
  "reserved" boolean DEFAULT false NOT NULL,
  "group_key" varchar(100),
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "config_entries_uuid_uq" ON "public"."config_entries" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "config_entries_key_uq" ON "public"."config_entries" ("key");

CREATE TABLE IF NOT EXISTS "public"."config_entries_audit" (
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

SELECT partman.create_parent('public.config_entries_audit', 'changed_at', '1 month', 'range');

CREATE INDEX IF NOT EXISTS "config_entries_audit_entity_uuid_idx" ON "public"."config_entries_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "config_entries_audit_action_idx" ON "public"."config_entries_audit" ("action");

CREATE TABLE IF NOT EXISTS "public"."mfa_action_authorizations" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "id" bigint generated always as identity NOT NULL,
  "jti" text NOT NULL,
  "user_profile_id" int8 NOT NULL,
  "action" text NOT NULL,
  "target_resource" text NOT NULL,
  "token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "mfa_action_authorizations_jti_uq" ON "public"."mfa_action_authorizations" ("jti");

CREATE TABLE IF NOT EXISTS "public"."mfa_action_authorizations_audit" (
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

SELECT partman.create_parent('public.mfa_action_authorizations_audit', 'changed_at', '1 month', 'range');

CREATE INDEX IF NOT EXISTS "mfa_action_authorizations_audit_entity_uuid_idx" ON "public"."mfa_action_authorizations_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "mfa_action_authorizations_audit_action_idx" ON "public"."mfa_action_authorizations_audit" ("action");

CREATE TABLE IF NOT EXISTS "public"."organizations" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "deleted_at" timestamptz,
  "deleted_by" text,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "idp_code" varchar(255) NOT NULL,
  "idp_owner" varchar(255),
  "idp_name" varchar(255),
  "display_name" varchar(255),
  "website_url" varchar(2048),
  "avatar" text,
  "last_synced_at" timestamptz,
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

SELECT partman.create_parent('public.organizations_audit', 'changed_at', '1 month', 'range');

CREATE INDEX IF NOT EXISTS "organizations_audit_entity_uuid_idx" ON "public"."organizations_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "organizations_audit_action_idx" ON "public"."organizations_audit" ("action");

CREATE TABLE IF NOT EXISTS "public"."role_mappings" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "idp_role" varchar(255) NOT NULL,
  "idp_org" varchar(255),
  "label_key" varchar(255),
  "permissions" jsonb NOT NULL,
  "is_admin" boolean NOT NULL,
  "last_synced_at" timestamptz,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "role_mappings_uuid_uq" ON "public"."role_mappings" ("uuid");
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

SELECT partman.create_parent('public.role_mappings_audit', 'changed_at', '1 month', 'range');

CREATE INDEX IF NOT EXISTS "role_mappings_audit_entity_uuid_idx" ON "public"."role_mappings_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "role_mappings_audit_action_idx" ON "public"."role_mappings_audit" ("action");

CREATE TABLE IF NOT EXISTS "public"."user_invitations" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_profile_id" int8 NOT NULL,
  "token_hash" text NOT NULL,
  "status" text NOT NULL,
  "email" varchar(320) NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "completed_at" timestamptz,
  "otp_hash" text,
  "otp_expires_at" timestamptz,
  "otp_attempts" integer DEFAULT 0 NOT NULL,
  "otp_verified_at" timestamptz,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_invitations_uuid_uq" ON "public"."user_invitations" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "user_invitations_token_hash_uq" ON "public"."user_invitations" ("token_hash");

CREATE TABLE IF NOT EXISTS "public"."user_invitations_audit" (
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

SELECT partman.create_parent('public.user_invitations_audit', 'changed_at', '1 month', 'range');

CREATE INDEX IF NOT EXISTS "user_invitations_audit_entity_uuid_idx" ON "public"."user_invitations_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "user_invitations_audit_action_idx" ON "public"."user_invitations_audit" ("action");

CREATE TABLE IF NOT EXISTS "public"."user_mfa_factors" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_profile_id" int8 NOT NULL,
  "factor_type" text NOT NULL,
  "casdoor_mfa_type" text,
  "totp_secret_encrypted" text NOT NULL,
  "label" varchar(100),
  "is_enabled" boolean NOT NULL,
  "is_preferred" boolean NOT NULL,
  "last_used_at" timestamptz,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_mfa_factors_uuid_uq" ON "public"."user_mfa_factors" ("uuid");

CREATE TABLE IF NOT EXISTS "public"."user_mfa_factors_audit" (
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

SELECT partman.create_parent('public.user_mfa_factors_audit', 'changed_at', '1 month', 'range');

CREATE INDEX IF NOT EXISTS "user_mfa_factors_audit_entity_uuid_idx" ON "public"."user_mfa_factors_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "user_mfa_factors_audit_action_idx" ON "public"."user_mfa_factors_audit" ("action");

CREATE TABLE IF NOT EXISTS "public"."user_passkeys" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_profile_id" int8 NOT NULL,
  "credential_id" text NOT NULL,
  "aaguid" text,
  "transports" jsonb,
  "label" varchar(100),
  "last_used_at" timestamptz,
  "authenticator_attachment" text,
  "user_agent" text,
  "os" text,
  "device_model" text,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_passkeys_uuid_uq" ON "public"."user_passkeys" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "user_passkeys_credential_id_uq" ON "public"."user_passkeys" ("credential_id");

CREATE TABLE IF NOT EXISTS "public"."user_passkeys_audit" (
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

SELECT partman.create_parent('public.user_passkeys_audit', 'changed_at', '1 month', 'range');

CREATE INDEX IF NOT EXISTS "user_passkeys_audit_entity_uuid_idx" ON "public"."user_passkeys_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "user_passkeys_audit_action_idx" ON "public"."user_passkeys_audit" ("action");

CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(128) NOT NULL,
  "value" jsonb NOT NULL,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_preferences_uuid_uq" ON "public"."user_preferences" ("uuid");

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "deleted_at" timestamptz,
  "deleted_by" text,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "idp_code" varchar(255) NOT NULL,
  "email" varchar(320),
  "display_name" varchar(255),
  "avatar_color" varchar(7),
  "avatar_initials" varchar(10),
  "is_active" boolean DEFAULT true NOT NULL,
  "is_admin" boolean DEFAULT false NOT NULL,
  "roles" jsonb,
  "last_synced_at" timestamptz,
  "idp_org" varchar(255),
  "idp_username" varchar(255),
  "is_verified" boolean DEFAULT false NOT NULL,
  "email_verified" boolean DEFAULT false NOT NULL,
  "issuer" varchar(255),
  "auth_method_enforcer_dismissed" boolean DEFAULT false NOT NULL,
  "onboarding_completed" boolean DEFAULT false NOT NULL,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_uuid_uq" ON "public"."user_profiles" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_idp_code_uq" ON "public"."user_profiles" ("idp_code");

CREATE TABLE IF NOT EXISTS "public"."user_profiles_audit" (
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

SELECT partman.create_parent('public.user_profiles_audit', 'changed_at', '1 month', 'range');

CREATE INDEX IF NOT EXISTS "user_profiles_audit_entity_uuid_idx" ON "public"."user_profiles_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "user_profiles_audit_action_idx" ON "public"."user_profiles_audit" ("action");

CREATE TABLE IF NOT EXISTS "public"."api_keys" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "key_hash" text NOT NULL,
  "key_prefix" varchar(20) NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "permissions" jsonb,
  "is_system" boolean,
  "is_active" boolean,
  "expires_at" timestamptz,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_uuid_uq" ON "public"."api_keys" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_key_hash_uq" ON "public"."api_keys" ("key_hash");

CREATE TABLE IF NOT EXISTS "public"."mcp_oauth_clients" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "client_id" varchar(255) NOT NULL,
  "client_secret" text,
  "client_name" varchar(255),
  "redirect_uris" jsonb,
  "grant_types" jsonb,
  "response_types" jsonb,
  "token_endpoint_auth_method" varchar(50),
  "scope" text,
  "client_id_issued_at" timestamptz,
  "client_secret_expires_at" timestamptz,
  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "version" int4 NOT NULL,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "mcp_oauth_clients_uuid_uq" ON "public"."mcp_oauth_clients" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "mcp_oauth_clients_client_id_uq" ON "public"."mcp_oauth_clients" ("client_id");

CREATE TABLE IF NOT EXISTS "public"."service_registry" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "deleted_at" timestamptz,
  "deleted_by" text,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(100) NOT NULL,
  "base_url" text NOT NULL,
  "part_of" text NOT NULL,
  "endpoints" jsonb NOT NULL,
  "name" text,
  "description" text,
  "author" text,
  "github_repo_url" text,
  "service_version" text,
  "pkg_name" text,
  "capabilities" jsonb DEFAULT '[]' NOT NULL,
  "schemas" text[] DEFAULT '{}' NOT NULL,
  "is_behind_scaler" boolean DEFAULT false NOT NULL,
  "status" text DEFAULT 'unknown' NOT NULL,
  "last_health_check_at" timestamptz,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "icon" text,
  "icon_type" text DEFAULT 'icon' NOT NULL,
  "is_reserved" boolean DEFAULT false NOT NULL,
  "label_key" varchar,
  "is_default" boolean DEFAULT false NOT NULL,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_registry_uuid_uq" ON "public"."service_registry" ("uuid");

CREATE SCHEMA IF NOT EXISTS "system";

CREATE TABLE IF NOT EXISTS "system"."client_shield_registry" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "deleted_at" timestamptz,
  "deleted_by" text,
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "ua_prefix" varchar(255) NOT NULL,
  "client_key_hash" varchar(255) NOT NULL,
  "source" varchar(20) DEFAULT 'manual' NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "key_mode" varchar(10) DEFAULT 'static' NOT NULL,
  "key_generation" int4 DEFAULT 0 NOT NULL,
  "previous_key_hash" varchar(255),
  "previous_valid_until" timestamptz,
  "key_rotated_at" timestamptz,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "client_shield_registry_uuid_uq" ON "system"."client_shield_registry" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "client_shield_registry_ua_prefix_uq" ON "system"."client_shield_registry" ("ua_prefix");

-- ─── public.translations (app.* keys, BE gateway CRUD) ─────────────────

CREATE TABLE IF NOT EXISTS public.translations (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    key character varying(255) NOT NULL,
    language character varying(10) NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(255) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT translations_key_shape CHECK (((key)::text ~ '^app(.[a-z0-9_]+)+$'::text))
);
CREATE SEQUENCE IF NOT EXISTS public.translations_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;
ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);
ALTER TABLE ONLY public.translations ADD CONSTRAINT translations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.translations ADD CONSTRAINT translations_uuid_key UNIQUE (uuid);
CREATE UNIQUE INDEX IF NOT EXISTS translations_key_language_uidx ON public.translations USING btree (key, language);
CREATE INDEX IF NOT EXISTS translations_language_idx ON public.translations USING btree (language) WHERE (deleted_at IS NULL);

-- ─── system.translations (system.* keys) ────────────────────────────────

CREATE TABLE IF NOT EXISTS system.translations (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    key character varying(255) NOT NULL,
    language character varying(10) NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(255) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT translations_key_shape CHECK (((key)::text ~ '^system(.[a-z0-9_]+)+$'::text))
);
CREATE SEQUENCE IF NOT EXISTS system.translations_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE system.translations_id_seq OWNED BY system.translations.id;
ALTER TABLE ONLY system.translations ALTER COLUMN id SET DEFAULT nextval('system.translations_id_seq'::regclass);
ALTER TABLE ONLY system.translations ADD CONSTRAINT translations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY system.translations ADD CONSTRAINT translations_uuid_key UNIQUE (uuid);
CREATE UNIQUE INDEX IF NOT EXISTS system_translations_key_language_uidx ON system.translations USING btree (key, language);
CREATE INDEX IF NOT EXISTS system_translations_language_idx ON system.translations USING btree (language) WHERE (deleted_at IS NULL);

-- ─── custom.translations (custom.* keys, user-owned) ───────────────────

CREATE TABLE IF NOT EXISTS custom.translations (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    key character varying(255) NOT NULL,
    language character varying(10) NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(255) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT translations_key_shape CHECK (((key)::text ~ '^custom(.[a-z0-9_]+)+$'::text))
);
CREATE SEQUENCE IF NOT EXISTS custom.translations_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE custom.translations_id_seq OWNED BY custom.translations.id;
ALTER TABLE ONLY custom.translations ALTER COLUMN id SET DEFAULT nextval('custom.translations_id_seq'::regclass);
ALTER TABLE ONLY custom.translations ADD CONSTRAINT translations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY custom.translations ADD CONSTRAINT translations_uuid_key UNIQUE (uuid);
CREATE UNIQUE INDEX IF NOT EXISTS custom_translations_key_language_uidx ON custom.translations USING btree (key, language);
CREATE INDEX IF NOT EXISTS custom_translations_language_idx ON custom.translations USING btree (language) WHERE (deleted_at IS NULL);

-- ─── client_shield_registry CHECK constraints ───────────────────────────

ALTER TABLE system.client_shield_registry ADD CONSTRAINT client_shield_registry_key_mode_ck CHECK (((key_mode)::text = ANY ((ARRAY['static'::character varying, 'derived'::character varying])::text[])));
ALTER TABLE system.client_shield_registry ADD CONSTRAINT client_shield_registry_source_ck CHECK (((source)::text = ANY ((ARRAY['registry'::character varying, 'manual'::character varying])::text[])));
