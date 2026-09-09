-- Fire-and-forget: Update content_sha256 for 00000000000005_seed_translations_de_de after adding hereYouAreWithDesc translation.
-- Date: 2026-09-09
-- Reason: Added app.smart.regex.ai.hereYouAreWithDesc translation key.
-- Old SHA256: 3243fdb95bc22dcda0b2dc56a1a15aaba3cefcbde1df5f591b1a5b96cf8102fb
-- New SHA256: 9ff1ac3651c59eea3f48ca45bd6232ba8d8e1316fa8e95ac91dfafb615c53c10

BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '9ff1ac3651c59eea3f48ca45bd6232ba8d8e1316fa8e95ac91dfafb615c53c10'
WHERE patch_id = '00000000000005_seed_translations_de_de'
  AND content_sha256 <> '9ff1ac3651c59eea3f48ca45bd6232ba8d8e1316fa8e95ac91dfafb615c53c10';
COMMIT;
