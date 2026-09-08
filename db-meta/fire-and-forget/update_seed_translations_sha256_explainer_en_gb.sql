-- Fire-and-forget: Update content_sha256 for 00000000000001_seed_translations_en_gb after adding Smart Regex Explainer translations.
-- Date: 2026-09-08
-- Reason: Added 46 app.smart.regex.explainer.* translation keys for the deterministic regex breakdown.
-- Old SHA256: 7ca03ca2e3bb435958f2dc1d4a2b5f18210fcb0d4cedfeee615ff4f9fa39b035
-- New SHA256: a9b8b4957435f2c8713c19bf09106d3c14754b1eacd0b9d9bfc5729587896a18

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'a9b8b4957435f2c8713c19bf09106d3c14754b1eacd0b9d9bfc5729587896a18'
WHERE patch_id = '00000000000001_seed_translations_en_gb'
  AND content_sha256 <> 'a9b8b4957435f2c8713c19bf09106d3c14754b1eacd0b9d9bfc5729587896a18';
COMMIT;
