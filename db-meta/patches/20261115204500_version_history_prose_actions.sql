-- Primebrick: version-history title becomes prose — "{action} {by} {actor}".
-- The action vocabulary is the closed platform enum AuditAction
-- (INSERT/UPDATE/SOFT_DELETE/HARD_DELETE/RESTORE/CLONE), so the generic
-- system.entities.version_history.actions.* block is the one served truth:
-- values move nouns → participles so titles read "Creato da <actor>".
-- Adds actions.clone (emitted by the enum but never seeded) and the
-- version_history.by connector (da/by/par/por/von/por). Soft-deletes the
-- unreachable create/delete alias seeds (the enum emits neither).
-- All 7 supported languages.

UPDATE system.translations SET value = 'Created',                 updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.insert'      AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Updated',                 updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.update'      AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Deleted',                 updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.soft_delete' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Permanently deleted',     updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.hard_delete' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Restored',                updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.restore'     AND language = 'en-GB' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Created',                 updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.insert'      AND language = 'en-US' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Updated',                 updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.update'      AND language = 'en-US' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Deleted',                 updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.soft_delete' AND language = 'en-US' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Permanently deleted',     updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.hard_delete' AND language = 'en-US' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Restored',                updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.restore'     AND language = 'en-US' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Creato',                  updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.insert'      AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Modificato',              updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.update'      AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Eliminato',               updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.soft_delete' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Eliminato definitivamente', updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.hard_delete' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Ripristinato',            updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.restore'     AND language = 'it-IT' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Creado',                  updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.insert'      AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Actualizado',             updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.update'      AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Eliminado',               updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.soft_delete' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Eliminado definitivamente', updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.hard_delete' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Restaurado',              updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.restore'     AND language = 'es-ES' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Créé',                    updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.insert'      AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Mis à jour',              updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.update'      AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Supprimé',                updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.soft_delete' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Supprimé définitivement', updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.hard_delete' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Restauré',                updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.restore'     AND language = 'fr-FR' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Erstellt',                updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.insert'      AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Aktualisiert',            updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.update'      AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Gelöscht',                updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.soft_delete' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Endgültig gelöscht',      updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.hard_delete' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Wiederhergestellt',       updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.restore'     AND language = 'de-DE' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Criado',                  updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.insert'      AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Atualizado',              updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.update'      AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Eliminado',               updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.soft_delete' AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Eliminado definitivamente', updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.hard_delete' AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Restaurado',              updated_at = now(), updated_by = 'migration-vh-prose', version = version + 1 WHERE key = 'system.entities.version_history.actions.restore'     AND language = 'pt-PT' AND deleted_at IS NULL;

-- actions.clone — the enum emits it since clone-as-audit-action landed,
-- but the key was never seeded.
INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.version_history.actions.clone', 'en-GB', 'Cloned',    now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.actions.clone', 'en-US', 'Cloned',    now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.actions.clone', 'it-IT', 'Clonato',   now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.actions.clone', 'es-ES', 'Clonado',   now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.actions.clone', 'fr-FR', 'Cloné',     now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.actions.clone', 'de-DE', 'Geklont',   now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.actions.clone', 'pt-PT', 'Clonado',   now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1);

-- version_history.by — the actor connector in the prose title
-- ("{action} {by} {actor}"); all supported locales keep the connector
-- between action and actor.
INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.version_history.by', 'en-GB', 'by',   now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.by', 'en-US', 'by',   now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.by', 'it-IT', 'da',   now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.by', 'es-ES', 'por',  now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.by', 'fr-FR', 'par',  now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.by', 'de-DE', 'von',  now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1),
  (uuidv7(), 'system.entities.version_history.by', 'pt-PT', 'por',  now(), 'migration-vh-prose', now(), 'migration-vh-prose', 1);

-- Alias seeds the AuditAction enum never emits — the canonical keys are
-- insert (creation) and soft_delete (deletion). Removing the parallel
-- vocabulary so the generic block stays the one served truth.
UPDATE system.translations SET deleted_at = now(), deleted_by = 'migration-vh-prose', version = version + 1
WHERE key IN (
  'system.entities.version_history.actions.create',
  'system.entities.version_history.actions.delete'
) AND deleted_at IS NULL;
