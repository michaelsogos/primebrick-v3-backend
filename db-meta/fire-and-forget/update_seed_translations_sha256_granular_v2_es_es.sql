-- Fire-and-forget: Update content_sha256 for 00000000000004_seed_translations_es_es after adding granular regex breakdown v2 translation keys.
-- Date: 2026-05-18
-- Reason: Updated app.smart.regex.explainer.end, one_or_more, zero_or_more, optional, exactly, min_or_more, between values; added char_class_brackets, char_class_negated_brackets keys.
-- Old SHA256: bb021e9d7bdd44ea785595df6a360df835cb9406c67861831d6f5a2b06d8524e
-- New SHA256: 4e89211a52ecea3cc4bae4dc88212dcbf565d8cf54d6f085024ada54d9414a2d

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '4e89211a52ecea3cc4bae4dc88212dcbf565d8cf54d6f085024ada54d9414a2d'
WHERE patch_id = '00000000000004_seed_translations_es_es'
  AND content_sha256 <> '4e89211a52ecea3cc4bae4dc88212dcbf565d8cf54d6f085024ada54d9414a2d';
COMMIT;
