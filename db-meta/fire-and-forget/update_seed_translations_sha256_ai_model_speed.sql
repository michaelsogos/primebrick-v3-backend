-- Fire-and-forget: update translation seed patch hashes after adding the
-- AI model speed-score label, explanation and ranking chain.
-- Date: 2026-09-16
--
-- en-GB: 3ada3db8258a3654423baa052cbf2a264e93d39719118062f282af79bd191f66
--     -> fcd7ca8b19680dd1ffc8c2f8ee9f9d42e96cda65933dce3804ca680db2447569
-- it-IT: ea8f19a95adcc8eec89e8a83ce9c6096ec1df13e479d5427c7a22cc406b2af8c
--     -> 0b4d2b64c4383ea9d43bb127043d94cf526cb373104216efd3dca5923e8a4f36
-- fr-FR: 371a07a1cfcecf831d10016a59d44e35696efd0cf2f3efe8f80db86a9905d779
--     -> 7cf13d9ba3e0fe3070bce67af58dfb7e64cc5bb8128a473e01e1728c54845601
-- es-ES: c913fa90dc1da702d4aa6e97d28029ffa120ab362612557efdfcc1e3d9aab0fb
--     -> ceb93e43ebfc40d450f0ef595f8db961ce7886099ba84c4672a8e495dcc3e66e
-- de-DE: 360105d3bab091140de8b6655034e9eb2f9e87d5aa943b2bba475364b5f195c5
--     -> 353555ea3b7af947235d2d20ed160537b273136d1026e8f56397c431de3bf439
-- pt-PT: e3aad3686055094e08b63e43151074a2b933dca2c5ad9b9500bd1f0e227f928e
--     -> 8745e0b45288b793ae6971c6ba5882a4e433e8c81bf69c9dce20adf4d3335404

BEGIN;

UPDATE public.primebrick_database_patches AS patch
SET content_sha256 = hashes.new_hash
FROM (VALUES
  ('00000000000001_seed_translations_en_gb', 'fcd7ca8b19680dd1ffc8c2f8ee9f9d42e96cda65933dce3804ca680db2447569'),
  ('00000000000002_seed_translations_it_it', '0b4d2b64c4383ea9d43bb127043d94cf526cb373104216efd3dca5923e8a4f36'),
  ('00000000000003_seed_translations_fr_fr', '7cf13d9ba3e0fe3070bce67af58dfb7e64cc5bb8128a473e01e1728c54845601'),
  ('00000000000004_seed_translations_es_es', 'ceb93e43ebfc40d450f0ef595f8db961ce7886099ba84c4672a8e495dcc3e66e'),
  ('00000000000005_seed_translations_de_de', '353555ea3b7af947235d2d20ed160537b273136d1026e8f56397c431de3bf439'),
  ('00000000000006_seed_translations_pt_pt', '8745e0b45288b793ae6971c6ba5882a4e433e8c81bf69c9dce20adf4d3335404')
) AS hashes(patch_id, new_hash)
WHERE patch.patch_id = hashes.patch_id
  AND patch.content_sha256 <> hashes.new_hash;

COMMIT;
