-- Fire-and-forget: Update content_sha256 for 00000000000005_seed_translations_de_de after adding granular regex breakdown translation keys.
-- Date: 2026-09-08
-- Reason: Added app.smart.regex.explainer.char_class_open, char_class_negated_open, char_class_close, char_range translation keys.
-- Old SHA256: da0587162c3f3ede9fcd3a8a50df97cd0ab2f2315895e11b3ecadaf93b09af90
-- New SHA256: 3f47c073e30035c24cdf895353bbefa09254b529c4590567e2b92e3e7228e93e

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '3f47c073e30035c24cdf895353bbefa09254b529c4590567e2b92e3e7228e93e'
WHERE patch_id = '00000000000005_seed_translations_de_de'
  AND content_sha256 <> '3f47c073e30035c24cdf895353bbefa09254b529c4590567e2b92e3e7228e93e';
COMMIT;
