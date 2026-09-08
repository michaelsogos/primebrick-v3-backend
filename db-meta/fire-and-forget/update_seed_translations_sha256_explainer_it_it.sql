-- Fire-and-forget: Update content_sha256 for 00000000000002_seed_translations_it_it after adding Smart Regex Explainer translations.
-- Date: 2026-09-08
-- Reason: Added 46 app.smart.regex.explainer.* translation keys for the deterministic regex breakdown.
-- Old SHA256: d6d72343f815ee73a47be42268b97b6eb5edcb6d966b8de8d984438e2ace7ac1
-- New SHA256: 90b3a7386373f98cbbbf1f761501b11c714a458c4ce131022337c40214ab6ae8

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '90b3a7386373f98cbbbf1f761501b11c714a458c4ce131022337c40214ab6ae8'
WHERE patch_id = '00000000000002_seed_translations_it_it'
  AND content_sha256 <> '90b3a7386373f98cbbbf1f761501b11c714a458c4ce131022337c40214ab6ae8';
COMMIT;
