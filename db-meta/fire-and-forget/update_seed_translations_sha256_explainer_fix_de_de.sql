-- Fire-and-forget: Update content_sha256 for 00000000000005_seed_translations_de_de after fixing untranslated English words in regex explainer translations.
-- Date: 2026-09-08
-- Reason: Translated English words (Backslash, Pipe, Caret) to proper German.
-- Old SHA256: 7210c526e43633b31400a18a5fbc9712629b4af30533ad6036650d3fa2582abe
-- New SHA256: da0587162c3f3ede9fcd3a8a50df97cd0ab2f2315895e11b3ecadaf93b09af90

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'da0587162c3f3ede9fcd3a8a50df97cd0ab2f2315895e11b3ecadaf93b09af90'
WHERE patch_id = '00000000000005_seed_translations_de_de'
  AND content_sha256 <> 'da0587162c3f3ede9fcd3a8a50df97cd0ab2f2315895e11b3ecadaf93b09af90';
COMMIT;
