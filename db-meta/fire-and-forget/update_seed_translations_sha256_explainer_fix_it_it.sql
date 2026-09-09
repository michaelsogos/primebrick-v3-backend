-- Fire-and-forget: Update content_sha256 for 00000000000002_seed_translations_it_it after fixing untranslated English words in regex explainer translations.
-- Date: 2026-09-08
-- Reason: Translated English words (newline, Set, Backslash, Pipe, Caret, Slash, tab, Dollar) to proper Italian.
-- Old SHA256: e0c8461d1e07725e8762c746ae708219cb3b03a663b026f702216d2fc78a55ef
-- New SHA256: 8cf7c7ca0029490f4ddd98a94077b746b8e74409a754086dfcd0d01b1b9c0cc5

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '8cf7c7ca0029490f4ddd98a94077b746b8e74409a754086dfcd0d01b1b9c0cc5'
WHERE patch_id = '00000000000002_seed_translations_it_it'
  AND content_sha256 <> '8cf7c7ca0029490f4ddd98a94077b746b8e74409a754086dfcd0d01b1b9c0cc5';
COMMIT;
