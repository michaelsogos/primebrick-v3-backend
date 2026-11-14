-- Primebrick: service-registry-is-enabled-i18n — the `service.record`
-- panel "Enabled" field label (the modules page has no reusable
-- `config.is_enabled` key). All 7 supported languages.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.service_registry.fields.is_enabled', 'en-GB', 'Enabled', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.is_enabled', 'en-US', 'Enabled', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.is_enabled', 'it-IT', 'Abilitato', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.is_enabled', 'fr-FR', 'Activé', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.is_enabled', 'es-ES', 'Habilitado', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.is_enabled', 'de-DE', 'Aktiviert', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.is_enabled', 'pt-PT', 'Ativado', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1);
