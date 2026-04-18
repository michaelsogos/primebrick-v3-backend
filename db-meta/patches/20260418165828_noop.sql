-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-04-18T16:58:28.541Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260418165828_noop
-- content_sha256: bd9a8a4b3a6485ce6aa53071b2d5574eeb7d809191b927b39ace668c6c12e775
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260418165828_noop', 'bd9a8a4b3a6485ce6aa53071b2d5574eeb7d809191b927b39ace668c6c12e775')
-- ON CONFLICT (patch_id) DO NOTHING;
