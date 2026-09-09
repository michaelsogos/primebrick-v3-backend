-- Fire-and-forget: Update content_sha256 for 00000000000001_seed_translations_en_gb after adding hereYouAreWithDesc translation.
-- Date: 2026-09-09
-- Reason: Added app.smart.regex.ai.hereYouAreWithDesc translation key.
-- Old SHA256: 0389c9e6163f43d264324996948939d9db3a8966ade1d0c744600a0d782cc224
-- New SHA256: e16d4102de50c8a6509c7b0e80a79eb9d18b14e4bdf0a1ddf8a4121dab813fa6

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'e16d4102de50c8a6509c7b0e80a79eb9d18b14e4bdf0a1ddf8a4121dab813fa6'
WHERE patch_id = '00000000000001_seed_translations_en_gb'
  AND content_sha256 <> 'e16d4102de50c8a6509c7b0e80a79eb9d18b14e4bdf0a1ddf8a4121dab813fa6';
COMMIT;
