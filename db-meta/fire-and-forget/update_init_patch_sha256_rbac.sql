-- Fire-and-forget: Update content_sha256 for init_database patch in the patch registry.
-- Reason: auth_auditor seed permission renamed 'auth_events.read.all' → 'auth_event.read.all'
-- (RBAC permission convention unification). Run ONCE on each existing database.
BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '017a30ee44b2159a55523116cbc0fb63fba5907da84c77b4534b427faa8b975b'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '017a30ee44b2159a55523116cbc0fb63fba5907da84c77b4534b427faa8b975b';
COMMIT;
