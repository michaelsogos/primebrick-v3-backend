-- Primebrick: app.common.version_history_disabled — the disabled-feature
-- watermark served by VersionHistoryPanel when the entity meta reports
-- `read.audit` enabled:false (no /:uuid/audit route registered). Distinct
-- from the transport-error and empty-history states; app.* namespace because
-- it is shared app chrome for EVERY entity, not entity-dict vocabulary.
-- All 7 supported languages.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.version_history_disabled', 'en-GB', 'Version history is not enabled for this entity', now(), 'migration-version-history-disabled', now(), 'migration-version-history-disabled', 1),
  (uuidv7(), 'app.common.version_history_disabled', 'en-US', 'Version history is not enabled for this entity', now(), 'migration-version-history-disabled', now(), 'migration-version-history-disabled', 1),
  (uuidv7(), 'app.common.version_history_disabled', 'it-IT', 'Lo storico delle versioni non è abilitato per questa entità', now(), 'migration-version-history-disabled', now(), 'migration-version-history-disabled', 1),
  (uuidv7(), 'app.common.version_history_disabled', 'fr-FR', 'L''historique des versions n''est pas activé pour cette entité', now(), 'migration-version-history-disabled', now(), 'migration-version-history-disabled', 1),
  (uuidv7(), 'app.common.version_history_disabled', 'es-ES', 'El historial de versiones no está habilitado para esta entidad', now(), 'migration-version-history-disabled', now(), 'migration-version-history-disabled', 1),
  (uuidv7(), 'app.common.version_history_disabled', 'de-DE', 'Der Versionsverlauf ist für diese Entität nicht aktiviert', now(), 'migration-version-history-disabled', now(), 'migration-version-history-disabled', 1),
  (uuidv7(), 'app.common.version_history_disabled', 'pt-PT', 'O histórico de versões não está ativado para esta entidade', now(), 'migration-version-history-disabled', now(), 'migration-version-history-disabled', 1);
