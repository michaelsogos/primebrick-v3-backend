-- Fire-and-forget: Update content_sha256 for 00000000000004_seed_translations_es_es after fixing untranslated English words in regex explainer translations.
-- Date: 2026-09-08
-- Reason: Translated English words (newline, Pipe, Caret, tab) to proper Spanish.
-- Old SHA256: 5a9fa442dac559c007b82818cd77701fd000bf553a8779ce379aec2bfd22882d
-- New SHA256: 095a5f12bcd06432bff731d82da6b92a9abd1b8beeb124ea0457350a118ffea5

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '095a5f12bcd06432bff731d82da6b92a9abd1b8beeb124ea0457350a118ffea5'
WHERE patch_id = '00000000000004_seed_translations_es_es'
  AND content_sha256 <> '095a5f12bcd06432bff731d82da6b92a9abd1b8beeb124ea0457350a118ffea5';
COMMIT;
