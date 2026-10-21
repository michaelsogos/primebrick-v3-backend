-- purge `system.entities.crm.*` drift from system.translations.
--
-- crm pipeline page strings were seeded under the system.entities.*
-- vocabulary, but crm is a SERVICE module (primebrick-crm) — its page keys
-- belong to the crm.* namespace, now seeded in crm.translations by the
-- service's own 0003_crm_translations patch. Soft-delete per the
-- TranslationEntityBase contract (Deletable → auto-excluded by the DAL).
-- The FE pipeline page resolves crm.pipeline.* keys after this cleanup.

BEGIN;

UPDATE "system"."translations"
SET
  "deleted_at" = now(),
  "deleted_by" = 'migration-purge-crm-drift',
  "updated_at" = now(),
  "updated_by" = 'migration-purge-crm-drift',
  "version" = "version" + 1
WHERE "key" LIKE 'system.entities.crm.%'
  AND "deleted_at" IS NULL;

COMMIT;
