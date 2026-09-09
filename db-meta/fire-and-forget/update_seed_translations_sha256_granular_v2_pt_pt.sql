-- Fire-and-forget: Update content_sha256 for 00000000000006_seed_translations_pt_pt after adding granular regex breakdown v2 translation keys.
-- Date: 2026-05-18
-- Reason: Updated app.smart.regex.explainer.end, one_or_more, zero_or_more, optional, exactly, min_or_more, between values; added char_class_brackets, char_class_negated_brackets keys.
-- Old SHA256: bc07fcbb9b624052309cdca770986d244ef0d3d3c9147d771f225923ca145e96
-- New SHA256: c16f7383b0dc84deda9183231ac8c20ca2837e904507a183074d6c88112c6705

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'c16f7383b0dc84deda9183231ac8c20ca2837e904507a183074d6c88112c6705'
WHERE patch_id = '00000000000006_seed_translations_pt_pt'
  AND content_sha256 <> 'c16f7383b0dc84deda9183231ac8c20ca2837e904507a183074d6c88112c6705';
COMMIT;
