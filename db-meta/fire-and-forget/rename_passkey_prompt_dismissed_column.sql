-- Fire-and-forget: Rename passkey_prompt_dismissed → auth_method_enforcer_dismissed
-- and update the init patch hash in the registry.
--
-- The init patch was modified to rename:
--   user_profiles.passkey_prompt_dismissed → user_profiles.auth_method_enforcer_dismissed
--
-- This script:
--   1. Renames the column on existing databases
--   2. Updates the patch registry hash so db:migrate skips the init patch
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-07-22
-- Old sha256: 7e4655979f9b50354dfe275d0dac7ad7253b92a774f327ef46e62c4e969c9620
-- New sha256: ea4f578a05242c24719f042e502ae61a0f0b377df37d9713b93cf77209cd545a
-- Reason: Renamed passkey_prompt_dismissed → auth_method_enforcer_dismissed (unified dismiss for passkey + MFA prompt).

BEGIN;

-- 1. Rename the column (idempotent — only if old column exists, new doesn't).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'passkey_prompt_dismissed'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'auth_method_enforcer_dismissed'
  ) THEN
    ALTER TABLE "public"."user_profiles"
      RENAME COLUMN "passkey_prompt_dismissed" TO "auth_method_enforcer_dismissed";
    COMMENT ON COLUMN "public"."user_profiles"."auth_method_enforcer_dismissed"
      IS 'Whether the user dismissed the auth method enforcer prompt (passkey/MFA)';
  END IF;
END $$;

-- 2. Update the patch registry hash so db:migrate skips the init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = 'ea4f578a05242c24719f042e502ae61a0f0b377df37d9713b93cf77209cd545a'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> 'ea4f578a05242c24719f042e502ae61a0f0b377df37d9713b93cf77209cd545a';

COMMIT;
