-- Fire-and-forget: Update content_sha256 for 00000000000003_seed_translations_fr_fr after adding granular regex breakdown translation keys.
-- Date: 2026-09-08
-- Reason: Added app.smart.regex.explainer.char_class_open, char_class_negated_open, char_class_close, char_range translation keys.
-- Old SHA256: 2511f7379e7a4a8a921243ce7b27fd95ec3c75eadd273888d716eac9f8f3ea4f
-- New SHA256: c61e5b18f3b526d2f77c035d37af2c3f5cbd7f220a13fb9c3e7db8bbae89c338

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'c61e5b18f3b526d2f77c035d37af2c3f5cbd7f220a13fb9c3e7db8bbae89c338'
WHERE patch_id = '00000000000003_seed_translations_fr_fr'
  AND content_sha256 <> 'c61e5b18f3b526d2f77c035d37af2c3f5cbd7f220a13fb9c3e7db8bbae89c338';
COMMIT;
