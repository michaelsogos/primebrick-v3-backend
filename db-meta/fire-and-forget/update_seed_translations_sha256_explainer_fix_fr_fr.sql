-- Fire-and-forget: Update content_sha256 for 00000000000003_seed_translations_fr_fr after fixing untranslated English words in regex explainer translations.
-- Date: 2026-09-08
-- Reason: Translated English words (newline, Set, Backslash, Pipe, Caret, Slash, tab, underscore) to proper French.
-- Old SHA256: 766833cbefa040c6d9dda418cd4c716af7149eca3cd7bb21294eb5405a2a44b9
-- New SHA256: 2511f7379e7a4a8a921243ce7b27fd95ec3c75eadd273888d716eac9f8f3ea4f

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '2511f7379e7a4a8a921243ce7b27fd95ec3c75eadd273888d716eac9f8f3ea4f'
WHERE patch_id = '00000000000003_seed_translations_fr_fr'
  AND content_sha256 <> '2511f7379e7a4a8a921243ce7b27fd95ec3c75eadd273888d716eac9f8f3ea4f';
COMMIT;
