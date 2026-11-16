-- Primebrick: api-gateway-module-name-i18n — seeds `system.api.title`,
-- the `label_key` carried by the BE's own service_registry row
-- (`code='api'`, self-enrolled at boot via enrollApiGatewayRow). The
-- `system.<module>.title` convention mirrors `system.settings.title`:
-- keys resolve through the BE-owned `system` dict, so the display name
-- works on every surface without a per-module dict fetch.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.api.title', 'en-GB', 'API Gateway',        now(), 'migration-api-gateway-label', now(), 'migration-api-gateway-label', 1),
  (uuidv7(), 'system.api.title', 'en-US', 'API Gateway',        now(), 'migration-api-gateway-label', now(), 'migration-api-gateway-label', 1),
  (uuidv7(), 'system.api.title', 'it-IT', 'API Gateway',        now(), 'migration-api-gateway-label', now(), 'migration-api-gateway-label', 1),
  (uuidv7(), 'system.api.title', 'de-DE', 'API-Gateway',        now(), 'migration-api-gateway-label', now(), 'migration-api-gateway-label', 1),
  (uuidv7(), 'system.api.title', 'fr-FR', 'Passerelle API',     now(), 'migration-api-gateway-label', now(), 'migration-api-gateway-label', 1),
  (uuidv7(), 'system.api.title', 'es-ES', 'Puerta de enlace API', now(), 'migration-api-gateway-label', now(), 'migration-api-gateway-label', 1),
  (uuidv7(), 'system.api.title', 'pt-PT', 'Gateway de API',     now(), 'migration-api-gateway-label', now(), 'migration-api-gateway-label', 1)
ON CONFLICT (key, language) DO NOTHING;
