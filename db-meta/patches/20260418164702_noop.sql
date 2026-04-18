-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-04-18T16:47:02.419Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260418164702_noop
-- content_sha256: 4413fcad623237f5a8fe80e041334dba2f71245f20e6b76fac16ed76263b3c1f
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260418164702_noop', '4413fcad623237f5a8fe80e041334dba2f71245f20e6b76fac16ed76263b3c1f')
-- ON CONFLICT (patch_id) DO NOTHING;
