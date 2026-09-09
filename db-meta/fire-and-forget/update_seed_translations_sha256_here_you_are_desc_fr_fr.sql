-- Fire-and-forget: Update content_sha256 for 00000000000003_seed_translations_fr_fr after adding hereYouAreWithDesc translation.
-- Date: 2026-09-09
-- Reason: Added app.smart.regex.ai.hereYouAreWithDesc translation key.
-- Old SHA256: aba4a85f462a5bbffca75f708ae21e4206549b10f3c49e5e11b454a95851dbc3
-- New SHA256: b27b9f81ccd6f5d267742aa0054d12fdec4d22ed3bee52680f97b795729805c3

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'b27b9f81ccd6f5d267742aa0054d12fdec4d22ed3bee52680f97b795729805c3'
WHERE patch_id = '00000000000003_seed_translations_fr_fr'
  AND content_sha256 <> 'b27b9f81ccd6f5d267742aa0054d12fdec4d22ed3bee52680f97b795729805c3';
COMMIT;
