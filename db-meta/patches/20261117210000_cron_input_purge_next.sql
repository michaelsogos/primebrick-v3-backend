-- CronInput: purge dead hint keys — the editor no longer renders next-run
-- previews (the parent schedule component owns them with its own badge strip
-- via `app.widgets.schedule_spec.next`) and the "5 fields" format line was
-- superseded by the per-field UOM/legend anatomy. Soft-deleted.

UPDATE public.translations
SET deleted_at = now(),
    deleted_by = 'migration-20261117210000'
WHERE key IN ('app.widgets.cron_input.hint.next', 'app.widgets.cron_input.hint.format')
  AND deleted_at IS NULL;
