-- Fire-and-forget: Update content_sha256 for 00000000000005_seed_translations_de_de after adding granular regex breakdown v2 translation keys.
-- Date: 2026-05-18
-- Reason: Updated app.smart.regex.explainer.end, one_or_more, zero_or_more, optional, exactly, min_or_more, between values; added char_class_brackets, char_class_negated_brackets keys.
-- Old SHA256: 3f47c073e30035c24cdf895353bbefa09254b529c4590567e2b92e3e7228e93e
-- New SHA256: 3243fdb95bc22dcda0b2dc56a1a15aaba3cefcbde1df5f591b1a5b96cf8102fb

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '3243fdb95bc22dcda0b2dc56a1a15aaba3cefcbde1df5f591b1a5b96cf8102fb'
WHERE patch_id = '00000000000005_seed_translations_de_de'
  AND content_sha256 <> '3243fdb95bc22dcda0b2dc56a1a15aaba3cefcbde1df5f591b1a5b96cf8102fb';
COMMIT;
