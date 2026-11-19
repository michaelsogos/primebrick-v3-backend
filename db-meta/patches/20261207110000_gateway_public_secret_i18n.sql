-- Primebrick: gateway public-secret config labels — shared registry keys.
--
-- `system.settings.config.auth.gateway_public_secret{,_header}` labels +
-- descriptions for the config-entry registry contract: every service's
-- config row points its label_key here, resolved on `/system/settings/*`
-- routes where only the `system` dict loads. The rows are seeded empty in
-- each service's own config_entries — no rotation engine touches them
-- (static admin-owned trust material, unlike `service_client_shield_secret`).

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  -- gateway_public_secret
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.label', 'en-GB', 'Gateway public secret',   now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.label', 'en-US', 'Gateway public secret',   now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.label', 'it-IT', 'Segreto pubblico del gateway', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.label', 'fr-FR', 'Secret public de la passerelle', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.label', 'es-ES', 'Secreto público de la puerta de enlace', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.label', 'de-DE', 'Öffentliches Gateway-Geheimnis', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.label', 'pt-PT', 'Segredo público do gateway', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.description', 'en-GB', 'Shared secret the gateway sends on forwarded requests — services verify it to trust platform-internal calls.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.description', 'en-US', 'Shared secret the gateway sends on forwarded requests — services verify it to trust platform-internal calls.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.description', 'it-IT', 'Segreto condiviso che il gateway invia sulle richieste inoltrate — i servizi lo verificano per fidarsi delle chiamate interne della piattaforma.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.description', 'fr-FR', 'Secret partagé que la passerelle envoie sur les requêtes relayées — les services le vérifient pour faire confiance aux appels internes de la plateforme.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.description', 'es-ES', 'Secreto compartido que la puerta de enlace envía en las peticiones reenviadas — los servicios lo verifican para confiar en las llamadas internas de la plataforma.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.description', 'de-DE', 'Gemeinsames Geheimnis, das das Gateway bei weitergeleiteten Anfragen mitsendet — Dienste prüfen es, um plattforminternen Aufrufen zu vertrauen.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret.description', 'pt-PT', 'Segredo partilhado que o gateway envia nos pedidos reencaminhados — os serviços verificam-no para confiar nas chamadas internas da plataforma.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),

  -- gateway_public_secret_header
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.label', 'en-GB', 'Gateway public secret header', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.label', 'en-US', 'Gateway public secret header', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.label', 'it-IT', 'Header del segreto pubblico del gateway', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.label', 'fr-FR', 'En-tête du secret public de la passerelle', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.label', 'es-ES', 'Cabecera del secreto público de la puerta de enlace', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.label', 'de-DE', 'Header für das öffentliche Gateway-Geheimnis', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.label', 'pt-PT', 'Cabeçalho do segredo público do gateway', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.description', 'en-GB', 'Name of the HTTP header carrying the gateway public secret.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.description', 'en-US', 'Name of the HTTP header carrying the gateway public secret.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.description', 'it-IT', 'Nome dell''header HTTP che trasporta il segreto pubblico del gateway.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.description', 'fr-FR', 'Nom de l''en-tête HTTP qui transporte le secret public de la passerelle.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.description', 'es-ES', 'Nombre de la cabecera HTTP que transporta el secreto público de la puerta de enlace.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.description', 'de-DE', 'Name des HTTP-Headers, der das öffentliche Gateway-Geheimnis trägt.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1),
  (uuidv7(), 'system.settings.config.auth.gateway_public_secret_header.description', 'pt-PT', 'Nome do cabeçalho HTTP que transporta o segredo público do gateway.', now(), 'migration-gateway-config', now(), 'migration-gateway-config', 1);
