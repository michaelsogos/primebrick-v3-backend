-- Fire-and-forget: Update content_sha256 for init_database patch in the patch registry.
-- The init patch (00000000000000_init_database.sql) was modified after initial deployment
-- (tables/columns added in later merges). The patch registry still has the old sha256,
-- causing db:migrate to refuse to run with "exists in registry with a different content_sha256".
-- This script updates the registry to match the current file content hash.
-- Run this ONCE on the existing live database. Idempotent: only updates if the hash differs.

BEGIN;

UPDATE public.primebrick_database_patches
SET content_sha256 = '674958841cbf6daad254eae6f93772863bed4976d9c7bdf2dcc41a4fef95a3b5'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '674958841cbf6daad254eae6f93772863bed4976d9c7bdf2dcc41a4fef95a3b5';

COMMIT;
