-- Fire-and-forget: Update content_sha256 for 00000000000005_seed_translations_de_de after adding AI assistant translations.
-- Date: 2026-09-08
-- Reason: Added app.common.ai.assistant_prefix and app.smart.regex.ai.topic translation keys.
-- Old SHA256: 8ba5d0821df87f827acf3b33366f9a745dc369a12e90b44fcf4290be4c6a21d3
-- New SHA256: 7210c526e43633b31400a18a5fbc9712629b4af30533ad6036650d3fa2582abe

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '7210c526e43633b31400a18a5fbc9712629b4af30533ad6036650d3fa2582abe'
WHERE patch_id = '00000000000005_seed_translations_de_de'
  AND content_sha256 <> '7210c526e43633b31400a18a5fbc9712629b4af30533ad6036650d3fa2582abe';
COMMIT;
