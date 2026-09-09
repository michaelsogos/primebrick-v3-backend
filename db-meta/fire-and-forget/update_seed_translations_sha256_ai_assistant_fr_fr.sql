-- Fire-and-forget: Update content_sha256 for 00000000000003_seed_translations_fr_fr after adding AI assistant translations.
-- Date: 2026-09-08
-- Reason: Added app.common.ai.assistant_prefix and app.smart.regex.ai.topic translation keys.
-- Old SHA256: 5726adfbfe160a5efa04731592a098f8cddce78ba7755d35538b44283f1e703d
-- New SHA256: 766833cbefa040c6d9dda418cd4c716af7149eca3cd7bb21294eb5405a2a44b9

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '766833cbefa040c6d9dda418cd4c716af7149eca3cd7bb21294eb5405a2a44b9'
WHERE patch_id = '00000000000003_seed_translations_fr_fr'
  AND content_sha256 <> '766833cbefa040c6d9dda418cd4c716af7149eca3cd7bb21294eb5405a2a44b9';
COMMIT;
