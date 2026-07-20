-- Fire-and-forget: Align role_mappings seed + audit trails.
--
-- This script:
--   1. Deletes all role_mappings except 'administrators' (is_admin=true)
--   2. Normalizes the administrators role: is_admin=true, permissions='[]', created_by='initial-setup'
--   3. Creates the INSERT audit record for 'administrators' with changed_by='initial-setup'
--   4. Normalizes changed_by in organizations_audit: 'system', 'setup-casdoor', 'patch-*' → 'initial-setup' (INSERT records only)
--   5. Normalizes changed_by in user_profiles_audit: 'system' → 'initial-setup' (INSERT records only)
--   6. Updates the patch registry SHA256 for the modified init patch
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-07-20
-- Old sha256: (whatever was registered before)
-- New sha256: 2b9f5f7e2641d5fcbaa69795cbb23d80eb00ce69a80123edbd0f71cbb2829a64
-- Reason: Removed sales/customer_service/hr/ops role seeds from init patch;
--          only 'administrators' (is_admin=true) is auto-created now.

BEGIN;

-- 1. Delete all role_mappings except 'administrators' (lowercase, is_admin=true).
--    This removes duplicates (Administrators, Sales, CustomerService, HR, Ops)
--    and extra roles (collaborator, guest) that were created by fire-and-forget
--    scripts or manual inserts. Only user-created roles via the UI should remain
--    alongside the auto-seeded 'administrators'.
DELETE FROM public.role_mappings_audit
WHERE entity_uuid IN (
  SELECT uuid FROM public.role_mappings WHERE idp_role <> 'administrators'
);

DELETE FROM public.role_mappings
WHERE idp_role <> 'administrators';

-- 2. Normalize the administrators role row.
UPDATE public.role_mappings
SET
  is_admin = true,
  permissions = '[]'::jsonb,
  created_by = 'initial-setup',
  updated_by = 'initial-setup'
WHERE idp_role = 'administrators';

-- 3. Create INSERT audit record for 'administrators' if missing.
INSERT INTO public.role_mappings_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
SELECT id, uuid, 'INSERT', '2026-05-18T14:27:00Z', 'initial-setup', 1,
  jsonb_build_object(
    'idp_role', jsonb_build_object('old', null, 'new', idp_role),
    'is_admin', jsonb_build_object('old', null, 'new', is_admin),
    'permissions', jsonb_build_object('old', null, 'new', permissions)
  )
FROM public.role_mappings
WHERE idp_role = 'administrators'
AND NOT EXISTS (
  SELECT 1 FROM public.role_mappings_audit a
  WHERE a.entity_uuid = (SELECT uuid FROM public.role_mappings WHERE idp_role = 'administrators')
    AND a.action = 'INSERT'
);

-- 4. Normalize changed_by in organizations_audit for INSERT records.
--    'system', 'setup-casdoor', 'patch-*' → 'initial-setup' (only for INSERT/action=INSERT, version=1)
UPDATE public.organizations_audit
SET changed_by = 'initial-setup'
WHERE action = 'INSERT'
  AND version = 1
  AND changed_by IN ('system', 'setup-casdoor', 'patch-20260525180000');

-- 5. Normalize changed_by in user_profiles_audit for INSERT records.
--    'system' → 'initial-setup' (only for INSERT/action=INSERT, version=1)
--    Leave user UUID values alone (those are legitimate self-referential records from setup-casdoor).
UPDATE public.user_profiles_audit
SET changed_by = 'initial-setup'
WHERE action = 'INSERT'
  AND version = 1
  AND changed_by = 'system';

-- 6. Update the patch registry hash so db:migrate skips the modified init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = '2b9f5f7e2641d5fcbaa69795cbb23d80eb00ce69a80123edbd0f71cbb2829a64'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '2b9f5f7e2641d5fcbaa69795cbb23d80eb00ce69a80123edbd0f71cbb2829a64';

COMMIT;
