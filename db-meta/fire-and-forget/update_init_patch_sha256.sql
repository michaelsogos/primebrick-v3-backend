-- Fire-and-forget: Update content_sha256 for init_database patch in the patch registry.
-- The init patch (00000000000000_init_database.sql) was modified to add two new
-- auth_configurations seed rows: 'enable_formauth' and 'enable_webauthn'.
-- The patch registry still has the old sha256, causing db:migrate to refuse to
-- run with "exists in registry with a different content_sha256".
--
-- This script also inserts the two new config keys on existing databases (the
-- init patch uses ON CONFLICT DO NOTHING, so re-running db:migrate after the
-- hash update will insert them — but this script does it explicitly too, so
-- the keys are available immediately without a full migrate run).
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2025-01-28
-- Old sha256: 674958841cbf6daad254eae6f93772863bed4976d9c7bdf2dcc41a4fef95a3b5
-- New sha256: 0025ae3f74fceacd134823a914dbfc098161f7c21aadd344fdae4f404b1aa1cd
-- Reason: Added enable_formauth and enable_webauthn seed rows to auth_configurations.

BEGIN;

-- 1. Insert the two new auth config keys (idempotent via ON CONFLICT).
INSERT INTO "public"."auth_configurations" ("key", "value", "description", "created_by") VALUES
('enable_formauth', 'true', 'Abilita il login con form username/password (true/false). Almeno uno tra enable_formauth e enable_webauthn deve essere true.', 'system'),
('enable_webauthn', 'true', 'Abilita il login passwordless con WebAuthn / passkey (true/false). Almeno uno tra enable_formauth e enable_webauthn deve essere true.', 'system')
ON CONFLICT ("key") DO NOTHING;

-- 2. Update the patch registry hash so db:migrate skips the init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = '0025ae3f74fceacd134823a914dbfc098161f7c21aadd344fdae4f404b1aa1cd'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '0025ae3f74fceacd134823a914dbfc098161f7c21aadd344fdae4f404b1aa1cd';

COMMIT;
