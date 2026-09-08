-- Fire-and-forget: Update content_sha256 for seed translation patches 0001-0006
-- after adding app.smart.regex.ai.hereYouAre translation key (1 key × 6 languages = 6 INSERTs).
--
-- The seed patches were modified to include the hereYouAre key for fresh installs.
-- Existing databases need their hash updated so db:migrate recognizes the modified
-- patches and doesn't try to re-apply them.
--
-- ⚠️ Run AFTER add_smart_regex_translations.sql
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!

BEGIN;

-- 00000000000001_seed_translations_en_gb
UPDATE public.primebrick_database_patches
  SET content_sha256 = '7ca03ca2e3bb435958f2dc1d4a2b5f18210fcb0d4cedfeee615ff4f9fa39b035'
  WHERE patch_id = '00000000000001_seed_translations_en_gb'
    AND content_sha256 <> '7ca03ca2e3bb435958f2dc1d4a2b5f18210fcb0d4cedfeee615ff4f9fa39b035';

-- 00000000000002_seed_translations_it_it
UPDATE public.primebrick_database_patches
  SET content_sha256 = 'd6d72343f815ee73a47be42268b97b6eb5edcb6d966b8de8d984438e2ace7ac1'
  WHERE patch_id = '00000000000002_seed_translations_it_it'
    AND content_sha256 <> 'd6d72343f815ee73a47be42268b97b6eb5edcb6d966b8de8d984438e2ace7ac1';

-- 00000000000003_seed_translations_fr_fr
UPDATE public.primebrick_database_patches
  SET content_sha256 = '03094ba12aea6af0a1c5861ba130c82b686edd3de2b00d7b0efeeeed25e0485f'
  WHERE patch_id = '00000000000003_seed_translations_fr_fr'
    AND content_sha256 <> '03094ba12aea6af0a1c5861ba130c82b686edd3de2b00d7b0efeeeed25e0485f';

-- 00000000000004_seed_translations_es_es
UPDATE public.primebrick_database_patches
  SET content_sha256 = '56574fc2f50966b247d96d7d171b11d88cd352cdcfb5b5ab5ead6999584c2711'
  WHERE patch_id = '00000000000004_seed_translations_es_es'
    AND content_sha256 <> '56574fc2f50966b247d96d7d171b11d88cd352cdcfb5b5ab5ead6999584c2711';

-- 00000000000005_seed_translations_de_de
UPDATE public.primebrick_database_patches
  SET content_sha256 = '60ebad58f79247e7bbe682d88d0c4c4b3c20fad49a86afe9622f27cf9b435f1e'
  WHERE patch_id = '00000000000005_seed_translations_de_de'
    AND content_sha256 <> '60ebad58f79247e7bbe682d88d0c4c4b3c20fad49a86afe9622f27cf9b435f1e';

-- 00000000000006_seed_translations_pt_pt
UPDATE public.primebrick_database_patches
  SET content_sha256 = '6059fd7a8d626f457d8fcb4197af9ab72fcedff664e255fe19cff6d64738a828'
  WHERE patch_id = '00000000000006_seed_translations_pt_pt'
    AND content_sha256 <> '6059fd7a8d626f457d8fcb4197af9ab72fcedff664e255fe19cff6d64738a828';

COMMIT;
