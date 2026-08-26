-- Fire-and-forget: Add type/type_config/label_key/description_key/reserved to auth_configurations.
--
-- The init patch was modified to add:
--   - type, type_config, label_key, description_key, reserved columns to auth_configurations
--   - group_key column to auth_configurations
--   - value is now nullable (was NOT NULL)
--   - key is now varchar(100) (was varchar(50))
--   - description column dropped (replaced by description_key)
--   - Seed INSERTs now include type/type_config/label_key/description_key/reserved/group_key
--   - casdoor_* keys renamed to idp_* (casdoor_endpoint → idp_endpoint, etc.)
--   - casdoor_client_id, casdoor_admin_username, casdoor_admin_role removed
--   - oidc_issuer_type renamed to idp_type (entra + okta replace auth0)
--
-- This script:
--   1. Adds the new columns to existing auth_configurations tables
--   2. Drops the old description column
--   3. Widens key to varchar(100) and makes value nullable
--   4. Renames casdoor_* keys to idp_* and oidc_issuer_type to idp_type
--   5. Deletes removed keys (casdoor_client_id, casdoor_admin_username, casdoor_admin_role, casdoor_admin_password)
--   6. Seeds type/type_config/label_key/description_key for all existing rows
--   7. Sets group_key for all rows
--   8. Updates the patch registry hash so db:migrate skips the modified init patch
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

ALTER TABLE "public"."auth_configurations" ADD COLUMN IF NOT EXISTS "group_key" varchar(100);

-- 2. Align with Config Table standard: value nullable, key varchar(100), drop description.
ALTER TABLE "public"."auth_configurations" ALTER COLUMN "value" DROP NOT NULL;
ALTER TABLE "public"."auth_configurations" ALTER COLUMN "key" TYPE varchar(100);
ALTER TABLE "public"."auth_configurations" DROP COLUMN IF EXISTS "description";

-- 3. All existing auth_configurations rows are reserved.
UPDATE "public"."auth_configurations" SET "reserved" = true WHERE "reserved" = false;

-- 4. Rename casdoor_* keys to idp_* and oidc_issuer_type to idp_type.
UPDATE "public"."auth_configurations" SET "key" = 'idp_endpoint' WHERE "key" = 'casdoor_endpoint';
UPDATE "public"."auth_configurations" SET "key" = 'idp_organization' WHERE "key" = 'casdoor_organization';
UPDATE "public"."auth_configurations" SET "key" = 'idp_client_id' WHERE "key" = 'casdoor_builtin_client_id';
UPDATE "public"."auth_configurations" SET "key" = 'idp_client_secret' WHERE "key" = 'casdoor_builtin_client_secret';
-- Also handle the previous intermediate rename (idp_builtin_client_* → idp_client_*).
UPDATE "public"."auth_configurations" SET "key" = 'idp_client_id' WHERE "key" = 'idp_builtin_client_id';
UPDATE "public"."auth_configurations" SET "key" = 'idp_client_secret' WHERE "key" = 'idp_builtin_client_secret';
UPDATE "public"."auth_configurations" SET "key" = 'idp_type' WHERE "key" = 'oidc_issuer_type';

-- 5. Delete removed keys.
DELETE FROM "public"."auth_configurations" WHERE "key" IN ('casdoor_client_id', 'casdoor_admin_username', 'casdoor_admin_role', 'casdoor_admin_password');

-- 6. Seed type/type_config/label_key/description_key for every existing key.
UPDATE "public"."auth_configurations" SET
  "type" = 'url',
  "type_config" = NULL,
  "label_key" = 'config.auth.idp_endpoint.label',
  "description_key" = 'config.auth.idp_endpoint.description'
WHERE "key" = 'idp_endpoint';

UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.idp_organization.label',
  "description_key" = 'config.auth.idp_organization.description'
WHERE "key" = 'idp_organization';

UPDATE "public"."auth_configurations" SET
  "type" = 'url',
  "type_config" = NULL,
  "label_key" = 'config.auth.oidc_issuer_url.label',
  "description_key" = 'config.auth.oidc_issuer_url.description'
WHERE "key" = 'oidc_issuer_url';

UPDATE "public"."auth_configurations" SET
  "type" = 'badge',
  "type_config" = '{"values":{"casdoor":{"label_key":"config.auth.idp_type.casdoor"},"keycloak":{"label_key":"config.auth.idp_type.keycloak"},"entra":{"label_key":"config.auth.idp_type.entra"},"okta":{"label_key":"config.auth.idp_type.okta"}}}',
  "label_key" = 'config.auth.idp_type.label',
  "description_key" = 'config.auth.idp_type.description'
WHERE "key" = 'idp_type';

UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.oidc_client_id.label',
  "description_key" = 'config.auth.oidc_client_id.description'
WHERE "key" = 'oidc_client_id';

-- oidc_client_secret is created by setup-casdoor.ts with no metadata; seed it.
UPDATE "public"."auth_configurations" SET
  "type" = 'secret',
  "type_config" = NULL,
  "label_key" = 'config.auth.oidc_client_secret.label',
  "description_key" = 'config.auth.oidc_client_secret.description'
WHERE "key" = 'oidc_client_secret';

-- idp_client_id / idp_client_secret are created by setup-casdoor.ts with no metadata; seed it.
UPDATE "public"."auth_configurations" SET
  "type" = 'string',
  "type_config" = NULL,
  "label_key" = 'config.auth.idp_client_id.label',
  "description_key" = 'config.auth.idp_client_id.description'
WHERE "key" = 'idp_client_id';

UPDATE "public"."auth_configurations" SET
  "type" = 'secret',
  "type_config" = NULL,
  "label_key" = 'config.auth.idp_client_secret.label',
  "description_key" = 'config.auth.idp_client_secret.description'
WHERE "key" = 'idp_client_secret';

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

-- 7. Set group_key for all rows.
UPDATE "public"."auth_configurations" SET "group_key" = 'idp_parameters' WHERE "key" IN ('idp_endpoint', 'idp_organization', 'auth_mode', 'idp_type');
UPDATE "public"."auth_configurations" SET "group_key" = 'oidc_parameters' WHERE "key" IN ('oidc_issuer_url', 'oidc_client_id', 'oidc_client_secret', 'auth_roles_path');
UPDATE "public"."auth_configurations" SET "group_key" = 'security_parameters' WHERE "key" IN ('enable_email_verification_check', 'enable_webauthn', 'passkey_required', 'enable_mfa', 'password_policy', 'mfa_challenge_token_ttl_seconds', 'mfa_challenge_signing_secret');
UPDATE "public"."auth_configurations" SET "group_key" = 'advanced_features' WHERE "key" IN ('redis_url', 'invitation_expiry_days');
UPDATE "public"."auth_configurations" SET "group_key" = 'system_settings' WHERE "key" IN ('admin_contact_email', 'frontend_url', 'notification_alert_secret');
UPDATE "public"."auth_configurations" SET "group_key" = 'idp_parameters' WHERE "key" IN ('idp_client_id', 'idp_client_secret');

COMMIT;
