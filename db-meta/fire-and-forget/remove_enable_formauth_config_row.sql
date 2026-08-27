-- Fire-and-forget: Remove enable_formauth config row + update init patch SHA256.
--
-- The enable_formauth configuration key has been removed from the system.
-- Form (username/password) authentication is an invariant — always available,
-- not a toggleable setting. This script:
--   1. Hard-deletes the enable_formauth row from auth_configurations.
--   2. Updates the content_sha256 of the init patch in the registry, because
--      the init patch seed was modified (the enable_formauth row was removed
--      from the INSERT block).
--
-- Date: 2026-08-26
-- Old init patch sha256: 3292864a1f8abe838428976664a3848317eda36a04491accd001ef1f69e19cd7
-- New init patch sha256: 3d0ed1a8bae146fc65a7891b4e70fa49bded7f428deaa5e32444962aad1d4ca2
BEGIN;

-- 1. Hard-delete the enable_formauth config row (if it exists).
DELETE FROM public.auth_configurations
WHERE "key" = 'enable_formauth';

-- 2. Update the init patch SHA256 in the registry so db:migrate can proceed.
UPDATE public.primebrick_database_patches
SET content_sha256 = '3d0ed1a8bae146fc65a7891b4e70fa49bded7f428deaa5e32444962aad1d4ca2'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '3d0ed1a8bae146fc65a7891b4e70fa49bded7f428deaa5e32444962aad1d4ca2';

COMMIT;
