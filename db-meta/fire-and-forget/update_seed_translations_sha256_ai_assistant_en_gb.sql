-- Fire-and-forget: Update content_sha256 for 00000000000001_seed_translations_en_gb after adding AI assistant translations.
-- Date: 2026-09-08
-- Reason: Added app.common.ai.assistant_prefix and app.smart.regex.ai.topic translation keys.
-- Old SHA256: a9b8b4957435f2c8713c19bf09106d3c14754b1eacd0b9d9bfc5729587896a18
-- New SHA256: 1cd1e8a0f248137121ab05a126fe299bffbb3b9b58cc8cc27af176a592fc7e4b

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '1cd1e8a0f248137121ab05a126fe299bffbb3b9b58cc8cc27af176a592fc7e4b'
WHERE patch_id = '00000000000001_seed_translations_en_gb'
  AND content_sha256 <> '1cd1e8a0f248137121ab05a126fe299bffbb3b9b58cc8cc27af176a592fc7e4b';
COMMIT;
