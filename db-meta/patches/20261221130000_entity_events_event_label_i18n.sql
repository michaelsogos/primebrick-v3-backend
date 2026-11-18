-- Primebrick: `app.entity_events.event` — the envelope node's own label
-- (schema:2 payload top-level object). `entity`/`uuids` were labeled in
-- the envelope patch; `event` was missed and fell back to the raw key in
-- the PropNavigator column.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.entity_events.event', 'en-GB', 'Event', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event', 'en-US', 'Event', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event', 'it-IT', 'Evento', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event', 'fr-FR', 'Événement', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event', 'es-ES', 'Evento', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event', 'de-DE', 'Ereignis', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event', 'pt-PT', 'Evento', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
