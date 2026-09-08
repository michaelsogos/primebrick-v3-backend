-- Fire-and-forget: Update content_sha256 for 00000000000003_seed_translations_fr_fr after adding Smart Regex Explainer translations.
-- Date: 2026-09-08
-- Reason: Added 46 app.smart.regex.explainer.* translation keys for the deterministic regex breakdown.
-- Old SHA256: 03094ba12aea6af0a1c5861ba130c82b686edd3de2b00d7b0efeeeed25e0485f
-- New SHA256: 5726adfbfe160a5efa04731592a098f8cddce78ba7755d35538b44283f1e703d

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '5726adfbfe160a5efa04731592a098f8cddce78ba7755d35538b44283f1e703d'
WHERE patch_id = '00000000000003_seed_translations_fr_fr'
  AND content_sha256 <> '5726adfbfe160a5efa04731592a098f8cddce78ba7755d35538b44283f1e703d';
COMMIT;
