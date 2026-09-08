-- Fire-and-forget: Update content_sha256 for 00000000000005_seed_translations_de_de after adding Smart Regex Explainer translations.
-- Date: 2026-09-08
-- Reason: Added 46 app.smart.regex.explainer.* translation keys for the deterministic regex breakdown.
-- Old SHA256: 60ebad58f79247e7bbe682d88d0c4c4b3c20fad49a86afe9622f27cf9b435f1e
-- New SHA256: 8ba5d0821df87f827acf3b33366f9a745dc369a12e90b44fcf4290be4c6a21d3

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '8ba5d0821df87f827acf3b33366f9a745dc369a12e90b44fcf4290be4c6a21d3'
WHERE patch_id = '00000000000005_seed_translations_de_de'
  AND content_sha256 <> '8ba5d0821df87f827acf3b33366f9a745dc369a12e90b44fcf4290be4c6a21d3';
COMMIT;
