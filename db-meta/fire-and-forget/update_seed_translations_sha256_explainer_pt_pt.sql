-- Fire-and-forget: Update content_sha256 for 00000000000006_seed_translations_pt_pt after adding Smart Regex Explainer translations.
-- Date: 2026-09-08
-- Reason: Added 46 app.smart.regex.explainer.* translation keys for the deterministic regex breakdown.
-- Old SHA256: 6059fd7a8d626f457d8fcb4197af9ab72fcedff664e255fe19cff6d64738a828
-- New SHA256: c8d0fe566c7b5df2603a6ecbe3506e513f501132231fa8744e523ed7aacb4c6f

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = 'c8d0fe566c7b5df2603a6ecbe3506e513f501132231fa8744e523ed7aacb4c6f'
WHERE patch_id = '00000000000006_seed_translations_pt_pt'
  AND content_sha256 <> 'c8d0fe566c7b5df2603a6ecbe3506e513f501132231fa8744e523ed7aacb4c6f';
COMMIT;
