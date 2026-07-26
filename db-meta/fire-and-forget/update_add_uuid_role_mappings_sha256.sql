-- Fire-and-forget: Update content_sha256 for 20260720172408_add_uuid_role_mappings patch
-- The patch file was modified after initial deployment.
BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'cb6f2149257501348ee1465a5a3a89247b9f610a848497178cd8ea293dc3dbdc'
WHERE patch_id = '20260720172408_add_uuid_role_mappings'
  AND content_sha256 <> 'cb6f2149257501348ee1465a5a3a89247b9f610a848497178cd8ea293dc3dbdc';
COMMIT;
