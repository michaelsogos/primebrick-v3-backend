-- Primebrick: `app.entity_events.entity.delta.old` / `.new` — positional
-- labels for the delta map's two roles. Both props share the COLUMN's
-- leaf schema (format/enum), but the column `x_label_key` cannot label
-- them — it made `old` and `new` render as two identical rows named
-- after the field.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.entity_events.entity.delta.old', 'en-GB', 'Old value', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.old', 'en-US', 'Old value', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.old', 'it-IT', 'Valore precedente', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.old', 'fr-FR', 'Ancienne valeur', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.old', 'es-ES', 'Valor anterior', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.old', 'de-DE', 'Alter Wert', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.old', 'pt-PT', 'Valor anterior', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),

  (uuidv7(), 'app.entity_events.entity.delta.new', 'en-GB', 'New value', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.new', 'en-US', 'New value', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.new', 'it-IT', 'Nuovo valore', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.new', 'fr-FR', 'Nouvelle valeur', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.new', 'es-ES', 'Valor nuevo', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.new', 'de-DE', 'Neuer Wert', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1),
  (uuidv7(), 'app.entity_events.entity.delta.new', 'pt-PT', 'Valor novo', now(), 'migration-entity-events-i18n', now(), 'migration-entity-events-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
