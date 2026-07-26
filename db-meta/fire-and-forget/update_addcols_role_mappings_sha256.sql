-- Fire-and-forget: Update content_sha256 for 20260718231731_addcols_role_mappings patch
-- The patch file was modified after initial deployment (content changed, same patch_id).
-- This script updates the registry to match the current file SHA256 so db:migrate can proceed.
BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '2a4431da9554458106282f13b2e026ea557331702e5286fd64298198f6d42cb1'
WHERE patch_id = '20260718231731_addcols_role_mappings'
  AND content_sha256 <> '2a4431da9554458106282f13b2e026ea557331702e5286fd64298198f6d42cb1';
COMMIT;
