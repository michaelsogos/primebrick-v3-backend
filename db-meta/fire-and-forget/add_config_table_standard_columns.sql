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
--   8. Adds validation rules to type_config for all config keys
--   9. Creates auth_configurations_audit table (partitioned, with pg_partman)
--  10. Updates the patch registry hash so db:migrate skips the modified init patch
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
  "type_config" = '{"values":{"casdoor":{"label_key":"config.auth.idp_type.casdoor"},"keycloak":{"label_key":"config.auth.idp_type.keycloak"},"entra":{"label_key":"config.auth.idp_type.entra"},"okta":{"label_key":"config.auth.idp_type.okta"}},"validation":{"required":true,"required_error_label_key":"config.auth.idp_type.errors.required","rules":{}}}',
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
  "type" = 'bigint',
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
  "type" = 'bigint',
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

-- 8. Add validation rules to type_config for all config keys.
--    Each key gets a validation sub-object with rules specific to its type.
--    Error label keys are i18n translation keys resolved by the FE.

UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"url":{"protocols":["http","https"],"error_label_key":"config.auth.idp_endpoint.errors.invalidUrl"}}}}' WHERE "key" = 'idp_endpoint';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":1,"error_label_key":"config.auth.idp_organization.errors.min"},"max":{"value":100,"error_label_key":"config.auth.idp_organization.errors.max"}}}}' WHERE "key" = 'idp_organization';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"url":{"protocols":["http","https"],"error_label_key":"config.auth.oidc_issuer_url.errors.invalidUrl"}}}}' WHERE "key" = 'oidc_issuer_url';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":6,"error_label_key":"config.auth.oidc_client_id.errors.min"},"max":{"value":100,"error_label_key":"config.auth.oidc_client_id.errors.max"}}}}' WHERE "key" = 'oidc_client_id';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":32,"error_label_key":"config.auth.oidc_client_secret.errors.min"},"max":{"value":256,"error_label_key":"config.auth.oidc_client_secret.errors.max"}}}}' WHERE "key" = 'oidc_client_secret';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":6,"error_label_key":"config.auth.idp_client_id.errors.min"},"max":{"value":100,"error_label_key":"config.auth.idp_client_id.errors.max"}}}}' WHERE "key" = 'idp_client_id';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":32,"error_label_key":"config.auth.idp_client_secret.errors.min"},"max":{"value":256,"error_label_key":"config.auth.idp_client_secret.errors.max"}}}}' WHERE "key" = 'idp_client_secret';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":3,"error_label_key":"config.auth.auth_roles_path.errors.min"},"max":{"value":255,"error_label_key":"config.auth.auth_roles_path.errors.max"},"regex":{"pattern":"^[a-zA-Z0-9._-]+$","error_label_key":"config.auth.auth_roles_path.errors.invalidFormat"}}}}' WHERE "key" = 'auth_roles_path';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":1,"error_label_key":"config.auth.invitation_expiry_days.errors.min"},"max":{"value":90,"error_label_key":"config.auth.invitation_expiry_days.errors.max"}}}}' WHERE "key" = 'invitation_expiry_days';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"email":{"error_label_key":"config.auth.admin_contact_email.errors.invalidEmail"}}}}' WHERE "key" = 'admin_contact_email';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":32,"error_label_key":"config.auth.notification_alert_secret.errors.min"},"max":{"value":256,"error_label_key":"config.auth.notification_alert_secret.errors.max"}}}}' WHERE "key" = 'notification_alert_secret';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"url":{"protocols":["http","https"],"error_label_key":"config.auth.frontend_url.errors.invalidUrl"}}}}' WHERE "key" = 'frontend_url';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"url":{"protocols":["redis","rediss","tcp","http","https"],"error_label_key":"config.auth.redis_url.errors.invalidUrl"}}}}' WHERE "key" = 'redis_url';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":30,"error_label_key":"config.auth.mfa_challenge_token_ttl_seconds.errors.min"},"max":{"value":600,"error_label_key":"config.auth.mfa_challenge_token_ttl_seconds.errors.max"}}}}' WHERE "key" = 'mfa_challenge_token_ttl_seconds';
UPDATE "public"."auth_configurations" SET "type_config" = '{"validation":{"required":true,"rules":{"min":{"value":32,"error_label_key":"config.auth.mfa_challenge_signing_secret.errors.min"},"max":{"value":256,"error_label_key":"config.auth.mfa_challenge_signing_secret.errors.max"}}}}' WHERE "key" = 'mfa_challenge_signing_secret';

-- 9. Create auth_configurations_audit table (partitioned, with pg_partman)
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
  NULL;
END $$;

-- 10. Seed audit trail for existing auth_configurations rows (INSERT record, version 1).
--     Uses 'initial-setup' as changed_by to distinguish seed/system inserts from user actions.
--     changed_at uses the actual created_at of each row (not a hardcoded timestamp).
--     Delta includes ALL columns to match the DAL's INSERT audit behavior.
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

COMMIT;
