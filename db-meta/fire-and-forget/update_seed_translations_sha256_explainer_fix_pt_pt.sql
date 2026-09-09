-- Fire-and-forget: Update content_sha256 for 00000000000006_seed_translations_pt_pt after fixing untranslated English words in regex explainer translations.
-- Date: 2026-09-08
-- Reason: Translated English words (newline, Backslash, Pipe, Caret, tab, underscore) to proper Portuguese.
-- Old SHA256: b56f558ac42e4836907d0bfc0903726d136e38c82d855611695d8a8b2c44e914
-- New SHA256: 364d3db78405788c7bd6014830358039d23410b0c58b4e719dfbb3f0c3614e3c

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '364d3db78405788c7bd6014830358039d23410b0c58b4e719dfbb3f0c3614e3c'
WHERE patch_id = '00000000000006_seed_translations_pt_pt'
  AND content_sha256 <> '364d3db78405788c7bd6014830358039d23410b0c58b4e719dfbb3f0c3614e3c';
COMMIT;
