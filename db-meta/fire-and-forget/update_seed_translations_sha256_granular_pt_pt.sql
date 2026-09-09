-- Fire-and-forget: Update content_sha256 for 00000000000006_seed_translations_pt_pt after adding granular regex breakdown translation keys.
-- Date: 2026-09-08
-- Reason: Added app.smart.regex.explainer.char_class_open, char_class_negated_open, char_class_close, char_range translation keys.
-- Old SHA256: 364d3db78405788c7bd6014830358039d23410b0c58b4e719dfbb3f0c3614e3c
-- New SHA256: bc07fcbb9b624052309cdca770986d244ef0d3d3c9147d771f225923ca145e96

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'bc07fcbb9b624052309cdca770986d244ef0d3d3c9147d771f225923ca145e96'
WHERE patch_id = '00000000000006_seed_translations_pt_pt'
  AND content_sha256 <> 'bc07fcbb9b624052309cdca770986d244ef0d3d3c9147d771f225923ca145e96';
COMMIT;
