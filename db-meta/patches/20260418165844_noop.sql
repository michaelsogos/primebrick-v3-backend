-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-04-18T16:58:44.532Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260418165844_noop
-- content_sha256: aea82ff73a8d4d3a2a6e27ec23f5f252f39fbc2314acd503a00e4f209329923a
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260418165844_noop', 'aea82ff73a8d4d3a2a6e27ec23f5f252f39fbc2314acd503a00e4f209329923a')
-- ON CONFLICT (patch_id) DO NOTHING;
