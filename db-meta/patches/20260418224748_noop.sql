-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-04-18T22:47:48.081Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260418224748_noop
-- content_sha256: 1cbc12ed9924b2acdb43158134ab5fbcae1c8ad5dceae675abbb4fc8fe3eb314
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260418224748_noop', '1cbc12ed9924b2acdb43158134ab5fbcae1c8ad5dceae675abbb4fc8fe3eb314')
-- ON CONFLICT (patch_id) DO NOTHING;
