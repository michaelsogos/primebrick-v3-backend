-- Fire-and-forget: Add rich metadata columns to user_passkeys on existing
-- live databases that already ran the init patch before this feature shipped.
--
-- The init patch (00000000000000_init_database.sql) was modified in place to
-- add these columns directly to the CREATE TABLE block for fresh installs.
-- This script catches up existing DBs and updates the init patch SHA256 in
-- the registry so db:migrate skips the init patch cleanly.
--
-- Idempotent via IF NOT EXISTS and a guarded UPDATE. Safe to re-run.
--
-- Date: 2026-07-25
-- Old sha256: 7e4655979f9b50354dfe275d0dac7ad7253b92a774f327ef46e62c4e969c9620
-- New sha256: 7294203411cc724b41879eabe6ffb5498fd743fca7da47c5680d74b507fc3cb4
-- Reason: Added last_used_at, authenticator_attachment, user_agent, os, device_model
--         columns to user_passkeys for rich passkey display in the profile page.

BEGIN;

-- 1. Add new columns to user_passkeys (idempotent via IF NOT EXISTS).
ALTER TABLE "public"."user_passkeys"
  ADD COLUMN IF NOT EXISTS "last_used_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "authenticator_attachment" text,
  ADD COLUMN IF NOT EXISTS "user_agent" text,
  ADD COLUMN IF NOT EXISTS "os" text,
  ADD COLUMN IF NOT EXISTS "device_model" text;

COMMENT ON COLUMN public.user_passkeys.last_used_at IS 'Last time this credential was used to sign in (null until first signin after this feature ships)';
COMMENT ON COLUMN public.user_passkeys.authenticator_attachment IS 'platform | cross-platform (WebAuthn AuthenticatorAttachment)';
COMMENT ON COLUMN public.user_passkeys.user_agent IS 'navigator.userAgent captured at enrollment (truncated to 512 chars)';
COMMENT ON COLUMN public.user_passkeys.os IS 'OS inferred from UA at enrollment (e.g. Windows, macOS, iOS, Android, Linux)';
COMMENT ON COLUMN public.user_passkeys.device_model IS 'Device model inferred from UA at enrollment (e.g. "Windows PC", "Mac", "iPhone", "Pixel")';

-- 2. Update the patch registry hash so db:migrate skips the init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = '7294203411cc724b41879eabe6ffb5498fd743fca7da47c5680d74b507fc3cb4'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '7294203411cc724b41879eabe6ffb5498fd743fca7da47c5680d74b507fc3cb4';

COMMIT;
