-- Fire-and-forget: Update init patch SHA256 after adding model_levels to type_config.
--
-- Old sha256: fabb299afb19a93748bd7de3bc1310a0954208f08f214ab14ba522bc24766c04
-- New sha256: 90b851fe1629880a2c1550476c1775acf9c9d7f7f573f55ef6dab23c61392073
-- Reason: Added `model_levels` map to `ai_assistant_model` type_config JSON.
--
-- Date: 2026-09-10

BEGIN;

UPDATE public.primebrick_database_patches
SET content_sha256 = '90b851fe1629880a2c1550476c1775acf9c9d7f7f573f55ef6dab23c61392073'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '90b851fe1629880a2c1550476c1775acf9c9d7f7f573f55ef6dab23c61392073';

COMMIT;
