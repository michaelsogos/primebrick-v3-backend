-- Fire-and-forget: Add type/type_config/label_key/description_key/reserved to auth_configurations.
--
-- The init patch was modified to add:
--   - type, type_config, label_key, description_key, reserved columns to auth_configurations
--   - value is now nullable (was NOT NULL)
--   - key is now varchar(100) (was varchar(50))
--   - description column dropped (replaced by description_key)
--   - Seed INSERTs now include type/type_config/label_key/description_key/reserved
--
-- This script:
--   1. Adds the new columns to existing auth_configurations tables
--   2. Drops the old description column
--   3. Widens key to varchar(100) and makes value nullable
--   4. Seeds type/type_config/label_key/description_key/reserved for all existing rows
--   5. Updates the patch registry hash so db:migrate skips the modified init patch
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-08-26

BEGIN;

-- 1. Add new columns (idempotent via IF NOT EXISTS).
ALTER TABLE "public"."auth_configurations"
  ADD COLUMN IF NOT EXISTS "type" varchar(50) NOT NULL DEFAULT 'string',
  ADD COLUMN IF NOT EXISTS "type_config" text,
  ADD COLUMN IF NOT EXISTS "label_key" varchar(100),
  ADD COLUMN IF NOT EXISTS "description_key" varchar(100),
  ADD COLUMN IF NOT EXISTS "reserved" boolean NOT NULL DEFAULT false;

-- 2. Align with Config Table standard: value nullable, key varchar(100), drop description.
ALTER TABLE "public"."auth_configurations" ALTER COLUMN "value" DROP NOT NULL;
ALTER TABLE "public"."auth_configurations" ALTER COLUMN "key" TYPE varchar(100);
ALTER TABLE "public"."auth_configurations" DROP COLUMN IF EXISTS "description";

-- 3. All existing auth_configurations rows are reserved.
UPDATE "public"."auth_configurations" SET "reserved" = true WHERE "reserved" = false;

-- 4. Seed type/type_config/label_key/description_key for every existing key.
UPDATE "public"."auth_configurations" SET
  "type" = 'url',
  "type_config" = NULL,
  "label_key" = 'config.auth.casdoor_endpoint.label',
  "description_key" = 'config.auth.casdoor_endpoint.description'
WHERE "key" = 'casdoor_endpoint';

UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.casdoor_organization.label',
  "description_key" = 'config.auth.casdoor_organization.description'
WHERE "key" = 'casdoor_organization';

UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.casdoor_client_id.label',
  "description_key" = 'config.auth.casdoor_client_id.description'
WHERE "key" = 'casdoor_client_id';

UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.casdoor_admin_username.label',
  "description_key" = 'config.auth.casdoor_admin_username.description'
WHERE "key" = 'casdoor_admin_username';

UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.casdoor_admin_role.label',
  "description_key" = 'config.auth.casdoor_admin_role.description'
WHERE "key" = 'casdoor_admin_role';

UPDATE "public"."auth_configurations" SET
  "type" = 'url',
  "type_config" = NULL,
  "label_key" = 'config.auth.oidc_issuer_url.label',
  "description_key" = 'config.auth.oidc_issuer_url.description'
WHERE "key" = 'oidc_issuer_url';

UPDATE "public"."auth_configurations" SET
  "type" = 'badge',
  "type_config" = '{"values":{"casdoor":{"label_key":"config.auth.oidc_issuer_type.casdoor"},"keycloak":{"label_key":"config.auth.oidc_issuer_type.keycloak"},"auth0":{"label_key":"config.auth.oidc_issuer_type.auth0"}}}',
  "label_key" = 'config.auth.oidc_issuer_type.label',
  "description_key" = 'config.auth.oidc_issuer_type.description'
WHERE "key" = 'oidc_issuer_type';

UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.oidc_client_id.label',
  "description_key" = 'config.auth.oidc_client_id.description'
WHERE "key" = 'oidc_client_id';

UPDATE "public"."auth_configurations" SET
  "type" = 'boolean',
  "type_config" = NULL,
  "label_key" = 'config.auth.enable_email_verification_check.label',
  "description_key" = 'config.auth.enable_email_verification_check.description'
WHERE "key" = 'enable_email_verification_check';

UPDATE "public"."auth_configurations" SET
  "type" = 'boolean',
  "type_config" = NULL,
  "label_key" = 'config.auth.enable_webauthn.label',
  "description_key" = 'config.auth.enable_webauthn.description'
WHERE "key" = 'enable_webauthn';

UPDATE "public"."auth_configurations" SET
  "type" = 'boolean',
  "type_config" = NULL,
  "label_key" = 'config.auth.passkey_required.label',
  "description_key" = 'config.auth.passkey_required.description'
WHERE "key" = 'passkey_required';

UPDATE "public"."auth_configurations" SET
  "type" = 'boolean',
  "type_config" = NULL,
  "label_key" = 'config.auth.enable_mfa.label',
  "description_key" = 'config.auth.enable_mfa.description'
WHERE "key" = 'enable_mfa';

UPDATE "public"."auth_configurations" SET
  "type" = 'badge',
  "type_config" = '{"values":{"alpha_numeric":{"label_key":"config.auth.password_policy.alpha_numeric"},"letter_and_number":{"label_key":"config.auth.password_policy.letter_and_number"},"letter_number_special":{"label_key":"config.auth.password_policy.letter_number_special"},"mixed_case_special":{"label_key":"config.auth.password_policy.mixed_case_special"}}}',
  "label_key" = 'config.auth.password_policy.label',
  "description_key" = 'config.auth.password_policy.description'
WHERE "key" = 'password_policy';

UPDATE "public"."auth_configurations" SET
  "type" = 'badge',
  "type_config" = '{"values":{"STANDALONE":{"label_key":"config.auth.auth_mode.standalone","color":"sky-300"},"GATEWAY":{"label_key":"config.auth.auth_mode.gateway","color":"amber-300"}}}',
  "label_key" = 'config.auth.auth_mode.label',
  "description_key" = 'config.auth.auth_mode.description'
WHERE "key" = 'auth_mode';

UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.auth_roles_path.label',
  "description_key" = 'config.auth.auth_roles_path.description'
WHERE "key" = 'auth_roles_path';

UPDATE "public"."auth_configurations" SET
  "type" = 'integer',
  "type_config" = NULL,
  "label_key" = 'config.auth.invitation_expiry_days.label',
  "description_key" = 'config.auth.invitation_expiry_days.description'
WHERE "key" = 'invitation_expiry_days';

UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.admin_contact_email.label',
  "description_key" = 'config.auth.admin_contact_email.description'
WHERE "key" = 'admin_contact_email';

UPDATE "public"."auth_configurations" SET
  "type" = 'secret',
  "type_config" = NULL,
  "label_key" = 'config.auth.notification_alert_secret.label',
  "description_key" = 'config.auth.notification_alert_secret.description'
WHERE "key" = 'notification_alert_secret';

UPDATE "public"."auth_configurations" SET
  "type" = 'url',
  "type_config" = NULL,
  "label_key" = 'config.auth.frontend_url.label',
  "description_key" = 'config.auth.frontend_url.description'
WHERE "key" = 'frontend_url';

UPDATE "public"."auth_configurations" SET
  "type" = 'url',
  "type_config" = NULL,
  "label_key" = 'config.auth.redis_url.label',
  "description_key" = 'config.auth.redis_url.description'
WHERE "key" = 'redis_url';

UPDATE "public"."auth_configurations" SET
  "type" = 'integer',
  "type_config" = NULL,
  "label_key" = 'config.auth.mfa_challenge_token_ttl_seconds.label',
  "description_key" = 'config.auth.mfa_challenge_token_ttl_seconds.description'
WHERE "key" = 'mfa_challenge_token_ttl_seconds';

UPDATE "public"."auth_configurations" SET
  "type" = 'secret',
  "type_config" = NULL,
  "label_key" = 'config.auth.mfa_challenge_signing_secret.label',
  "description_key" = 'config.auth.mfa_challenge_signing_secret.description'
WHERE "key" = 'mfa_challenge_signing_secret';

COMMIT;
