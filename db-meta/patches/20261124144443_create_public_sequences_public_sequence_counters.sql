-- Primebrick: entity → database patch
-- pb:requires-review
-- generatedAt: 2026-11-24T14:44:43.033Z

CREATE TABLE IF NOT EXISTS "public"."sequences" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text DEFAULT 'system' NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text DEFAULT 'system' NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "deleted_at" timestamptz,
  "deleted_by" text,
  "uuid" uuid DEFAULT uuidv7() NOT NULL,
  "name" varchar(100) NOT NULL,
  "pattern" text NOT NULL,
  "step" int8 DEFAULT 1 NOT NULL,
  "start" int8 DEFAULT 1 NOT NULL,
  "tz" varchar(100) DEFAULT 'UTC' NOT NULL,
  "description_key" varchar(200),
  "sez" varchar(200),
  "sez2" varchar(200),
  "sez3" varchar(200),
  "binding_key" varchar(130),
  "revive_every" varchar(30),
  "revive_grace" varchar(30),
  "revive_slot" varchar(10),
  "expire_at" timestamptz,
  "switch_at" timestamptz,
  "default_from" timestamptz,
  "revived_from" uuid,
  "revived_at" timestamptz,
  "revived_by" varchar(100),
  PRIMARY KEY ("uuid")
);

CREATE TABLE IF NOT EXISTS "public"."sequences_audit" (
  "uuid" uuid NOT NULL DEFAULT uuidv7(),
  "entity_uuid" uuid NOT NULL,
  "action" text NOT NULL,
  "changed_at" timestamptz NOT NULL,
  "changed_by" text NOT NULL DEFAULT 'system',
  "version" integer NOT NULL,
  "delta" jsonb NOT NULL,
  PRIMARY KEY ("uuid", "changed_at")
) PARTITION BY RANGE ("changed_at");

SELECT partman.create_parent('public.sequences_audit', 'changed_at', '1 month', 'range');
UPDATE partman.part_config SET retention = '12 months', retention_keep_table = false WHERE parent_table = 'public.sequences_audit';

CREATE INDEX IF NOT EXISTS "sequences_audit_entity_uuid_idx" ON "public"."sequences_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "sequences_audit_action_idx" ON "public"."sequences_audit" ("action");

CREATE TABLE IF NOT EXISTS "public"."sequence_counters" (
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "created_by" text DEFAULT 'system' NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text DEFAULT 'system' NOT NULL,
  "version" int4 DEFAULT 1 NOT NULL,
  "uuid" uuid DEFAULT uuidv7() NOT NULL,
  "sequence_uuid" uuid NOT NULL,
  "period_key" varchar(64) DEFAULT '' NOT NULL,
  "partition_key" varchar(255) DEFAULT '' NOT NULL,
  "counter" int8 NOT NULL,
  "last_alloc_at" timestamptz,
  "last_alloc_by" varchar(100),
  "last_alloc_count" int8,
  PRIMARY KEY ("uuid")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sequence_counters_identity" ON "public"."sequence_counters" ("sequence_uuid", "period_key", "partition_key");

-- ── review section (runs only after approval) ──
-- drop default "event_at" (db=now())
ALTER TABLE "public"."auth_events" ALTER COLUMN "event_at" DROP DEFAULT;
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."config_entries" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."config_entries" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- drop default "type" (db='string')
ALTER TABLE "public"."config_entries" ALTER COLUMN "type" DROP DEFAULT;
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."mfa_action_authorizations" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."organizations" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."organizations" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."role_mappings" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."role_mappings" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- drop default "is_admin" (db=false)
ALTER TABLE "public"."role_mappings" ALTER COLUMN "is_admin" DROP DEFAULT;
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."user_invitations" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."user_invitations" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- drop default "status" (db='PENDING')
ALTER TABLE "public"."user_invitations" ALTER COLUMN "status" DROP DEFAULT;
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- drop default "is_enabled" (db=true)
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "is_enabled" DROP DEFAULT;
-- drop default "is_preferred" (db=false)
ALTER TABLE "public"."user_mfa_factors" ALTER COLUMN "is_preferred" DROP DEFAULT;
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."user_passkeys" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."user_preferences" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."user_preferences" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."user_profiles" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."user_profiles" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."api_keys" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."api_keys" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- drop default "permissions" (db='[]')
ALTER TABLE "public"."api_keys" ALTER COLUMN "permissions" DROP DEFAULT;
-- drop default "is_system" (db=false)
ALTER TABLE "public"."api_keys" ALTER COLUMN "is_system" DROP DEFAULT;
-- drop default "is_active" (db=true)
ALTER TABLE "public"."api_keys" ALTER COLUMN "is_active" DROP DEFAULT;
-- drop default "redirect_uris" (db='[]')
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "redirect_uris" DROP DEFAULT;
-- drop default "grant_types" (db='["authorization_code", "refresh_token"]')
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "grant_types" DROP DEFAULT;
-- drop default "response_types" (db='["code"]')
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "response_types" DROP DEFAULT;
-- drop default "token_endpoint_auth_method" (db='client_secret_post')
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "token_endpoint_auth_method" DROP DEFAULT;
-- drop default "scope" (db='mcp:tools')
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "scope" DROP DEFAULT;
-- drop default "client_id_issued_at" (db=now())
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "client_id_issued_at" DROP DEFAULT;
-- drop default "created_at" (db=now())
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "created_at" DROP DEFAULT;
-- drop default "updated_at" (db=now())
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "updated_at" DROP DEFAULT;
-- drop default "version" (db=1)
ALTER TABLE "public"."mcp_oauth_clients" ALTER COLUMN "version" DROP DEFAULT;
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "public"."service_registry" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "public"."service_registry" ALTER COLUMN "updated_by" SET DEFAULT 'system';
-- set default "created_by" → 'system' (db=(none))
ALTER TABLE "system"."client_shield_registry" ALTER COLUMN "created_by" SET DEFAULT 'system';
-- set default "updated_by" → 'system' (db=(none))
ALTER TABLE "system"."client_shield_registry" ALTER COLUMN "updated_by" SET DEFAULT 'system';

-- WARN: DB-only index "auth_events_user_profile_uuid_event_at_idx" on public.auth_events — not dropped
-- WARN: DB-only index "auth_events_event_type_event_at_idx" on public.auth_events — not dropped
-- WARN: DB-only index "auth_events_attempted_username_event_at_idx" on public.auth_events — not dropped
-- WARN: DB-only index "config_entries_deleted_at_idx" on public.config_entries — not dropped
-- WARN: DB-only index "mfa_action_authorizations_expires_at_idx" on public.mfa_action_authorizations — not dropped
-- WARN: DB-only index "mfa_action_authorizations_user_profile_uuid_idx" on public.mfa_action_authorizations — not dropped
-- WARN: DB-only index "user_invitations_status_idx" on public.user_invitations — not dropped
-- WARN: DB-only index "user_invitations_user_profile_uuid_idx" on public.user_invitations — not dropped
-- WARN: DB-only index "user_mfa_factors_user_profile_uuid_idx" on public.user_mfa_factors — not dropped
-- WARN: DB-only index "user_passkeys_user_profile_uuid_idx" on public.user_passkeys — not dropped
-- WARN: DB-only index "service_registry_deleted_at_idx" on public.service_registry — not dropped
-- WARN: DB-only index "service_registry_code_uq_scaler" on public.service_registry — not dropped
-- WARN: DB-only index "service_registry_code_base_url_uq" on public.service_registry — not dropped
-- WARN: DB-only index "client_shield_registry_ua_prefix_uidx" on system.client_shield_registry — not dropped
