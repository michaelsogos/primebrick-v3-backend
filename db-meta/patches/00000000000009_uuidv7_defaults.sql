-- Primebrick: be phase-1 — uuidv7 column defaults
-- Generated section: auth_events.uuid + mfa_action_authorizations.uuid
-- (entity-declared @Unique @Column uuid)

ALTER TABLE "public"."auth_events"                 ADD COLUMN IF NOT EXISTS "uuid" uuid DEFAULT uuidv7() NOT NULL;
ALTER TABLE "public"."mfa_action_authorizations"   ADD COLUMN IF NOT EXISTS "uuid" uuid DEFAULT uuidv7() NOT NULL;
-- pb:begin-no-transaction
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "auth_events_uuid_uq" ON "public"."auth_events" ("uuid");
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "mfa_action_authorizations_uuid_uq" ON "public"."mfa_action_authorizations" ("uuid");
-- pb:end-no-transaction

-- Handwritten section: swap generation default gen_random_uuid() -> uuidv7()
-- on pre-existing uuid columns (default expressions are a differ blind spot).
-- Excludes engine-owned (primebrick_database_patches*) and flagged junk
-- (dal_test_*, *_archive, auth_configurations).

ALTER TABLE "public"."api_keys"              ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."config_entries"        ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."mcp_oauth_clients"     ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."organizations"         ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."role_mappings"         ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."service_registry"      ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."user_invitations"      ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."user_mfa_factors"      ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."user_passkeys"         ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."user_preferences"      ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."user_profiles"         ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "public"."translations"          ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "system"."client_shield_registry" ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "system"."translations"          ALTER COLUMN "uuid" SET DEFAULT uuidv7();
ALTER TABLE "custom"."translations"          ALTER COLUMN "uuid" SET DEFAULT uuidv7();
