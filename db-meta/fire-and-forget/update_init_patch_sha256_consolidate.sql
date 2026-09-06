-- Fire-and-forget: Update content_sha256 for init_database patch after config error key consolidation.
-- The init patch was modified to replace config.auth.* with system.settings.config.auth.*
-- and consolidate error keys to generic app.common.validation.* keys.
--
-- Run this ONCE on the existing live database after running consolidate_config_error_keys.sql.
-- Idempotent.
--
-- Date: 2026-09-06
-- Old sha256: 02923856413030a876337ec176569c9feb1bbff6f16cd1634fc47046447fcecd
-- New sha256: 9bb38b0575d23883aa33b5a5e5613e0868831eadadee5c174e393332d9427e52
-- Reason: Consolidated config error keys — replaced config.auth.* prefix with
--         system.settings.config.auth.* and generic app.common.validation.* keys.

BEGIN;

UPDATE public.primebrick_database_patches
SET content_sha256 = '9bb38b0575d23883aa33b5a5e5613e0868831eadadee5c174e393332d9427e52'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '9bb38b0575d23883aa33b5a5e5613e0868831eadadee5c174e393332d9427e52';

COMMIT;
