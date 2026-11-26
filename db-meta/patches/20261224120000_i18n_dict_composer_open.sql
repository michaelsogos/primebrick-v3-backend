-- Primebrick: dict-page create-flow (Phase A task 2) — new UI key.
--
-- system.translations (system.* vocabulary):
--   system.entities.dict.composer_open — disabled-state reason on the
--     dict NEW toolbar CTA while a composer row is open (single-composer
--     gate: finish the open row before starting another).

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.dict.composer_open', 'en-GB', 'A new row is already open — confirm or discard it first', now(), 'migration-dict-composer-i18n', now(), 'migration-dict-composer-i18n', 1),
  (uuidv7(), 'system.entities.dict.composer_open', 'en-US', 'A new row is already open — confirm or discard it first', now(), 'migration-dict-composer-i18n', now(), 'migration-dict-composer-i18n', 1),
  (uuidv7(), 'system.entities.dict.composer_open', 'it-IT', 'Una nuova riga è già aperta — confermala o scartala prima', now(), 'migration-dict-composer-i18n', now(), 'migration-dict-composer-i18n', 1),
  (uuidv7(), 'system.entities.dict.composer_open', 'fr-FR', 'Une nouvelle ligne est déjà ouverte — confirmez-la ou supprimez-la d’abord', now(), 'migration-dict-composer-i18n', now(), 'migration-dict-composer-i18n', 1),
  (uuidv7(), 'system.entities.dict.composer_open', 'es-ES', 'Ya hay una fila nueva abierta — confírmela o descártela primero', now(), 'migration-dict-composer-i18n', now(), 'migration-dict-composer-i18n', 1),
  (uuidv7(), 'system.entities.dict.composer_open', 'de-DE', 'Eine neue Zeile ist bereits geöffnet — bestätigen oder verwerfen Sie sie zuerst', now(), 'migration-dict-composer-i18n', now(), 'migration-dict-composer-i18n', 1),
  (uuidv7(), 'system.entities.dict.composer_open', 'pt-PT', 'Já existe uma nova linha aberta — confirme-a ou descarte-a primeiro', now(), 'migration-dict-composer-i18n', now(), 'migration-dict-composer-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
