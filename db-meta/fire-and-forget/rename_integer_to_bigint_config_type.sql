-- Fire-and-forget: Rename config type 'integer' → 'bigint' and update init patch SHA256.
--
-- The SDK config type vocabulary was renamed:
--   - "integer" (backed by JS Number) → "bigint" (backed by JS BigInt)
--   - "number"  (backed by JS Number) → kept as "number" (for decimal/float values)
--   - "money"   added (numeric amount + currency metadata in type_config)
--
-- This is a breaking change. The init patch was modified to seed 'bigint'
-- instead of 'integer' for invitation_expiry_days and mfa_challenge_token_ttl_seconds.
--
-- This script:
--   1. Renames existing rows with type='integer' to type='bigint' (idempotent)
--   2. Updates the patch registry hash so db:migrate skips the init patch
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-08-28
-- Old sha256: 7e4655979f9b50354dfe275d0dac7ad7253b92a774f327ef46e62c4e969c9620
-- New sha256: 24587a8f3c1d6ceeb728898a632eb54016af69a2d88fa84013d0ba397c5d191c
-- Reason: Renamed config type 'integer' → 'bigint' in seed rows (invitation_expiry_days, mfa_challenge_token_ttl_seconds).

BEGIN;

-- 1. Rename existing config rows with type='integer' to type='bigint'.
--    The DB value column is TEXT — no data conversion needed, only the type label.
UPDATE "public"."auth_configurations"
SET "type" = 'bigint'
WHERE "type" = 'integer';

-- 2. Update the patch registry hash so db:migrate skips the init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = '24587a8f3c1d6ceeb728898a632eb54016af69a2d88fa84013d0ba397c5d191c'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '24587a8f3c1d6ceeb728898a632eb54016af69a2d88fa84013d0ba397c5d191c';

COMMIT;
