-- Fire-and-forget: Update content_sha256 for 00000000000001_seed_translations_en_gb after adding granular regex breakdown translation keys.
-- Date: 2026-09-08
-- Reason: Added app.smart.regex.explainer.char_class_open, char_class_negated_open, char_class_close, char_range translation keys.
-- Old SHA256: 1cd1e8a0f248137121ab05a126fe299bffbb3b9b58cc8cc27af176a592fc7e4b
-- New SHA256: bb37426c9d591a893c2b2518de50bae9a0b3105b07d0d7c5a7c0bf237a1895fd

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'bb37426c9d591a893c2b2518de50bae9a0b3105b07d0d7c5a7c0bf237a1895fd'
WHERE patch_id = '00000000000001_seed_translations_en_gb'
  AND content_sha256 <> 'bb37426c9d591a893c2b2518de50bae9a0b3105b07d0d7c5a7c0bf237a1895fd';
COMMIT;
