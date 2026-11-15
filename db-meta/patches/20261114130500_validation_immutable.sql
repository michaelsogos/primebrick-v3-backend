-- Primebrick: app.common.validation.immutable — the field issue raised by
-- checkEntityFields(partial) when a create-set/frozen column
-- (MetaColumn.immutable, e.g. @Relation edge ends) appears in an update
-- payload. All 7 supported languages.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.validation.immutable', 'en-GB', 'Cannot be changed after creation', now(), 'migration-validation-immutable', now(), 'migration-validation-immutable', 1),
  (uuidv7(), 'app.common.validation.immutable', 'en-US', 'Cannot be changed after creation', now(), 'migration-validation-immutable', now(), 'migration-validation-immutable', 1),
  (uuidv7(), 'app.common.validation.immutable', 'it-IT', 'Non può essere modificato dopo la creazione', now(), 'migration-validation-immutable', now(), 'migration-validation-immutable', 1),
  (uuidv7(), 'app.common.validation.immutable', 'fr-FR', 'Ne peut pas être modifié après la création', now(), 'migration-validation-immutable', now(), 'migration-validation-immutable', 1),
  (uuidv7(), 'app.common.validation.immutable', 'es-ES', 'No se puede modificar después de la creación', now(), 'migration-validation-immutable', now(), 'migration-validation-immutable', 1),
  (uuidv7(), 'app.common.validation.immutable', 'de-DE', 'Kann nach der Erstellung nicht geändert werden', now(), 'migration-validation-immutable', now(), 'migration-validation-immutable', 1),
  (uuidv7(), 'app.common.validation.immutable', 'pt-PT', 'Não pode ser alterado após a criação', now(), 'migration-validation-immutable', now(), 'migration-validation-immutable', 1);
