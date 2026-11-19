-- Primebrick: entity-event payload redesign `{event, entity, entities}` —
-- `entities` is the grouped-operation section ("Entità coinvolte"):
-- `batch` (the shared correlation id) and `uuids` (the operation's full
-- row outcome) move OUT of the envelope/root into it. `entity` loses the
-- "state" qualifier — it IS the entity snapshot. The retired leaves
-- (`event.batch`, root `uuids`) are soft-deleted.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.entity_events.entities', 'en-GB', 'Affected entities', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities', 'en-US', 'Affected entities', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities', 'it-IT', 'Entità coinvolte', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities', 'fr-FR', 'Entités concernées', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities', 'es-ES', 'Entidades afectadas', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities', 'de-DE', 'Betroffene Entitäten', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities', 'pt-PT', 'Entidades afetadas', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.batch', 'en-GB', 'Batch UUID', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.batch', 'en-US', 'Batch UUID', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.batch', 'it-IT', 'UUID batch', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.batch', 'fr-FR', 'UUID du lot', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.batch', 'es-ES', 'UUID de lote', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.batch', 'de-DE', 'Batch-UUID', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.batch', 'pt-PT', 'UUID do lote', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.uuids', 'en-GB', 'Affected rows', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.uuids', 'en-US', 'Affected rows', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.uuids', 'it-IT', 'Righe interessate', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.uuids', 'fr-FR', 'Lignes concernées', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.uuids', 'es-ES', 'Filas afectadas', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.uuids', 'de-DE', 'Betroffene Zeilen', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entities.uuids', 'pt-PT', 'Linhas afetadas', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;

UPDATE public.translations SET value = 'Entity', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.entity' AND language = 'en-GB';
UPDATE public.translations SET value = 'Entity', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.entity' AND language = 'en-US';
UPDATE public.translations SET value = 'Entità', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.entity' AND language = 'it-IT';
UPDATE public.translations SET value = 'Entité', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.entity' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Entidad', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.entity' AND language = 'es-ES';
UPDATE public.translations SET value = 'Entität', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.entity' AND language = 'de-DE';
UPDATE public.translations SET value = 'Entidade', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.entity' AND language = 'pt-PT';

UPDATE public.translations
SET deleted_at = now(), deleted_by = 'migration-entity-events-i18n', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key IN ('app.entity_events.event.batch', 'app.entity_events.uuids') AND deleted_at IS NULL;
