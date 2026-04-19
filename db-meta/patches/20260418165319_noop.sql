-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-04-18T16:53:19.798Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260418165319_noop
-- content_sha256: fd38e6fcfb53ae3f6a0c074b367e4d9a22e3a0657a6fa6bfd19d754797c344df
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260418165319_noop', 'fd38e6fcfb53ae3f6a0c074b367e4d9a22e3a0657a6fa6bfd19d754797c344df')
-- ON CONFLICT (patch_id) DO NOTHING;
