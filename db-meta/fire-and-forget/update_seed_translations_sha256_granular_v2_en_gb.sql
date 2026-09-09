-- Fire-and-forget: Update content_sha256 for 00000000000001_seed_translations_en_gb after adding granular regex breakdown v2 translation keys.
-- Date: 2026-05-18
-- Reason: Updated app.smart.regex.explainer.end, one_or_more, zero_or_more, optional, exactly, min_or_more, between values; added char_class_brackets, char_class_negated_brackets keys.
-- Old SHA256: bb37426c9d591a893c2b2518de50bae9a0b3105b07d0d7c5a7c0bf237a1895fd
-- New SHA256: 0389c9e6163f43d264324996948939d9db3a8966ade1d0c744600a0d782cc224

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '0389c9e6163f43d264324996948939d9db3a8966ade1d0c744600a0d782cc224'
WHERE patch_id = '00000000000001_seed_translations_en_gb'
  AND content_sha256 <> '0389c9e6163f43d264324996948939d9db3a8966ade1d0c744600a0d782cc224';
COMMIT;
