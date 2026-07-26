-- Fire-and-forget: Update content_sha256 for init_database patch in the patch registry.
-- The init patch was modified to add user_mfa_factors + mfa_action_authorizations tables
-- and MFA config seeds, plus passkey rich metadata comments, redis_url config seed,
-- and trademark symbols. This updates the registry hash so db:migrate can proceed.
-- Date: 2026-07-26
-- New sha256: 3292864a1f8abe838428976664a3848317eda36a04491accd001ef1f69e19cd7
BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '3292864a1f8abe838428976664a3848317eda36a04491accd001ef1f69e19cd7'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '3292864a1f8abe838428976664a3848317eda36a04491accd001ef1f69e19cd7';
COMMIT;
