-- Primebrick: rule-filter composer + entity-lifecycle emit labels (app.* →
-- public.translations, FE chrome namespace).
--
-- `app.widgets.rule_filter.builder_mode` — the toggle back from the raw
-- JSON editor to the guided field/operator/value composer
-- (`format:"rule_filter"`, job_trigger.filter).
--
-- `app.events.entity_lifecycle_desc` — the census option description for
-- auto-declared `events.<svc>.<entity>.>` emits: the label already names
-- the entity (its `.singular` key), this line states what the channel
-- carries so pickers never show a bare NATS subject.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.widgets.rule_filter.builder_mode', 'en-GB', 'Guided editor', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.widgets.rule_filter.builder_mode', 'en-US', 'Guided editor', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.widgets.rule_filter.builder_mode', 'it-IT', 'Editor guidato', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.widgets.rule_filter.builder_mode', 'fr-FR', 'Éditeur guidé', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.widgets.rule_filter.builder_mode', 'es-ES', 'Editor guiado', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.widgets.rule_filter.builder_mode', 'de-DE', 'Geführter Editor', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.widgets.rule_filter.builder_mode', 'pt-PT', 'Editor guiado', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),

  (uuidv7(), 'app.events.entity_lifecycle_desc', 'en-GB', 'All create, update, delete, restore and purge events on this entity.', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.events.entity_lifecycle_desc', 'en-US', 'All create, update, delete, restore and purge events on this entity.', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.events.entity_lifecycle_desc', 'it-IT', 'Tutti gli eventi di creazione, modifica, eliminazione, ripristino ed eliminazione definitiva su questa entità.', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.events.entity_lifecycle_desc', 'fr-FR', 'Tous les événements de création, mise à jour, suppression, restauration et purge sur cette entité.', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.events.entity_lifecycle_desc', 'es-ES', 'Todos los eventos de creación, actualización, eliminación, restauración y purga sobre esta entidad.', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.events.entity_lifecycle_desc', 'de-DE', 'Alle Erstell-, Aktualisier-, Lösch-, Wiederherstell- und Bereinigungsereignisse dieser Entität.', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1),
  (uuidv7(), 'app.events.entity_lifecycle_desc', 'pt-PT', 'Todos os eventos de criação, atualização, eliminação, restauro e purga sobre esta entidade.', now(), 'migration-rule-filter-i18n', now(), 'migration-rule-filter-i18n', 1);
