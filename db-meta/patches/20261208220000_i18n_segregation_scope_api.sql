-- Primebrick: i18n segregation — app.common.errors.scope.* seeds for the
-- row/bulk-action scopes cited by the ELT composables. The refs existed
-- only as dead camelCase keys (scope.deleteApi / scope.restoreApi /
-- scope.bulkRestoreApi / scope.customActionApi) — nothing existed to copy,
-- so all values are authored mirroring the sibling `{action}_api` register
-- (bulk_delete_api, duplicate_api). All 7 supported languages.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.errors.scope.delete_api', 'en-GB', 'Delete API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.delete_api', 'en-US', 'Delete API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.delete_api', 'it-IT', 'API eliminazione', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.delete_api', 'fr-FR', 'API suppression', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.delete_api', 'es-ES', 'API eliminación', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.delete_api', 'de-DE', 'Lösch-API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.delete_api', 'pt-PT', 'API eliminação', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.restore_api', 'en-GB', 'Restore API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.restore_api', 'en-US', 'Restore API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.restore_api', 'it-IT', 'API ripristino', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.restore_api', 'fr-FR', 'API restauration', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.restore_api', 'es-ES', 'API restauración', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.restore_api', 'de-DE', 'Wiederherstellungs-API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.restore_api', 'pt-PT', 'API restauro', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.bulk_restore_api', 'en-GB', 'Bulk Restore API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.bulk_restore_api', 'en-US', 'Bulk Restore API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.bulk_restore_api', 'it-IT', 'API ripristino in blocco', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.bulk_restore_api', 'fr-FR', 'API restauration en masse', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.bulk_restore_api', 'es-ES', 'API restauración masiva', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.bulk_restore_api', 'de-DE', 'Massenwiederherstellungs-API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.bulk_restore_api', 'pt-PT', 'API restauro em massa', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.custom_action_api', 'en-GB', 'Custom Action API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.custom_action_api', 'en-US', 'Custom Action API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.custom_action_api', 'it-IT', 'API azione personalizzata', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.custom_action_api', 'fr-FR', 'API action personnalisée', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.custom_action_api', 'es-ES', 'API acción personalizada', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.custom_action_api', 'de-DE', 'Benutzerdefinierte-Aktions-API', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1),
  (uuidv7(), 'app.common.errors.scope.custom_action_api', 'pt-PT', 'API ação personalizada', now(), 'migration-i18n-segregation-scope-api', now(), 'migration-i18n-segregation-scope-api', 1)
ON CONFLICT DO NOTHING;
