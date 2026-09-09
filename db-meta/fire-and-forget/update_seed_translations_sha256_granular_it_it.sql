-- Fire-and-forget: Update content_sha256 for 00000000000002_seed_translations_it_it after adding granular regex breakdown translation keys.
-- Date: 2026-09-08
-- Reason: Added app.smart.regex.explainer.char_class_open, char_class_negated_open, char_class_close, char_range translation keys.
-- Old SHA256: 8cf7c7ca0029490f4ddd98a94077b746b8e74409a754086dfcd0d01b1b9c0cc5
-- New SHA256: 3ced0e3892be51ae9298ec6de4ec056d7a9755be57cda506fcb363d15f8b9e80

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '3ced0e3892be51ae9298ec6de4ec056d7a9755be57cda506fcb363d15f8b9e80'
WHERE patch_id = '00000000000002_seed_translations_it_it'
  AND content_sha256 <> '3ced0e3892be51ae9298ec6de4ec056d7a9755be57cda506fcb363d15f8b9e80';
COMMIT;
