-- Language-parity backfill: keys present in en-GB but missing in en-US.
--
-- Every shipped key must exist in every supported language — the E2E
-- module-ownership suite caught `system.entities.page_title.*` rendering as
-- a raw key for en-US users. Backfill en-US from en-GB (same language
-- family; downstream localisation can refine later). INSERT … SELECT so
-- the backfill covers the full drift set (57 keys per schema), not just the
-- one that was spotted. Soft-deleted rows don't count as coverage.

BEGIN;

-- public.translations (app.*)
INSERT INTO "public"."translations"
  ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version")
SELECT
  t."key", 'en-US', t."value", now(), 'migration-en-us-parity', now(), 'migration-en-us-parity', 1
FROM "public"."translations" t
WHERE t."language" = 'en-GB'
  AND t."deleted_at" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "public"."translations" x
    WHERE x."key" = t."key" AND x."language" = 'en-US' AND x."deleted_at" IS NULL
  );

-- system.translations (system.*)
INSERT INTO "system"."translations"
  ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version")
SELECT
  t."key", 'en-US', t."value", now(), 'migration-en-us-parity', now(), 'migration-en-us-parity', 1
FROM "system"."translations" t
WHERE t."language" = 'en-GB'
  AND t."deleted_at" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "system"."translations" x
    WHERE x."key" = t."key" AND x."language" = 'en-US' AND x."deleted_at" IS NULL
  );

COMMIT;
