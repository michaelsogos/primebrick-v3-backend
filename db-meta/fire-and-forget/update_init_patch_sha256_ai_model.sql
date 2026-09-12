-- Fire-and-forget: Update init patch SHA256 after adding the `ai_assistant_model` seed row.
--
-- The init patch was modified to add the `ai_assistant_model` config row to the
-- seed block. This script updates the patch registry hash so db:migrate skips
-- the init patch on existing databases.
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-09-03
-- Old sha256: 9bb38b0575d23883aa33b5a5e5613e0868831eadadee5c174e393332d9427e52
-- New sha256: fabb299afb19a93748bd7de3bc1310a0954208f08f214ab14ba522bc24766c04
-- Reason: Added `ai_assistant_model` seed row (type: single_select, values_source: ai_models, reserved: true).

BEGIN;

UPDATE public.primebrick_database_patches
SET content_sha256 = 'fabb299afb19a93748bd7de3bc1310a0954208f08f214ab14ba522bc24766c04'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> 'fabb299afb19a93748bd7de3bc1310a0954208f08f214ab14ba522bc24766c04';

COMMIT;
