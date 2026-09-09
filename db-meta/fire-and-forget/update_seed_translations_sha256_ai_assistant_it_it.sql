-- Fire-and-forget: Update content_sha256 for 00000000000002_seed_translations_it_it after adding AI assistant translations.
-- Date: 2026-09-08
-- Reason: Added app.common.ai.assistant_prefix and app.smart.regex.ai.topic translation keys.
-- Old SHA256: 90b3a7386373f98cbbbf1f761501b11c714a458c4ce131022337c40214ab6ae8
-- New SHA256: e0c8461d1e07725e8762c746ae708219cb3b03a663b026f702216d2fc78a55ef

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'e0c8461d1e07725e8762c746ae708219cb3b03a663b026f702216d2fc78a55ef'
WHERE patch_id = '00000000000002_seed_translations_it_it'
  AND content_sha256 <> 'e0c8461d1e07725e8762c746ae708219cb3b03a663b026f702216d2fc78a55ef';
COMMIT;
