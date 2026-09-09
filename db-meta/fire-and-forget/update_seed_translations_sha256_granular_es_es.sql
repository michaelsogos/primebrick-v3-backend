-- Fire-and-forget: Update content_sha256 for 00000000000004_seed_translations_es_es after adding granular regex breakdown translation keys.
-- Date: 2026-09-08
-- Reason: Added app.smart.regex.explainer.char_class_open, char_class_negated_open, char_class_close, char_range translation keys.
-- Old SHA256: 095a5f12bcd06432bff731d82da6b92a9abd1b8beeb124ea0457350a118ffea5
-- New SHA256: bb021e9d7bdd44ea785595df6a360df835cb9406c67861831d6f5a2b06d8524e

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'bb021e9d7bdd44ea785595df6a360df835cb9406c67861831d6f5a2b06d8524e'
WHERE patch_id = '00000000000004_seed_translations_es_es'
  AND content_sha256 <> 'bb021e9d7bdd44ea785595df6a360df835cb9406c67861831d6f5a2b06d8524e';
COMMIT;
