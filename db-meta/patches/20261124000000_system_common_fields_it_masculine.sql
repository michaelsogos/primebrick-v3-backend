-- Fix it-IT gender for the shared system-column labels: audit columns refer
-- to an entity of unknown gender → masculine is the correct neutral form
-- (20261119000000 shipped the feminine forms 'Creata/Aggiornata/Eliminata').
-- UPDATE (not upsert): the rows already exist; bump version per translations
-- audit convention.

BEGIN;

UPDATE system.translations SET value = 'Creato il', updated_at = now(), updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.common.fields.created_at' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Creato da', updated_at = now(), updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.common.fields.created_by' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Aggiornato il', updated_at = now(), updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.common.fields.updated_at' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Aggiornato da', updated_at = now(), updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.common.fields.updated_by' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Eliminato il', updated_at = now(), updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.common.fields.deleted_at' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Eliminato da', updated_at = now(), updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.common.fields.deleted_by' AND language = 'it-IT' AND deleted_at IS NULL;

COMMIT;
