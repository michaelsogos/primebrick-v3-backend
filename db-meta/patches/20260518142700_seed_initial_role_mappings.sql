-- Primebrick: seed initial role mappings
-- generatedAt: 2026-05-18T14:27:00.000Z

-- Administrator role - grants all permissions (super-user)
INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by)
VALUES ('Administrators', '[]'::jsonb, true, '2026-05-18T14:27:00Z', 'system', '2026-05-18T14:27:00Z', 'system')
ON CONFLICT (idp_role) DO NOTHING;

-- Sales role - can read/create/update customers
INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by)
VALUES ('Sales',
  '["customers:list", "customers:read", "customers:create", "customers:update"]'::jsonb,
  false,
  '2026-05-18T14:27:00Z',
  'system',
  '2026-05-18T14:27:00Z',
  'system'
)
ON CONFLICT (idp_role) DO NOTHING;

-- Customer Service role - can read/update customers
INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by)
VALUES ('CustomerService',
  '["customers:list", "customers:read", "customers:update"]'::jsonb,
  false,
  '2026-05-18T14:27:00Z',
  'system',
  '2026-05-18T14:27:00Z',
  'system'
)
ON CONFLICT (idp_role) DO NOTHING;

-- HR role - placeholder for future HR permissions
INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by)
VALUES ('HR',
  '[]'::jsonb,
  false,
  '2026-05-18T14:27:00Z',
  'system',
  '2026-05-18T14:27:00Z',
  'system'
)
ON CONFLICT (idp_role) DO NOTHING;

-- Ops role - placeholder for future Ops permissions
INSERT INTO public.role_mappings (idp_role, permissions, is_admin, created_at, created_by, updated_at, updated_by)
VALUES ('Ops',
  '[]'::jsonb,
  false,
  '2026-05-18T14:27:00Z',
  'system',
  '2026-05-18T14:27:00Z',
  'system'
)
ON CONFLICT (idp_role) DO NOTHING;

-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260518142700_seed_initial_role_mappings
-- content_sha256: TBD
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260518142700_seed_initial_role_mappings', 'TBD')
-- ON CONFLICT (patch_id) DO NOTHING;
