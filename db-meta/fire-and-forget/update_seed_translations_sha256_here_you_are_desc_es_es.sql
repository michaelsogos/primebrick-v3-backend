-- Fire-and-forget: Update content_sha256 for 00000000000004_seed_translations_es_es after adding hereYouAreWithDesc translation.
-- Date: 2026-09-09
-- Reason: Added app.smart.regex.ai.hereYouAreWithDesc translation key.
-- Old SHA256: 4e89211a52ecea3cc4bae4dc88212dcbf565d8cf54d6f085024ada54d9414a2d
-- New SHA256: 7de9b2f9a2e229e606bc92659324d6eb666f4490f5c19fd4f6c283a0d2e4d9ee

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '7de9b2f9a2e229e606bc92659324d6eb666f4490f5c19fd4f6c283a0d2e4d9ee'
WHERE patch_id = '00000000000004_seed_translations_es_es'
  AND content_sha256 <> '7de9b2f9a2e229e606bc92659324d6eb666f4490f5c19fd4f6c283a0d2e4d9ee';
COMMIT;
