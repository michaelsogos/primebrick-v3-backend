-- Primebrick: entity → database patch
-- pb:requires-review
-- pb:segments
-- generatedAt: 2026-10-13T13:40:51.463Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- pb:begin-no-transaction
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "config_entries_uuid_uq" ON "public"."config_entries" ("uuid");
-- pb:end-no-transaction

-- ── review section (runs only after approval) ──
-- REVIEW nullability "avatar_color" entity=true db=false (SET NOT NULL fails on existing NULLs)
ALTER TABLE "public"."user_profiles" ALTER COLUMN "avatar_color" DROP NOT NULL;

-- WARN: DB-only index "config_entries_deleted_at_idx" on public.config_entries — not dropped


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_name: 20261013134051_drift_public_user_profiles
-- content_sha256: b9184ef2dc01e49aa4ae6fa6ccbe94bc74b91dbe30b15acdf3b7b3cba105c154
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20261013134051_drift_public_user_profiles', 'b9184ef2dc01e49aa4ae6fa6ccbe94bc74b91dbe30b15acdf3b7b3cba105c154')
-- ON CONFLICT (patch_id) DO NOTHING;
