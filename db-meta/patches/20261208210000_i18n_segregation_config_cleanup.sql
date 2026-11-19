-- Primebrick: i18n segregation — soft-delete the migrated
-- system.settings.config.* keys that nothing still references.
--
-- The US patches (20261208000000_i18n_segregation_config_keys.sql, one
-- per module schema) copied every cited key into {schema}.settings.config.*
-- and repointed their config_entries. This patch removes the orphaned
-- system-side copies — but only keys NO live config_entries row (in ANY
-- schema, discovered dynamically) still cites. Deploy order can never
-- strand a label: a module whose repoint lands later keeps its system
-- keys until it does, and BE-owned keys (public.config_entries cites
-- them: auth.*, infra.*) stay untouched.

CREATE TEMP TABLE _i18n_still_referenced (key text PRIMARY KEY) ON COMMIT DROP;

DO $$
DECLARE
  sch text;
BEGIN
  FOR sch IN
    SELECT table_schema
      FROM information_schema.tables
     WHERE table_name = 'config_entries'
       AND table_schema NOT IN ('pg_catalog', 'information_schema')
  LOOP
    EXECUTE format(
      $f$INSERT INTO _i18n_still_referenced (key)
         SELECT DISTINCT k FROM (
           SELECT label_key AS k FROM %I.config_entries WHERE deleted_at IS NULL
           UNION ALL
           SELECT description_key FROM %I.config_entries WHERE deleted_at IS NULL
         ) refs
         WHERE k LIKE 'system.%%'
         ON CONFLICT DO NOTHING$f$,
      sch, sch);
  END LOOP;
END $$;

UPDATE system.translations
   SET deleted_at = now(),
       deleted_by = 'migration-i18n-segregation',
       version    = version + 1
 WHERE deleted_at IS NULL
   AND key LIKE 'system.settings.config.%'
   AND key NOT IN (SELECT key FROM _i18n_still_referenced);
