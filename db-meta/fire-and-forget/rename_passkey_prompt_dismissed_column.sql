-- Fire-and-forget: Rename passkey_prompt_dismissed column to auth_method_enforcer_dismissed
-- and update the init patch registry hash.
--
-- The init patch was modified to rename the column:
--   passkey_prompt_dismissed -> auth_method_enforcer_dismissed
--
-- This script:
--   1. Renames the column on existing databases (idempotent — checks information_schema)
--   2. Updates the patch registry hash so db:migrate skips the init patch
--
-- Run this ONCE on the existing live database.
--
-- Date: 2026-07-26
-- Old sha256: 6d233d83338b42234605daacfff0cc433e0f0ed19cd5ba0b0b116e92e7171cee
-- New sha256: 3292864a1f8abe838428976664a3848317eda36a04491accd001ef1f69e19cd7
-- Reason: Renamed user_profiles.passkey_prompt_dismissed -> auth_method_enforcer_dismissed
--         (the dialog is now the unified auth method enforcer, not passkey-specific).
--         Also added ™/® trademark symbols to Casdoor™, Windows Hello™,
--         Google Authenticator™, Authy™, Entra™, Keycloak™ in SQL comments
--         and config seed descriptions (user-facing via admin UI).
--         Merged with develop: passkey rich metadata comments + redis_url +
--         MFA tables (user_mfa_factors, mfa_action_authorizations) + MFA config seeds.

BEGIN;

-- 1. Rename the column on existing databases (idempotent).
--    Only run if the OLD column exists and the NEW column does not.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'passkey_prompt_dismissed'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'auth_method_enforcer_dismissed'
  ) THEN
    ALTER TABLE "public"."user_profiles"
      RENAME COLUMN "passkey_prompt_dismissed" TO "auth_method_enforcer_dismissed";
  END IF;
END $$;

-- 2. Update the comment on the renamed column (idempotent).
COMMENT ON COLUMN public.user_profiles.auth_method_enforcer_dismissed IS 'Whether the user dismissed the auth method enforcer dialog (passkey/MFA prompt)';

-- 3. Update the patch registry hash so db:migrate skips the init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = '3292864a1f8abe838428976664a3848317eda36a04491accd001ef1f69e19cd7'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '3292864a1f8abe838428976664a3848317eda36a04491accd001ef1f69e19cd7';

COMMIT;
