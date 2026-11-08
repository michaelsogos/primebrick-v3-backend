-- Primebrick: move the audit-line sentence keys to app.common.* (public.translations)
--
-- `system.settings.configurations.lastUpdatedPrefix`/`lastUpdatedByMid` are
-- generic row-audit connectors ("Last updated {when} by {who}") — they belong
-- to the shared audit vocabulary, not the settings/config page namespace.
-- The dict archetype's LINE-3 audit (and any future list item) consumes them
-- from `app.common.*`, the common-UI home. Same move shape as
-- 00000000000007_consolidate_config_error_keys.sql.

BEGIN;

-- ─── 1. New canonical home: app.common.* in public.translations ───
INSERT INTO "public"."translations" ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
  ('app.common.lastUpdatedPrefix', 'en-GB', 'Last updated', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedPrefix', 'en-US', 'Last updated', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedPrefix', 'it-IT', 'Ultimo aggiornamento', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedPrefix', 'fr-FR', 'Dernière mise à jour', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedPrefix', 'es-ES', 'Última actualización', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedPrefix', 'de-DE', 'Zuletzt aktualisiert', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedPrefix', 'pt-PT', 'Última atualização', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedByMid', 'en-GB', 'by', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedByMid', 'en-US', 'by', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedByMid', 'it-IT', 'da', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedByMid', 'fr-FR', 'par', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedByMid', 'es-ES', 'por', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedByMid', 'de-DE', 'von', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1),
  ('app.common.lastUpdatedByMid', 'pt-PT', 'por', now(), 'migration-audit-line-keys', now(), 'migration-audit-line-keys', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── 2. Remove the old settings-namespaced keys ───
DELETE FROM system.translations
WHERE key IN (
  'system.settings.configurations.lastUpdatedPrefix',
  'system.settings.configurations.lastUpdatedByMid'
);

COMMIT;
