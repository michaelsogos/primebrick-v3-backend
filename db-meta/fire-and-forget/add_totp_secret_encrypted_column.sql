-- Add totp_secret_encrypted column to user_mfa_factors table
-- This column stores the TOTP secret encrypted with mfa_challenge_signing_secret
-- so the BE can verify TOTP codes locally without a Casdoor round-trip.

ALTER TABLE "public"."user_mfa_factors"
  ADD COLUMN IF NOT EXISTS "totp_secret_encrypted" text;

-- Update the patch registry SHA256 for the init patch (will be done by update_init_patch_sha256_mfa_v2.sql)
