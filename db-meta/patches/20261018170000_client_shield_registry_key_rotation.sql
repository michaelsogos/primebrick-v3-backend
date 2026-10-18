-- client_shield_registry key rotation (B14): generation-based derivation +
-- previous-key grace window.
--
-- key_mode:    'static' (admin manual rows + legacy services — key set directly)
--              'derived' (service derives key = HMAC(derivation_secret,
--              ua_prefix:generation); BE only ever sees the sha256 hash)
-- key_generation: monotonic counter bumped by POST .../:uuid/rotate on
--              derived rows; services re-register with the new derived key.
-- previous_key_hash / previous_valid_until: the old hash stays valid during
--              the grace window (~5min) so in-flight callers are not cut off
--              mid-rotation.
-- key_rotated_at: last rotation timestamp (audit + cadence observability).

ALTER TABLE "system"."client_shield_registry"
  ADD COLUMN IF NOT EXISTS "key_mode" VARCHAR(10) NOT NULL DEFAULT 'static',
  ADD COLUMN IF NOT EXISTS "key_generation" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "previous_key_hash" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "previous_valid_until" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "key_rotated_at" TIMESTAMPTZ;

ALTER TABLE "system"."client_shield_registry"
  ADD CONSTRAINT "client_shield_registry_key_mode_ck"
  CHECK ("key_mode" IN ('static', 'derived'));
