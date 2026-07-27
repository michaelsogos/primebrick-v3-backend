-- Fire-and-forget: Update content_sha256 for init_database patch in the patch registry.
-- The init patch was modified to add:
--   1. passkey_prompt_dismissed + onboarding_completed columns on user_profiles
--   2. user_invitations table (with OTP columns)
--   3. user_passkeys table
--   4. invitation_expiry_days, admin_contact_email, notification_alert_secret seed rows
--
-- This script also:
--   - Adds the new columns to existing user_profiles tables
--   - Creates the new tables on existing databases
--   - Inserts the new config keys
--   - Updates the patch registry hash
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-07-17
-- Old sha256: 0025ae3f74fceacd134823a914dbfc098161f7c21aadd344fdae4f404b1aa1cd
-- New sha256: b2dc1ded1d4c80dd281d6845a28941ab69cce6377eb8ff2c60997298f792e08c
-- Reason: Added user_invitations + user_passkeys tables, user_profiles columns, auth config seeds (invitation_expiry_days, admin_contact_email, notification_alert_secret, frontend_url).

BEGIN;

-- 1. Add new columns to user_profiles (idempotent via IF NOT EXISTS).
ALTER TABLE "public"."user_profiles"
  ADD COLUMN IF NOT EXISTS "passkey_prompt_dismissed" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean NOT NULL DEFAULT false;

-- 2. Create user_invitations table.
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

-- 3. Create user_passkeys table.
CREATE TABLE IF NOT EXISTS "public"."user_passkeys" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_profile_id" bigint NOT NULL,
  "credential_id" text NOT NULL,
  "aaguid" text,
  "transports" jsonb,
  "label" varchar(100),
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

-- 4. Insert new auth config keys (idempotent via ON CONFLICT).
INSERT INTO "public"."auth_configurations" ("key", "value", "description", "created_by") VALUES
('invitation_expiry_days', '7', 'Invitation token expiry in days', 'system'),
('admin_contact_email', '', 'Admin email for unauthorized action alerts and mailto: links. If empty, BE falls back to first user with is_admin=true.', 'system'),
('notification_alert_secret', '', 'HMAC secret for unauthorized-action alert links in emails. Auto-generated (32 random bytes hex) on first use if empty.', 'system'),
('frontend_url', 'http://localhost:5173', 'Frontend application base URL (used for email links, e.g. welcome page). In production, set to the public HTTPS URL.', 'system'),
('passkey_required', 'true', 'If true, passkey enrollment is mandatory: the prompt cannot be dismissed and the "do not show again" checkbox is hidden (true/false).', 'system')
ON CONFLICT ("key") DO NOTHING;

-- 5. Update the patch registry hash so db:migrate skips the init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = '7e4655979f9b50354dfe275d0dac7ad7253b92a774f327ef46e62c4e969c9620'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '7e4655979f9b50354dfe275d0dac7ad7253b92a774f327ef46e62c4e969c9620';

COMMIT;
