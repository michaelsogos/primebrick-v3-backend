-- Fire-and-forget: update content_sha256 for the six seed translation
-- patches after removing superseded per-entity page-title keys and adding
-- system.entities.page_title.{list,create,edit} (canonical title templates).
-- Idempotent: only updates rows whose stored hash differs.
-- Date: 2026-10-02
BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'a093103fbd859bc2bfa462f9a674cf7bcadf8e99f24d7eb61644d80f8fc02a37'
WHERE patch_id = '00000000000001_seed_translations_en_gb'
  AND content_sha256 <> 'a093103fbd859bc2bfa462f9a674cf7bcadf8e99f24d7eb61644d80f8fc02a37';
UPDATE public.primebrick_database_patches
SET content_sha256 = '34c203f2fd197c4d6c04580be3a72804ce67d006272759eea7cd34cd13102c61'
WHERE patch_id = '00000000000002_seed_translations_it_it'
  AND content_sha256 <> '34c203f2fd197c4d6c04580be3a72804ce67d006272759eea7cd34cd13102c61';
UPDATE public.primebrick_database_patches
SET content_sha256 = 'a77e157888d9f00de8a3ea1f3d3bde918d342c8845cfbfd5d9558de380856ff5'
WHERE patch_id = '00000000000003_seed_translations_fr_fr'
  AND content_sha256 <> 'a77e157888d9f00de8a3ea1f3d3bde918d342c8845cfbfd5d9558de380856ff5';
UPDATE public.primebrick_database_patches
SET content_sha256 = '51117740d6ca44adc52f0c99966963050078872a8d1cfa10ec04207080d56caa'
WHERE patch_id = '00000000000004_seed_translations_es_es'
  AND content_sha256 <> '51117740d6ca44adc52f0c99966963050078872a8d1cfa10ec04207080d56caa';
UPDATE public.primebrick_database_patches
SET content_sha256 = '4040de33de0b6046e002c56ba0f0fab5896201a71d848dd8ec9948b27d186aa0'
WHERE patch_id = '00000000000005_seed_translations_de_de'
  AND content_sha256 <> '4040de33de0b6046e002c56ba0f0fab5896201a71d848dd8ec9948b27d186aa0';
UPDATE public.primebrick_database_patches
SET content_sha256 = '74929d3c29c84f09db3214910942f1afd784dad7fb9f7e67e537e93d3214d65d'
WHERE patch_id = '00000000000006_seed_translations_pt_pt'
  AND content_sha256 <> '74929d3c29c84f09db3214910942f1afd784dad7fb9f7e67e537e93d3214d65d';
COMMIT;
