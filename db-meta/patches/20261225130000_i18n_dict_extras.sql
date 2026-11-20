-- Primebrick: dict-page create-flow (Phase C task 4b/8) — extras sheet UI key.
--
-- system.translations (system.* vocabulary):
--   system.entities.dict.extras — title of the `entity.dictExtras` sheet and
--     tooltip of the per-row `dict-row-extras` CTA: the fields a dict row
--     owns beyond code+label (e.g. inverse label on link types) live there,
--     editable on saved and pending rows alike.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.dict.extras', 'en-GB', 'Additional fields', now(), 'migration-dict-extras-i18n', now(), 'migration-dict-extras-i18n', 1),
  (uuidv7(), 'system.entities.dict.extras', 'en-US', 'Additional fields', now(), 'migration-dict-extras-i18n', now(), 'migration-dict-extras-i18n', 1),
  (uuidv7(), 'system.entities.dict.extras', 'it-IT', 'Campi aggiuntivi', now(), 'migration-dict-extras-i18n', now(), 'migration-dict-extras-i18n', 1),
  (uuidv7(), 'system.entities.dict.extras', 'fr-FR', 'Champs supplémentaires', now(), 'migration-dict-extras-i18n', now(), 'migration-dict-extras-i18n', 1),
  (uuidv7(), 'system.entities.dict.extras', 'es-ES', 'Campos adicionales', now(), 'migration-dict-extras-i18n', now(), 'migration-dict-extras-i18n', 1),
  (uuidv7(), 'system.entities.dict.extras', 'de-DE', 'Zusätzliche Felder', now(), 'migration-dict-extras-i18n', now(), 'migration-dict-extras-i18n', 1),
  (uuidv7(), 'system.entities.dict.extras', 'pt-PT', 'Campos adicionais', now(), 'migration-dict-extras-i18n', now(), 'migration-dict-extras-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
