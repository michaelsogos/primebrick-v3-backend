-- Fire-and-forget: Update content_sha256 for 00000000000006_seed_translations_pt_pt after adding AI assistant translations.
-- Date: 2026-09-08
-- Reason: Added app.common.ai.assistant_prefix and app.smart.regex.ai.topic translation keys.
-- Old SHA256: c8d0fe566c7b5df2603a6ecbe3506e513f501132231fa8744e523ed7aacb4c6f
-- New SHA256: b56f558ac42e4836907d0bfc0903726d136e38c82d855611695d8a8b2c44e914

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'b56f558ac42e4836907d0bfc0903726d136e38c82d855611695d8a8b2c44e914'
WHERE patch_id = '00000000000006_seed_translations_pt_pt'
  AND content_sha256 <> 'b56f558ac42e4836907d0bfc0903726d136e38c82d855611695d8a8b2c44e914';
COMMIT;
