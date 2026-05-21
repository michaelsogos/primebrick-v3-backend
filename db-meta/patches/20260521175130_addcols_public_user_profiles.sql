-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-21T17:51:30.588Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TYPE mismatch "cloned_from" entity≈text db≈uuid — manual ALTER TYPE / migration

ALTER TABLE "public"."user_profiles" ADD COLUMN IF NOT EXISTS "idp_org" varchar(255);
ALTER TABLE "public"."user_profiles" ADD COLUMN IF NOT EXISTS "idp_username" varchar(255);

-- TYPE mismatch "is_admin" entity≈text db≈bool — manual ALTER TYPE / migration


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260521175130_addcols_public_user_profiles
-- content_sha256: 9f7b0517f63ea042134cbc53447febd16436d48809604098c4250b1c871aabfd
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260521175130_addcols_public_user_profiles', '9f7b0517f63ea042134cbc53447febd16436d48809604098c4250b1c871aabfd')
-- ON CONFLICT (patch_id) DO NOTHING;
