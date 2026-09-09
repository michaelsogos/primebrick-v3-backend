-- Fire-and-forget: Update content_sha256 for 00000000000002_seed_translations_it_it after adding granular regex breakdown v2 translation keys.
-- Date: 2026-05-18
-- Reason: Updated app.smart.regex.explainer.end, one_or_more, zero_or_more, optional, exactly, min_or_more, between values; added char_class_brackets, char_class_negated_brackets keys.
-- Old SHA256: 3ced0e3892be51ae9298ec6de4ec056d7a9755be57cda506fcb363d15f8b9e80
-- New SHA256: f856cbea212f43322b0f39a2a898742f6c94eaa61d3a0f8c3c4df1ac8d2de40e

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'f856cbea212f43322b0f39a2a898742f6c94eaa61d3a0f8c3c4df1ac8d2de40e'
WHERE patch_id = '00000000000002_seed_translations_it_it'
  AND content_sha256 <> 'f856cbea212f43322b0f39a2a898742f6c94eaa61d3a0f8c3c4df1ac8d2de40e';
COMMIT;
