-- Fire-and-forget: Seed redis_url in auth_configurations and update init patch SHA256.
--
-- The init patch was modified to add:
--   - redis_url seed row in auth_configurations
--
-- This script:
--   1. Inserts the redis_url config key on existing databases (idempotent)
--   2. Updates the patch registry hash so db:migrate skips the modified init patch
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-07-22
-- Old sha256: 2b9f5f7e2641d5fcbaa69795cbb23d80eb00ce69a80123edbd0f71cbb2829a64
-- New sha256: 26308bd22aed433c49a8498de0c10c1252124675c76fc71cfeb126631b8a165c
-- Reason: Added redis_url + enable_mfa seed rows to auth_configurations.

BEGIN;

-- 1. Insert redis_url + enable_mfa config keys (idempotent via ON CONFLICT).
INSERT INTO "public"."auth_configurations" ("key", "value", "description", "created_by") VALUES
('redis_url', 'redis://redis:6379', 'Redis cache URL. Empty = cache disabled (best-effort, system valid without it). Default: dockerized Redis (Docker network name). Change to external Redis URL if needed.', 'system'),
('enable_mfa', 'false', 'Abilita MFA / 2FA (login MFA + step-up MFA). Quando false, il login non brancha su MFA e il middleware step-up passa through (true/false).', 'system')
ON CONFLICT ("key") DO NOTHING;

-- 2. Update the patch registry hash so db:migrate skips the modified init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = '26308bd22aed433c49a8498de0c10c1252124675c76fc71cfeb126631b8a165c'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '26308bd22aed433c49a8498de0c10c1252124675c76fc71cfeb126631b8a165c';

COMMIT;
