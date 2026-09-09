-- Fire-and-forget: Update content_sha256 for 00000000000002_seed_translations_it_it after adding hereYouAreWithDesc translation.
-- Date: 2026-09-09
-- Reason: Added app.smart.regex.ai.hereYouAreWithDesc translation key.
-- Old SHA256: f856cbea212f43322b0f39a2a898742f6c94eaa61d3a0f8c3c4df1ac8d2de40e
-- New SHA256: c9b8e28a6bb7478e40b495db50bf119fce5702f74b3e0e9824edb6f317abf4a9

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'c9b8e28a6bb7478e40b495db50bf119fce5702f74b3e0e9824edb6f317abf4a9'
WHERE patch_id = '00000000000002_seed_translations_it_it'
  AND content_sha256 <> 'c9b8e28a6bb7478e40b495db50bf119fce5702f74b3e0e9824edb6f317abf4a9';
COMMIT;
