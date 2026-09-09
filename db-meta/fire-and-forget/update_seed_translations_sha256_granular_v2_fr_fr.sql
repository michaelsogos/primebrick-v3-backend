-- Fire-and-forget: Update content_sha256 for 00000000000003_seed_translations_fr_fr after adding granular regex breakdown v2 translation keys.
-- Date: 2026-05-18
-- Reason: Updated app.smart.regex.explainer.end, one_or_more, zero_or_more, optional, exactly, min_or_more, between values; added char_class_brackets, char_class_negated_brackets keys.
-- Old SHA256: c61e5b18f3b526d2f77c035d37af2c3f5cbd7f220a13fb9c3e7db8bbae89c338
-- New SHA256: aba4a85f462a5bbffca75f708ae21e4206549b10f3c49e5e11b454a95851dbc3

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'aba4a85f462a5bbffca75f708ae21e4206549b10f3c49e5e11b454a95851dbc3'
WHERE patch_id = '00000000000003_seed_translations_fr_fr'
  AND content_sha256 <> 'aba4a85f462a5bbffca75f708ae21e4206549b10f3c49e5e11b454a95851dbc3';
COMMIT;
