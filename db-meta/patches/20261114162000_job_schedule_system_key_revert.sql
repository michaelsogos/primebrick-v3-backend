-- Primebrick: job-schedule-system-key-revert — soft-deletes the three
-- `system.entities.job_schedule.*` keys added by
-- 20261114160000_service_record_panel_i18n. The job_schedule field/value
-- labels are module-owned (`job.entities.job_schedule.*` is the single
-- source — the `system.entities.job_schedule.*` copies were deliberately
-- soft-deleted on 2026-10-20), so the panel consumes the `job.*` keys
-- directly and these system-scope duplicates must not exist.

UPDATE system.translations
SET deleted_at = now(), deleted_by = 'migration-service-record-panel', updated_at = now(), updated_by = 'migration-service-record-panel', version = version + 1
WHERE key IN (
  'system.entities.job_schedule.fields.run_as',
  'system.entities.job_schedule.values.user',
  'system.entities.job_schedule.values.system'
) AND deleted_at IS NULL;
