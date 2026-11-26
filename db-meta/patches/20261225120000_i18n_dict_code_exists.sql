-- Primebrick: dict-page create-flow (Phase B task 6) — new UI key.
--
-- system.translations (system.* vocabulary):
--   system.entities.dict.code_exists — inline error on the dict composer
--     `code` cell when the debounced uniqueness probe finds a live row
--     carrying the same code (confirm stays gated until it resolves).

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.dict.code_exists', 'en-GB', 'A row with this code already exists', now(), 'migration-dict-code-exists-i18n', now(), 'migration-dict-code-exists-i18n', 1),
  (uuidv7(), 'system.entities.dict.code_exists', 'en-US', 'A row with this code already exists', now(), 'migration-dict-code-exists-i18n', now(), 'migration-dict-code-exists-i18n', 1),
  (uuidv7(), 'system.entities.dict.code_exists', 'it-IT', 'Esiste già una riga con questo codice', now(), 'migration-dict-code-exists-i18n', now(), 'migration-dict-code-exists-i18n', 1),
  (uuidv7(), 'system.entities.dict.code_exists', 'fr-FR', 'Une ligne avec ce code existe déjà', now(), 'migration-dict-code-exists-i18n', now(), 'migration-dict-code-exists-i18n', 1),
  (uuidv7(), 'system.entities.dict.code_exists', 'es-ES', 'Ya existe una fila con este código', now(), 'migration-dict-code-exists-i18n', now(), 'migration-dict-code-exists-i18n', 1),
  (uuidv7(), 'system.entities.dict.code_exists', 'de-DE', 'Eine Zeile mit diesem Code existiert bereits', now(), 'migration-dict-code-exists-i18n', now(), 'migration-dict-code-exists-i18n', 1),
  (uuidv7(), 'system.entities.dict.code_exists', 'pt-PT', 'Já existe uma linha com este código', now(), 'migration-dict-code-exists-i18n', now(), 'migration-dict-code-exists-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
