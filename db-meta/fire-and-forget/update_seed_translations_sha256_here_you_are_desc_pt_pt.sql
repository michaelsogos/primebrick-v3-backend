-- Fire-and-forget: Update content_sha256 for 00000000000006_seed_translations_pt_pt after adding hereYouAreWithDesc translation.
-- Date: 2026-09-09
-- Reason: Added app.smart.regex.ai.hereYouAreWithDesc translation key.
-- Old SHA256: c16f7383b0dc84deda9183231ac8c20ca2837e904507a183074d6c88112c6705
-- New SHA256: a488a13a8c1c3934fbd6c641887c29f5f04b6f85fdd1355641485f0ea74d5237

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'a488a13a8c1c3934fbd6c641887c29f5f04b6f85fdd1355641485f0ea74d5237'
WHERE patch_id = '00000000000006_seed_translations_pt_pt'
  AND content_sha256 <> 'a488a13a8c1c3934fbd6c641887c29f5f04b6f85fdd1355641485f0ea74d5237';
COMMIT;
