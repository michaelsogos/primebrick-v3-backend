-- Primebrick: entity-event envelope labels (app.entity_events.* →
-- public.translations, FE chrome namespace).
--
-- The schema:2 event payload nests the envelope under `event` and the
-- entity state under `entity`; the rule-filter composer + payload-map
-- navigator read `x_label_key` off the declared payload_schema so every
-- envelope prop shows a translated label instead of a raw key.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.entity_events.event.service', 'en-GB', 'Service', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.service', 'en-US', 'Service', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.service', 'it-IT', 'Servizio', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.service', 'fr-FR', 'Service', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.service', 'es-ES', 'Servicio', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.service', 'de-DE', 'Dienst', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.service', 'pt-PT', 'Serviço', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.event.subject', 'en-GB', 'Subject', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.subject', 'en-US', 'Subject', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.subject', 'it-IT', 'Soggetto', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.subject', 'fr-FR', 'Sujet', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.subject', 'es-ES', 'Asunto', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.subject', 'de-DE', 'Betreff', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.subject', 'pt-PT', 'Assunto', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.event.emitted_at', 'en-GB', 'Emitted at', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_at', 'en-US', 'Emitted at', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_at', 'it-IT', 'Emesso il', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_at', 'fr-FR', 'Émis le', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_at', 'es-ES', 'Emitido el', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_at', 'de-DE', 'Ausgegeben am', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_at', 'pt-PT', 'Emitido em', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.event.emitted_by', 'en-GB', 'Emitted by', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_by', 'en-US', 'Emitted by', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_by', 'it-IT', 'Emesso da', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_by', 'fr-FR', 'Émis par', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_by', 'es-ES', 'Emitido por', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_by', 'de-DE', 'Ausgegeben von', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.emitted_by', 'pt-PT', 'Emitido por', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.event.action', 'en-GB', 'Action', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.action', 'en-US', 'Action', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.action', 'it-IT', 'Azione', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.action', 'fr-FR', 'Action', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.action', 'es-ES', 'Acción', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.action', 'de-DE', 'Aktion', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.action', 'pt-PT', 'Ação', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.event.entity', 'en-GB', 'Entity', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.entity', 'en-US', 'Entity', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.entity', 'it-IT', 'Entità', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.entity', 'fr-FR', 'Entité', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.entity', 'es-ES', 'Entidad', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.entity', 'de-DE', 'Entität', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.entity', 'pt-PT', 'Entidade', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.event.uuid', 'en-GB', 'Row uuid', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.uuid', 'en-US', 'Row uuid', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.uuid', 'it-IT', 'Uuid riga', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.uuid', 'fr-FR', 'Uuid ligne', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.uuid', 'es-ES', 'Uuid fila', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.uuid', 'de-DE', 'Zeilen-Uuid', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.uuid', 'pt-PT', 'Uuid linha', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.event.version', 'en-GB', 'Row version', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.version', 'en-US', 'Row version', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.version', 'it-IT', 'Versione riga', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.version', 'fr-FR', 'Version ligne', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.version', 'es-ES', 'Versión fila', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.version', 'de-DE', 'Zeilenversion', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.version', 'pt-PT', 'Versão linha', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.event.batch', 'en-GB', 'Batch', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.batch', 'en-US', 'Batch', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.batch', 'it-IT', 'Batch', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.batch', 'fr-FR', 'Lot', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.batch', 'es-ES', 'Lote', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.batch', 'de-DE', 'Batch', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.event.batch', 'pt-PT', 'Lote', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.entity', 'en-GB', 'Entity state', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity', 'en-US', 'Entity state', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity', 'it-IT', 'Stato entità', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity', 'fr-FR', 'État entité', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity', 'es-ES', 'Estado entidad', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity', 'de-DE', 'Entitätszustand', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity', 'pt-PT', 'Estado entidade', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.entity.before', 'en-GB', 'Before', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.before', 'en-US', 'Before', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.before', 'it-IT', 'Prima', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.before', 'fr-FR', 'Avant', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.before', 'es-ES', 'Antes', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.before', 'de-DE', 'Vorher', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.before', 'pt-PT', 'Antes', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.entity.after', 'en-GB', 'After', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.after', 'en-US', 'After', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.after', 'it-IT', 'Dopo', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.after', 'fr-FR', 'Après', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.after', 'es-ES', 'Después', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.after', 'de-DE', 'Nachher', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.after', 'pt-PT', 'Depois', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.entity.delta', 'en-GB', 'Changed fields', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta', 'en-US', 'Changed fields', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta', 'it-IT', 'Campi modificati', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta', 'fr-FR', 'Champs modifiés', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta', 'es-ES', 'Campos modificados', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta', 'de-DE', 'Geänderte Felder', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta', 'pt-PT', 'Campos alterados', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.uuids', 'en-GB', 'Affected rows', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.uuids', 'en-US', 'Affected rows', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.uuids', 'it-IT', 'Righe interessate', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.uuids', 'fr-FR', 'Lignes concernées', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.uuids', 'es-ES', 'Filas afectadas', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.uuids', 'de-DE', 'Betroffene Zeilen', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.uuids', 'pt-PT', 'Linhas afetadas', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
