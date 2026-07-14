-- Fire-and-forget: Update content_sha256 for patch 00000000000002 and remove HOME module.
--
-- Reason: The HOME reserved module was removed from the system. It had no content,
-- no nav links, and no microservice backend. The patch file 00000000000002 was
-- updated to no longer seed the HOME row. This script:
--   1. Deletes the HOME row from service_registry on existing databases
--   2. Updates the patch registry hash so db:migrate skips the already-applied patch
--
-- Date: 2026-07-14
-- Old SHA256: 069548a4254e2f9c590186e3cb68f4f70fa0f69d0c89511a209276927a088eaf
-- New SHA256: 918b698ea5ec7b4eb53cddf831927a7fad14adc2f16989937a44b06c9c256278

BEGIN;

-- Remove the HOME reserved module from existing databases.
DELETE FROM public.service_registry
  WHERE code = 'home' AND is_reserved = true;

-- Update the patch registry hash so db:migrate recognizes the modified patch.
UPDATE public.primebrick_database_patches
  SET content_sha256 = '918b698ea5ec7b4eb53cddf831927a7fad14adc2f16989937a44b06c9c256278'
  WHERE patch_id = '00000000000002_add_service_registry_is_reserved'
    AND content_sha256 <> '918b698ea5ec7b4eb53cddf831927a7fad14adc2f16989937a44b06c9c256278';

COMMIT;
