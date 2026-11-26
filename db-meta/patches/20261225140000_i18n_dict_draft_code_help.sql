-- Primebrick: dict-page create-flow (Phase D tasks 9/10) — composer state
-- chip + code-field help, both feeding the DictDraftRow anatomy.
--
-- system.translations (system.* vocabulary):
--   system.entities.dict.draft — the composer's state chip: the row being
--     composed, upstream of the info-accent "to save" pending state.
--   system.entities.dict.hints.code + .code_title — HINT tooltip on the
--     dict `code` column (seeded on every dict list-config): lowercase
--     snake charset + immutability contract, explained to end users.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.dict.draft', 'en-GB', 'Draft', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.draft', 'en-US', 'Draft', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.draft', 'it-IT', 'Bozza', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.draft', 'fr-FR', 'Brouillon', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.draft', 'es-ES', 'Borrador', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.draft', 'de-DE', 'Entwurf', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.draft', 'pt-PT', 'Rascunho', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code', 'en-GB', 'The row''s permanent identifier — lowercase letters, digits and underscores. It cannot be changed after creation.', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code', 'en-US', 'The row''s permanent identifier — lowercase letters, digits and underscores. It cannot be changed after creation.', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code', 'it-IT', 'L''identificativo permanente della riga — lettere minuscole, cifre e underscore. Non può essere modificato dopo la creazione.', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code', 'fr-FR', 'L''identifiant permanent de la ligne — lettres minuscules, chiffres et underscores. Il ne peut pas être modifié après création.', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code', 'es-ES', 'El identificador permanente de la fila — letras minúsculas, dígitos y guiones bajos. No se puede modificar tras la creación.', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code', 'de-DE', 'Die permanente Kennung der Zeile — Kleinbuchstaben, Ziffern und Unterstriche. Sie kann nach der Erstellung nicht geändert werden.', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code', 'pt-PT', 'O identificador permanente da linha — letras minúsculas, dígitos e underscores. Não pode ser alterado após a criação.', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code_title', 'en-GB', 'Row code', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code_title', 'en-US', 'Row code', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code_title', 'it-IT', 'Codice della riga', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code_title', 'fr-FR', 'Code de la ligne', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code_title', 'es-ES', 'Código de la fila', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code_title', 'de-DE', 'Zeilen-Code', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1),
  (uuidv7(), 'system.entities.dict.hints.code_title', 'pt-PT', 'Código da linha', now(), 'migration-dict-draft-help-i18n', now(), 'migration-dict-draft-help-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
