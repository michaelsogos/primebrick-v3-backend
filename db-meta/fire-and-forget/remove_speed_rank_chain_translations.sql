-- Fire-and-forget: update translation seed patch hashes after removing the
-- unused system.entities.ai_model.speed.rank_chain key (speed popover no longer
-- explains the rank chain — that info lives in the rank popover).
-- Also deletes the now-unused translation rows.
-- Date: 2026-09-16

BEGIN;

DELETE FROM system.translations WHERE key = 'system.entities.ai_model.speed.rank_chain';

UPDATE public.primebrick_database_patches AS patch
SET content_sha256 = hashes.new_hash
FROM (VALUES
  ('00000000000001_seed_translations_en_gb', '6d585f15357059d3b27525882ecd21ab78bbc646c11819fd9f7ce21c4052a815'),
  ('00000000000002_seed_translations_it_it', '58a60f323baa96adc9347b88bd359625213443b655383f2ceefcf0727566100a'),
  ('00000000000003_seed_translations_fr_fr', '6934767519976b8321ccc2c850ec3ee79ed341789f3205d601b6a4d54c210361'),
  ('00000000000004_seed_translations_es_es', '330d879e2aa2a89a108cae21f77a58ca92bf6654bcd74d180aea41bc1fb434bc'),
  ('00000000000005_seed_translations_de_de', '169d757bbdd0edc4d80166ccd2099fae6d8af72a93e19e26ab64dca96826c47e'),
  ('00000000000006_seed_translations_pt_pt', 'ed6fec23a440b0747110ef57d5fe7b5576bfbee6715d3d1ba607a48a600a8ec6')
) AS hashes(patch_id, new_hash)
WHERE patch.patch_id = hashes.patch_id
  AND patch.content_sha256 <> hashes.new_hash;

COMMIT;
