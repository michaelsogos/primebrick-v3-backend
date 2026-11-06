-- `system.common.fields.*` — the shared system-column label dict. Auto-derived
-- columns (uuid/id/version + all audit/soft-delete fields) resolve these keys
-- for EVERY entity: one seed, zero per-entity duplication of identical labels.

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.common.fields.uuid', 'en-GB', 'ID', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.uuid', 'en-US', 'ID', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.uuid', 'it-IT', 'ID', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.uuid', 'de-DE', 'ID', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.uuid', 'fr-FR', 'ID', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.uuid', 'es-ES', 'ID', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.uuid', 'pt-PT', 'ID', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.common.fields.id', 'en-GB', 'Internal ID', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.id', 'en-US', 'Internal ID', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.id', 'it-IT', 'ID interno', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.id', 'de-DE', 'Interne ID', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.id', 'fr-FR', 'ID interne', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.id', 'es-ES', 'ID interno', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.id', 'pt-PT', 'ID interno', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.common.fields.version', 'en-GB', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.version', 'en-US', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.version', 'it-IT', 'Versione', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.version', 'de-DE', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.version', 'fr-FR', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.version', 'es-ES', 'Versión', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.version', 'pt-PT', 'Versão', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.common.fields.created_at', 'en-GB', 'Created at', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_at', 'en-US', 'Created at', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_at', 'it-IT', 'Creata il', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_at', 'de-DE', 'Erstellt am', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_at', 'fr-FR', 'Créé le', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_at', 'es-ES', 'Creado el', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_at', 'pt-PT', 'Criado em', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.common.fields.created_by', 'en-GB', 'Created by', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_by', 'en-US', 'Created by', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_by', 'it-IT', 'Creata da', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_by', 'de-DE', 'Erstellt von', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_by', 'fr-FR', 'Créé par', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_by', 'es-ES', 'Creado por', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.created_by', 'pt-PT', 'Criado por', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.common.fields.updated_at', 'en-GB', 'Updated at', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_at', 'en-US', 'Updated at', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_at', 'it-IT', 'Aggiornata il', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_at', 'de-DE', 'Aktualisiert am', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_at', 'fr-FR', 'Mis à jour le', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_at', 'es-ES', 'Actualizado el', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_at', 'pt-PT', 'Atualizado em', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.common.fields.updated_by', 'en-GB', 'Updated by', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_by', 'en-US', 'Updated by', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_by', 'it-IT', 'Aggiornata da', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_by', 'de-DE', 'Aktualisiert von', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_by', 'fr-FR', 'Mis à jour par', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_by', 'es-ES', 'Actualizado por', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.updated_by', 'pt-PT', 'Atualizado por', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.common.fields.deleted_at', 'en-GB', 'Deleted at', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_at', 'en-US', 'Deleted at', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_at', 'it-IT', 'Eliminata il', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_at', 'de-DE', 'Gelöscht am', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_at', 'fr-FR', 'Supprimé le', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_at', 'es-ES', 'Eliminado el', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_at', 'pt-PT', 'Eliminado em', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.common.fields.deleted_by', 'en-GB', 'Deleted by', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_by', 'en-US', 'Deleted by', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_by', 'it-IT', 'Eliminata da', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_by', 'de-DE', 'Gelöscht von', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_by', 'fr-FR', 'Supprimé par', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_by', 'es-ES', 'Eliminado por', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.common.fields.deleted_by', 'pt-PT', 'Eliminado por', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- `exists` operator (trigger filter vocabulary) — the symbol ops already
-- exist; this is the only worded op missing from the canonical set.
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.entities.list.operators.exists', 'en-GB', 'exists', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.entities.list.operators.exists', 'en-US', 'exists', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.entities.list.operators.exists', 'it-IT', 'esiste', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.entities.list.operators.exists', 'de-DE', 'existiert', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.entities.list.operators.exists', 'fr-FR', 'existe', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.entities.list.operators.exists', 'es-ES', 'existe', now(), 'initial-setup', now(), 'initial-setup', 1),
('system.entities.list.operators.exists', 'pt-PT', 'existe', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
