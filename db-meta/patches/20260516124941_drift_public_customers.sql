-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-16T12:49:41.060Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TYPE mismatch "cloned_from" entity≈text db≈uuid — manual ALTER TYPE / migration


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260516124941_drift_public_customers
-- content_sha256: 422f59b37cf2e35d9165560f9201774c77e3dca3c46399d97a471b4f93602972
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260516124941_drift_public_customers', '422f59b37cf2e35d9165560f9201774c77e3dca3c46399d97a471b4f93602972')
-- ON CONFLICT (patch_id) DO NOTHING;
