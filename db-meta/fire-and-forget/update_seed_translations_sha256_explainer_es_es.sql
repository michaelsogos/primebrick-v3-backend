-- Fire-and-forget: Update content_sha256 for 00000000000004_seed_translations_es_es after adding Smart Regex Explainer translations.
-- Date: 2026-09-08
-- Reason: Added 46 app.smart.regex.explainer.* translation keys for the deterministic regex breakdown.
-- Old SHA256: 56574fc2f50966b247d96d7d171b11d88cd352cdcfb5b5ab5ead6999584c2711
-- New SHA256: 79ab216761256cab5a67a2c6eb019a16a91e50eeb60b09d0a286fc179c791437

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '79ab216761256cab5a67a2c6eb019a16a91e50eeb60b09d0a286fc179c791437'
WHERE patch_id = '00000000000004_seed_translations_es_es'
  AND content_sha256 <> '79ab216761256cab5a67a2c6eb019a16a91e50eeb60b09d0a286fc179c791437';
COMMIT;
