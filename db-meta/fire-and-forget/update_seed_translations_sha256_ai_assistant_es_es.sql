-- Fire-and-forget: Update content_sha256 for 00000000000004_seed_translations_es_es after adding AI assistant translations.
-- Date: 2026-09-08
-- Reason: Added app.common.ai.assistant_prefix and app.smart.regex.ai.topic translation keys.
-- Old SHA256: 79ab216761256cab5a67a2c6eb019a16a91e50eeb60b09d0a286fc179c791437
-- New SHA256: 5a9fa442dac559c007b82818cd77701fd000bf553a8779ce379aec2bfd22882d

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '5a9fa442dac559c007b82818cd77701fd000bf553a8779ce379aec2bfd22882d'
WHERE patch_id = '00000000000004_seed_translations_es_es'
  AND content_sha256 <> '5a9fa442dac559c007b82818cd77701fd000bf553a8779ce379aec2bfd22882d';
COMMIT;
