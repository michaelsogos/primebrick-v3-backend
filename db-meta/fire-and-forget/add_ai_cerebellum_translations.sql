-- Fire-and-forget patch: Translations for the ai_cerebellum entity.
--
-- Keys added (× 6 languages: en-GB, it-IT, fr-FR, es-ES, de-DE, pt-PT):
--   system.entities.ai_cerebellum.title
--   system.entities.ai_cerebellum.fields.{assistant_key,model_id,name,
--     description_key,enable_thinking,temperature,top_p,max_tokens,
--     repetition_penalty,is_default,is_enabled,sort_order,uuid,created_at,
--     created_by,updated_at,updated_by,version,deleted_at,deleted_by}
--   system.entities.ai_cerebellum.thinking.{true,false}
--   system.entities.ai_cerebellum.default.{true,false}
--   system.entities.ai_cerebellum.enabled.{true,false}
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del

BEGIN;

-- ─── system.entities.ai_cerebellum.title ─────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.title', 'en-GB', 'AI Cerebellum', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.title', 'it-IT', 'Cervelletto AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.title', 'fr-FR', 'Cervelet IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.title', 'es-ES', 'Cerebello IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.title', 'de-DE', 'KI-Kleinhirn', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.title', 'pt-PT', 'Cerebelo IA', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── Field labels ────────────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.assistant_key', 'en-GB', 'Assistant', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.assistant_key', 'it-IT', 'Assistente', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.assistant_key', 'fr-FR', 'Assistant', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.assistant_key', 'es-ES', 'Asistente', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.assistant_key', 'de-DE', 'Assistent', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.assistant_key', 'pt-PT', 'Assistente', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.model_id', 'en-GB', 'Model ID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.model_id', 'it-IT', 'ID Modello', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.model_id', 'fr-FR', 'ID Modèle', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.model_id', 'es-ES', 'ID Modelo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.model_id', 'de-DE', 'Modell-ID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.model_id', 'pt-PT', 'ID Modelo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.name', 'en-GB', 'Tuning Name', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.name', 'it-IT', 'Nome Tuning', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.name', 'fr-FR', 'Nom du réglage', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.name', 'es-ES', 'Nombre de ajuste', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.name', 'de-DE', 'Tuning-Name', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.name', 'pt-PT', 'Nome do ajuste', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.description_key', 'en-GB', 'Description Key', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.description_key', 'it-IT', 'Chiave Descrizione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.description_key', 'fr-FR', 'Clé de description', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.description_key', 'es-ES', 'Clave de descripción', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.description_key', 'de-DE', 'Beschreibungsschlüssel', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.description_key', 'pt-PT', 'Chave de descrição', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.enable_thinking', 'en-GB', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.enable_thinking', 'it-IT', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.enable_thinking', 'fr-FR', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.enable_thinking', 'es-ES', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.enable_thinking', 'de-DE', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.enable_thinking', 'pt-PT', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.temperature', 'en-GB', 'Temperature', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.temperature', 'it-IT', 'Temperatura', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.temperature', 'fr-FR', 'Température', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.temperature', 'es-ES', 'Temperatura', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.temperature', 'de-DE', 'Temperatur', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.temperature', 'pt-PT', 'Temperatura', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.top_p', 'en-GB', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.top_p', 'it-IT', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.top_p', 'fr-FR', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.top_p', 'es-ES', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.top_p', 'de-DE', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.top_p', 'pt-PT', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.max_tokens', 'en-GB', 'Max Tokens', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.max_tokens', 'it-IT', 'Token Massimi', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.max_tokens', 'fr-FR', 'Tokens max', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.max_tokens', 'es-ES', 'Tokens máximos', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.max_tokens', 'de-DE', 'Max. Tokens', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.max_tokens', 'pt-PT', 'Tokens máximos', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.repetition_penalty', 'en-GB', 'Repetition Penalty', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.repetition_penalty', 'it-IT', 'Penalità Ripetizione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.repetition_penalty', 'fr-FR', 'Pénalité de répétition', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.repetition_penalty', 'es-ES', 'Penalización de repetición', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.repetition_penalty', 'de-DE', 'Wiederholungsstrafe', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.repetition_penalty', 'pt-PT', 'Penalidade de repetição', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.is_default', 'en-GB', 'Default Tuning', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'it-IT', 'Tuning Predefinito', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'fr-FR', 'Réglage par défaut', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'es-ES', 'Ajuste predeterminado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'de-DE', 'Standard-Tuning', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_default', 'pt-PT', 'Ajuste padrão', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.is_enabled', 'en-GB', 'Enabled', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_enabled', 'it-IT', 'Abilitato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_enabled', 'fr-FR', 'Activé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_enabled', 'es-ES', 'Habilitado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_enabled', 'de-DE', 'Aktiviert', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.is_enabled', 'pt-PT', 'Habilitado', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.sort_order', 'en-GB', 'Sort Order', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.sort_order', 'it-IT', 'Ordinamento', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.sort_order', 'fr-FR', 'Ordre de tri', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.sort_order', 'es-ES', 'Orden de clasificación', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.sort_order', 'de-DE', 'Sortierreihenfolge', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.sort_order', 'pt-PT', 'Ordem de classificação', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── Auditing field labels ───────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.uuid', 'en-GB', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.uuid', 'it-IT', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.uuid', 'fr-FR', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.uuid', 'es-ES', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.uuid', 'de-DE', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.uuid', 'pt-PT', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_at', 'en-GB', 'Created At', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_at', 'it-IT', 'Creato Il', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_at', 'fr-FR', 'Créé le', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_at', 'es-ES', 'Creado el', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_at', 'de-DE', 'Erstellt am', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_at', 'pt-PT', 'Criado em', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_by', 'en-GB', 'Created By', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_by', 'it-IT', 'Creato Da', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_by', 'fr-FR', 'Créé par', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_by', 'es-ES', 'Creado por', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_by', 'de-DE', 'Erstellt von', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.created_by', 'pt-PT', 'Criado por', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_at', 'en-GB', 'Updated At', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_at', 'it-IT', 'Aggiornato Il', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_at', 'fr-FR', 'Mis à jour le', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_at', 'es-ES', 'Actualizado el', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_at', 'de-DE', 'Aktualisiert am', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_at', 'pt-PT', 'Atualizado em', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_by', 'en-GB', 'Updated By', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_by', 'it-IT', 'Aggiornato Da', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_by', 'fr-FR', 'Mis à jour par', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_by', 'es-ES', 'Actualizado por', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_by', 'de-DE', 'Aktualisiert von', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.updated_by', 'pt-PT', 'Atualizado por', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.version', 'en-GB', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.version', 'it-IT', 'Versione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.version', 'fr-FR', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.version', 'es-ES', 'Versión', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.version', 'de-DE', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.version', 'pt-PT', 'Versão', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_at', 'en-GB', 'Deleted At', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_at', 'it-IT', 'Eliminato Il', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_at', 'fr-FR', 'Supprimé le', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_at', 'es-ES', 'Eliminado el', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_at', 'de-DE', 'Gelöscht am', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_at', 'pt-PT', 'Excluído em', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_by', 'en-GB', 'Deleted By', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_by', 'it-IT', 'Eliminato Da', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_by', 'fr-FR', 'Supprimé par', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_by', 'es-ES', 'Eliminado por', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_by', 'de-DE', 'Gelöscht von', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.fields.deleted_by', 'pt-PT', 'Excluído por', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── Badge values ────────────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.thinking.true', 'en-GB', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.true', 'it-IT', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.true', 'fr-FR', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.true', 'es-ES', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.true', 'de-DE', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.true', 'pt-PT', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.false', 'en-GB', 'No Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.false', 'it-IT', 'No Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.false', 'fr-FR', 'No Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.false', 'es-ES', 'No Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.false', 'de-DE', 'No Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.thinking.false', 'pt-PT', 'No Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.true', 'en-GB', 'Default', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.true', 'it-IT', 'Predefinito', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.true', 'fr-FR', 'Par défaut', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.true', 'es-ES', 'Predeterminado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.true', 'de-DE', 'Standard', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.true', 'pt-PT', 'Padrão', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.false', 'en-GB', 'Custom', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.false', 'it-IT', 'Personalizzato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.false', 'fr-FR', 'Personnalisé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.false', 'es-ES', 'Personalizado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.false', 'de-DE', 'Benutzerdefiniert', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.default.false', 'pt-PT', 'Personalizado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.true', 'en-GB', 'Enabled', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.true', 'it-IT', 'Abilitato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.true', 'fr-FR', 'Activé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.true', 'es-ES', 'Habilitado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.true', 'de-DE', 'Aktiviert', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.true', 'pt-PT', 'Habilitado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.false', 'en-GB', 'Disabled', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.false', 'it-IT', 'Disabilitato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.false', 'fr-FR', 'Désactivé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.false', 'es-ES', 'Deshabilitado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.false', 'de-DE', 'Deaktiviert', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.enabled.false', 'pt-PT', 'Desabilitado', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
