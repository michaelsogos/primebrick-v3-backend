-- Primebrick: app.common.errors.scope.entity_list / entity_page_init —
-- error-scope labels for the generic `entity_list` page archetype
-- (kind:"list" + entity, host-rendered EntityTablePage — the surface the
-- builtin entity registries like /crm/settings/sequences mount).
-- All 7 supported languages.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.errors.scope.entity_list', 'en-GB', 'Entity List', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_list', 'en-US', 'Entity List', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_list', 'it-IT', 'Elenco entità', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_list', 'fr-FR', 'Liste des entités', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_list', 'es-ES', 'Lista de entidades', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_list', 'de-DE', 'Entitätsliste', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_list', 'pt-PT', 'Lista de entidades', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),

  (uuidv7(), 'app.common.errors.scope.entity_page_init', 'en-GB', 'Entity Page Init', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_page_init', 'en-US', 'Entity Page Init', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_page_init', 'it-IT', 'Inizializzazione pagina entità', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_page_init', 'fr-FR', 'Initialisation de la page entité', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_page_init', 'es-ES', 'Inicialización de la página de entidad', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_page_init', 'de-DE', 'Initialisierung der Entitätsseite', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1),
  (uuidv7(), 'app.common.errors.scope.entity_page_init', 'pt-PT', 'Inicialização da página de entidade', now(), 'migration-entity-list-scope', now(), 'migration-entity-list-scope', 1)
ON CONFLICT (key, language) DO NOTHING;
