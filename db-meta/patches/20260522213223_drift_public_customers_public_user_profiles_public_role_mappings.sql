-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-22T21:32:23.822Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TYPE mismatch "cloned_from" entity≈text db≈uuid — manual ALTER TYPE / migration

-- NULLABILITY "is_active" entity=false db=true — manual ALTER COLUMN … SET/DROP NOT NULL
-- NULLABILITY "is_admin" entity=false db=true — manual ALTER COLUMN … SET/DROP NOT NULL

-- TYPE mismatch "is_admin" entity≈text db≈bool — manual ALTER TYPE / migration


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260522213223_drift_public_customers_public_user_profiles_public_role_mappings
-- content_sha256: 2c4ec6982dd6eb95beb7a2d3cc5b74ea607de14563c4ded207a88402ed837027
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260522213223_drift_public_customers_public_user_profiles_public_role_mappings', '2c4ec6982dd6eb95beb7a2d3cc5b74ea607de14563c4ded207a88402ed837027')
-- ON CONFLICT (patch_id) DO NOTHING;
