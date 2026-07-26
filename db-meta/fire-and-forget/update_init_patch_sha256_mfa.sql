-- Fire-and-forget: Update content_sha256 for init_database patch in the patch registry.
-- The init patch was modified to add user_mfa_factors + mfa_action_authorizations tables
-- and MFA config seeds. This updates the registry hash so db:migrate can proceed.
BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '6d233d83338b42234605daacfff0cc433e0f0ed19cd5ba0b0b116e92e7171cee'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '6d233d83338b42234605daacfff0cc433e0f0ed19cd5ba0b0b116e92e7171cee';
COMMIT;
