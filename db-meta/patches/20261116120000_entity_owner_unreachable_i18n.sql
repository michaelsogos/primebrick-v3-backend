-- Primebrick: entity-owner-unreachable-i18n — seeds the
-- `app.service.entity_owner_unreachable*` pair the entity sheets render
-- when the microservice OWNING the entity cannot be reached (proxy
-- 502/503-scoped, or a census-absent callable owner). The unreachable
-- hero interpolates `{service}` + `{entity}` when the census knows them;
-- `*_generic` is the fallback when the owner can't be named.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  -- app.service.entity_owner_unreachable — named service + entity
  (uuidv7(), 'app.service.entity_owner_unreachable', 'en-GB', '{service} — the service responsible for {entity} — is currently unreachable', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable', 'en-US', '{service} — the service responsible for {entity} — is currently unreachable', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable', 'it-IT', 'Il servizio {service} responsabile di {entity} non è al momento raggiungibile', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable', 'fr-FR', 'Le service {service} responsable de {entity} est actuellement injoignable', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable', 'es-ES', 'El servicio {service} responsable de {entity} no está accesible en este momento', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable', 'de-DE', 'Der Dienst {service}, der für {entity} zuständig ist, ist derzeit nicht erreichbar', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable', 'pt-PT', 'O serviço {service} responsável por {entity} está inacessível no momento', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  -- app.service.entity_owner_unreachable_generic — owner unknown
  (uuidv7(), 'app.service.entity_owner_unreachable_generic', 'en-GB', 'The service responsible for this entity is currently unreachable', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable_generic', 'en-US', 'The service responsible for this entity is currently unreachable', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable_generic', 'it-IT', 'Il servizio responsabile di questa entità non è al momento raggiungibile', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable_generic', 'fr-FR', 'Le service responsable de cette entité est actuellement injoignable', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable_generic', 'es-ES', 'El servicio responsable de esta entidad no está accesible en este momento', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable_generic', 'de-DE', 'Der für diese Entität zuständige Dienst ist derzeit nicht erreichbar', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1),
  (uuidv7(), 'app.service.entity_owner_unreachable_generic', 'pt-PT', 'O serviço responsável por esta entidade está inacessível no momento', now(), 'migration-owner-unreachable', now(), 'migration-owner-unreachable', 1)
ON CONFLICT (key, language) DO NOTHING;
