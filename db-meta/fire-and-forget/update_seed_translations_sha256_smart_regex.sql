-- Fire-and-forget: Update content_sha256 for seed translation patches 0001-0006
-- after adding app.smart.regex.* translation keys (21 new keys × 6 languages = 126 INSERTs)
-- plus app.smart.regex.ai.breakdown and app.common.copy (2 keys × 6 languages = 12 INSERTs).
--
-- The seed patches were modified to include the new SmartRegexInput AI translation
-- keys for fresh installs. Existing databases that already applied the original
-- patches need their hash updated so db:migrate recognizes the modified patches
-- and doesn't try to re-apply them (the keys are added by the companion
-- add_smart_regex_translations.sql fire-and-forget patch instead).
--
-- ⚠️ Run AFTER add_smart_regex_translations.sql
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
-- The BE caches translations in Redis with key pattern:
--   translations:i18n:system:{language}
-- TTL is 6 hours, but to see the changes immediately, run:
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
-- Or if Redis requires auth:
--   redis-cli -a <password> --scan --pattern 'translations:i18n:system:*' | xargs redis-cli -a <password> del

BEGIN;

-- 00000000000001_seed_translations_en_gb
UPDATE public.primebrick_database_patches
  SET content_sha256 = '3ada3db8258a3654423baa052cbf2a264e93d39719118062f282af79bd191f66'
  WHERE patch_id = '00000000000001_seed_translations_en_gb'
    AND content_sha256 <> '3ada3db8258a3654423baa052cbf2a264e93d39719118062f282af79bd191f66';

-- 00000000000002_seed_translations_it_it
UPDATE public.primebrick_database_patches
  SET content_sha256 = 'ea8f19a95adcc8eec89e8a83ce9c6096ec1df13e479d5427c7a22cc406b2af8c'
  WHERE patch_id = '00000000000002_seed_translations_it_it'
    AND content_sha256 <> 'ea8f19a95adcc8eec89e8a83ce9c6096ec1df13e479d5427c7a22cc406b2af8c';

-- 00000000000003_seed_translations_fr_fr
UPDATE public.primebrick_database_patches
  SET content_sha256 = '371a07a1cfcecf831d10016a59d44e35696efd0cf2f3efe8f80db86a9905d779'
  WHERE patch_id = '00000000000003_seed_translations_fr_fr'
    AND content_sha256 <> '371a07a1cfcecf831d10016a59d44e35696efd0cf2f3efe8f80db86a9905d779';

-- 00000000000004_seed_translations_es_es
UPDATE public.primebrick_database_patches
  SET content_sha256 = 'c913fa90dc1da702d4aa6e97d28029ffa120ab362612557efdfcc1e3d9aab0fb'
  WHERE patch_id = '00000000000004_seed_translations_es_es'
    AND content_sha256 <> 'c913fa90dc1da702d4aa6e97d28029ffa120ab362612557efdfcc1e3d9aab0fb';

-- 00000000000005_seed_translations_de_de
UPDATE public.primebrick_database_patches
  SET content_sha256 = '360105d3bab091140de8b6655034e9eb2f9e87d5aa943b2bba475364b5f195c5'
  WHERE patch_id = '00000000000005_seed_translations_de_de'
    AND content_sha256 <> '360105d3bab091140de8b6655034e9eb2f9e87d5aa943b2bba475364b5f195c5';

-- 00000000000006_seed_translations_pt_pt
UPDATE public.primebrick_database_patches
  SET content_sha256 = 'e3aad3686055094e08b63e43151074a2b933dca2c5ad9b9500bd1f0e227f928e'
  WHERE patch_id = '00000000000006_seed_translations_pt_pt'
    AND content_sha256 <> 'e3aad3686055094e08b63e43151074a2b933dca2c5ad9b9500bd1f0e227f928e';

COMMIT;
