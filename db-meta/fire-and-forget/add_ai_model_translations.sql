-- Fire-and-forget patch: Add translations for the ai_model entity + AI settings page.
--
-- Keys added (× 6 languages: en-GB, it-IT, fr-FR, es-ES, de-DE, pt-PT):
--   system.entities.ai_model.title
--   system.entities.ai_model.fields.model_id
--   system.entities.ai_model.fields.name
--   system.entities.ai_model.fields.label_key
--   system.entities.ai_model.fields.description_key
--   system.entities.ai_model.fields.power_level
--   system.entities.ai_model.fields.is_enabled
--   system.entities.ai_model.fields.enable_thinking
--   system.entities.ai_model.fields.temperature
--   system.entities.ai_model.fields.top_p
--   system.entities.ai_model.fields.max_tokens
--   system.entities.ai_model.fields.repetition_penalty
--   system.entities.ai_model.fields.sort_order
--   system.entities.ai_model.fields.uuid
--   system.entities.ai_model.fields.created_at
--   system.entities.ai_model.fields.updated_at
--   system.entities.ai_model.fields.created_by
--   system.entities.ai_model.fields.updated_by
--   system.entities.ai_model.fields.version
--   system.entities.ai_model.fields.deleted_at
--   system.entities.ai_model.fields.deleted_by
--   system.entities.ai_model.power_level.1
--   system.entities.ai_model.power_level.2
--   system.entities.ai_model.power_level.3
--   system.entities.ai_model.power_level.4
--   system.entities.ai_model.power_level.5
--   system.entities.ai_model.enabled.true
--   system.entities.ai_model.enabled.false
--   system.entities.ai_model.thinking.true
--   system.entities.ai_model.thinking.false
--   system.entities.ai_model.qwen3_1.7b.label
--   system.entities.ai_model.qwen3_1.7b.description
--   system.entities.ai_model.qwen2.5_1.5b.label
--   system.entities.ai_model.qwen2.5_1.5b.description
--   system.entities.ai_model.qwen3_4b.label
--   system.entities.ai_model.qwen3_4b.description
--   system.settings.ai.title
--   system.settings.ai.description
--   system.settings.ai.models_section.title
--   system.settings.ai.cache_section.title
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del

BEGIN;

-- ─── system.entities.ai_model.title ──────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.title', 'en-GB', 'AI Model', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.title', 'it-IT', 'Modello AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.title', 'fr-FR', 'Modèle IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.title', 'es-ES', 'Modelo IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.title', 'de-DE', 'KI-Modell', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.title', 'pt-PT', 'Modelo IA', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── Field labels ────────────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.model_id', 'en-GB', 'Model ID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.model_id', 'it-IT', 'ID Modello', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.model_id', 'fr-FR', 'ID Modèle', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.model_id', 'es-ES', 'ID Modelo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.model_id', 'de-DE', 'Modell-ID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.model_id', 'pt-PT', 'ID Modelo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.name', 'en-GB', 'Name', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.name', 'it-IT', 'Nome', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.name', 'fr-FR', 'Nom', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.name', 'es-ES', 'Nombre', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.name', 'de-DE', 'Name', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.name', 'pt-PT', 'Nome', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.power_level', 'en-GB', 'Power Level', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.power_level', 'it-IT', 'Livello di Potenza', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.power_level', 'fr-FR', 'Niveau de Puissance', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.power_level', 'es-ES', 'Nivel de Potencia', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.power_level', 'de-DE', 'Leistungsstufe', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.power_level', 'pt-PT', 'Nível de Potência', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.is_enabled', 'en-GB', 'Enabled', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.is_enabled', 'it-IT', 'Abilitato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.is_enabled', 'fr-FR', 'Activé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.is_enabled', 'es-ES', 'Habilitado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.is_enabled', 'de-DE', 'Aktiviert', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.is_enabled', 'pt-PT', 'Ativado', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.enable_thinking', 'en-GB', 'Thinking Mode', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.enable_thinking', 'it-IT', 'Modalità Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.enable_thinking', 'fr-FR', 'Mode Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.enable_thinking', 'es-ES', 'Modo Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.enable_thinking', 'de-DE', 'Thinking-Modus', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.enable_thinking', 'pt-PT', 'Modo Thinking', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.temperature', 'en-GB', 'Temperature', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.temperature', 'it-IT', 'Temperatura', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.temperature', 'fr-FR', 'Température', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.temperature', 'es-ES', 'Temperatura', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.temperature', 'de-DE', 'Temperatur', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.temperature', 'pt-PT', 'Temperatura', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.top_p', 'en-GB', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.top_p', 'it-IT', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.top_p', 'fr-FR', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.top_p', 'es-ES', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.top_p', 'de-DE', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.top_p', 'pt-PT', 'Top P', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.max_tokens', 'en-GB', 'Max Tokens', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.max_tokens', 'it-IT', 'Token Massimi', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.max_tokens', 'fr-FR', 'Tokens Max', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.max_tokens', 'es-ES', 'Tokens Máx', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.max_tokens', 'de-DE', 'Max Tokens', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.max_tokens', 'pt-PT', 'Tokens Máx', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.repetition_penalty', 'en-GB', 'Repetition Penalty', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.repetition_penalty', 'it-IT', 'Penalità Ripetizione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.repetition_penalty', 'fr-FR', 'Pénalité de Répétition', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.repetition_penalty', 'es-ES', 'Penalización de Repetición', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.repetition_penalty', 'de-DE', 'Wiederholungsstrafe', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.repetition_penalty', 'pt-PT', 'Penalidade de Repetição', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.sort_order', 'en-GB', 'Sort Order', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.sort_order', 'it-IT', 'Ordine', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.sort_order', 'fr-FR', 'Ordre de Tri', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.sort_order', 'es-ES', 'Orden', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.sort_order', 'de-DE', 'Sortierreihenfolge', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.sort_order', 'pt-PT', 'Ordem', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── Audit field labels (shared pattern) ────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.uuid', 'en-GB', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.uuid', 'it-IT', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.uuid', 'fr-FR', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.uuid', 'es-ES', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.uuid', 'de-DE', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.uuid', 'pt-PT', 'UUID', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.label_key', 'en-GB', 'Label Key', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.label_key', 'it-IT', 'Chiave Etichetta', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.label_key', 'fr-FR', 'Clé d''Étiquette', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.label_key', 'es-ES', 'Clave de Etiqueta', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.label_key', 'de-DE', 'Bezeichnungsschlüssel', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.label_key', 'pt-PT', 'Chave de Etiqueta', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.description_key', 'en-GB', 'Description Key', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.description_key', 'it-IT', 'Chiave Descrizione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.description_key', 'fr-FR', 'Clé de Description', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.description_key', 'es-ES', 'Clave de Descripción', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.description_key', 'de-DE', 'Beschreibungsschlüssel', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.description_key', 'pt-PT', 'Chave de Descrição', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.created_at', 'en-GB', 'Created At', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_at', 'it-IT', 'Creato Il', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_at', 'fr-FR', 'Créé Le', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_at', 'es-ES', 'Creado El', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_at', 'de-DE', 'Erstellt Am', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_at', 'pt-PT', 'Criado Em', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.updated_at', 'en-GB', 'Updated At', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_at', 'it-IT', 'Aggiornato Il', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_at', 'fr-FR', 'Mis à Jour Le', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_at', 'es-ES', 'Actualizado El', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_at', 'de-DE', 'Aktualisiert Am', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_at', 'pt-PT', 'Atualizado Em', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.created_by', 'en-GB', 'Created By', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_by', 'it-IT', 'Creato Da', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_by', 'fr-FR', 'Créé Par', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_by', 'es-ES', 'Creado Por', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_by', 'de-DE', 'Erstellt Von', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.created_by', 'pt-PT', 'Criado Por', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.updated_by', 'en-GB', 'Updated By', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_by', 'it-IT', 'Aggiornato Da', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_by', 'fr-FR', 'Mis à Jour Par', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_by', 'es-ES', 'Actualizado Por', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_by', 'de-DE', 'Aktualisiert Von', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.updated_by', 'pt-PT', 'Atualizado Por', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.version', 'en-GB', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.version', 'it-IT', 'Versione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.version', 'fr-FR', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.version', 'es-ES', 'Versión', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.version', 'de-DE', 'Version', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.version', 'pt-PT', 'Versão', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.deleted_at', 'en-GB', 'Deleted At', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_at', 'it-IT', 'Eliminato Il', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_at', 'fr-FR', 'Supprimé Le', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_at', 'es-ES', 'Eliminado El', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_at', 'de-DE', 'Gelöscht Am', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_at', 'pt-PT', 'Eliminado Em', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.deleted_by', 'en-GB', 'Deleted By', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_by', 'it-IT', 'Eliminato Da', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_by', 'fr-FR', 'Supprimé Par', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_by', 'es-ES', 'Eliminado Por', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_by', 'de-DE', 'Gelöscht Von', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.deleted_by', 'pt-PT', 'Eliminado Por', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── Power level badge labels ───────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.power_level.1', 'en-GB', 'Lowest', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.1', 'it-IT', 'Minimo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.1', 'fr-FR', 'Le Plus Bas', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.1', 'es-ES', 'Más Bajo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.1', 'de-DE', 'Niedrigste', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.1', 'pt-PT', 'Mais Baixo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.power_level.2', 'en-GB', 'Lower', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.2', 'it-IT', 'Basso', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.2', 'fr-FR', 'Bas', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.2', 'es-ES', 'Bajo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.2', 'de-DE', 'Niedrig', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.2', 'pt-PT', 'Baixo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.power_level.3', 'en-GB', 'Average', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.3', 'it-IT', 'Medio', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.3', 'fr-FR', 'Moyen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.3', 'es-ES', 'Medio', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.3', 'de-DE', 'Mittel', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.3', 'pt-PT', 'Médio', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.power_level.4', 'en-GB', 'Higher', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.4', 'it-IT', 'Alto', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.4', 'fr-FR', 'Élevé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.4', 'es-ES', 'Alto', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.4', 'de-DE', 'Hoch', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.4', 'pt-PT', 'Alto', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.power_level.5', 'en-GB', 'Highest', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.5', 'it-IT', 'Massimo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.5', 'fr-FR', 'Le Plus Élevé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.5', 'es-ES', 'Más Alto', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.5', 'de-DE', 'Höchste', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.5', 'pt-PT', 'Mais Alto', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── Enabled / Thinking badge labels ────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.enabled.true', 'en-GB', 'Enabled', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.true', 'it-IT', 'Abilitato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.true', 'fr-FR', 'Activé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.true', 'es-ES', 'Habilitado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.true', 'de-DE', 'Aktiviert', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.true', 'pt-PT', 'Ativado', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.enabled.false', 'en-GB', 'Disabled', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.false', 'it-IT', 'Disabilitato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.false', 'fr-FR', 'Désactivé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.false', 'es-ES', 'Deshabilitado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.false', 'de-DE', 'Deaktiviert', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.enabled.false', 'pt-PT', 'Desativado', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.thinking.true', 'en-GB', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.true', 'it-IT', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.true', 'fr-FR', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.true', 'es-ES', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.true', 'de-DE', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.true', 'pt-PT', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.thinking.false', 'en-GB', 'No Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.false', 'it-IT', 'No Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.false', 'fr-FR', 'Sans Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.false', 'es-ES', 'Sin Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.false', 'de-DE', 'Kein Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.thinking.false', 'pt-PT', 'Sem Thinking', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── Model tier labels (reused by the ai_assistant_model dropdown) ──
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.qwen3_1.7b.label', 'en-GB', 'Qwen3 1.7B (Lower)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.label', 'it-IT', 'Qwen3 1.7B (Basso)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.label', 'fr-FR', 'Qwen3 1.7B (Bas)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.label', 'es-ES', 'Qwen3 1.7B (Bajo)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.label', 'de-DE', 'Qwen3 1.7B (Niedrig)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.label', 'pt-PT', 'Qwen3 1.7B (Baixo)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.qwen3_1.7b.description', 'en-GB', 'Compact hybrid-thinking model. Good for simple regex patterns. Uses thinking mode for better reasoning.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.description', 'it-IT', 'Modello compatto hybrid-thinking. Adatto a pattern regex semplici. Usa la modalità thinking per un ragionamento migliore.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.description', 'fr-FR', 'Modèle hybride compact. Adapté aux patterns regex simples. Utilise le mode thinking pour un meilleur raisonnement.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.description', 'es-ES', 'Modelo híbrido compacto. Adecuado para patrones regex simples. Usa el modo thinking para mejor razonamiento.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.description', 'de-DE', 'Kompaktes Hybrid-Modell. Gut für einfache Regex-Pattern. Verwendet Thinking-Modus für besseres Reasoning.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_1.7b.description', 'pt-PT', 'Modelo híbrido compacto. Adequado para padrões regex simples. Usa o modo thinking para melhor raciocínio.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.qwen2.5_1.5b.label', 'en-GB', 'Qwen2.5 1.5B (Average)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.label', 'it-IT', 'Qwen2.5 1.5B (Medio)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.label', 'fr-FR', 'Qwen2.5 1.5B (Moyen)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.label', 'es-ES', 'Qwen2.5 1.5B (Medio)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.label', 'de-DE', 'Qwen2.5 1.5B (Mittel)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.label', 'pt-PT', 'Qwen2.5 1.5B (Médio)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.qwen2.5_1.5b.description', 'en-GB', 'Instruct-tuned model without thinking. Fast and deterministic. Good for straightforward regex patterns.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.description', 'it-IT', 'Modello Instruct senza thinking. Veloce e deterministico. Adatto a pattern regex diretti.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.description', 'fr-FR', 'Modèle Instruct sans thinking. Rapide et déterministe. Adapté aux patterns regex directs.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.description', 'es-ES', 'Modelo Instruct sin thinking. Rápido y determinista. Adecuado para patrones regex directos.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.description', 'de-DE', 'Instruct-Modell ohne Thinking. Schnell und deterministisch. Gut für direkte Regex-Pattern.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen2.5_1.5b.description', 'pt-PT', 'Modelo Instruct sem thinking. Rápido e determinístico. Adequado para padrões regex diretos.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.qwen3_4b.label', 'en-GB', 'Qwen3 4B (Higher)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.label', 'it-IT', 'Qwen3 4B (Alto)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.label', 'fr-FR', 'Qwen3 4B (Élevé)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.label', 'es-ES', 'Qwen3 4B (Alto)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.label', 'de-DE', 'Qwen3 4B (Hoch)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.label', 'pt-PT', 'Qwen3 4B (Alto)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.qwen3_4b.description', 'en-GB', 'Larger hybrid-thinking model. Better reasoning for complex regex patterns. Requires more VRAM.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.description', 'it-IT', 'Modello hybrid-thinking più grande. Ragionamento migliore per pattern regex complessi. Richiede più VRAM.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.description', 'fr-FR', 'Modèle hybride plus grand. Meilleur raisonnement pour les patterns regex complexes. Nécessite plus de VRAM.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.description', 'es-ES', 'Modelo híbrido más grande. Mejor razonamiento para patrones regex complejos. Requiere más VRAM.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.description', 'de-DE', 'Größeres Hybrid-Modell. Besseres Reasoning für komplexe Regex-Pattern. Erfordert mehr VRAM.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.qwen3_4b.description', 'pt-PT', 'Modelo híbrido maior. Melhor raciocínio para padrões regex complexos. Requer mais VRAM.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── AI Settings page labels ────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.title', 'en-GB', 'AI Settings', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.title', 'it-IT', 'Impostazioni AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.title', 'fr-FR', 'Paramètres IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.title', 'es-ES', 'Configuración IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.title', 'de-DE', 'KI-Einstellungen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.title', 'pt-PT', 'Configurações IA', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.description', 'en-GB', 'Manage AI models, browser cache, and other AI-related configuration.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.description', 'it-IT', 'Gestisci modelli AI, cache del browser e altra configurazione AI.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.description', 'fr-FR', 'Gérer les modèles IA, le cache du navigateur et d''autres configurations IA.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.description', 'es-ES', 'Gestionar modelos IA, caché del navegador y otra configuración de IA.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.description', 'de-DE', 'Verwalten Sie KI-Modelle, Browser-Cache und andere KI-Konfiguration.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.description', 'pt-PT', 'Gerir modelos IA, cache do navegador e outra configuração de IA.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.models_section.title', 'en-GB', 'AI Models', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.title', 'it-IT', 'Modelli AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.title', 'fr-FR', 'Modèles IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.title', 'es-ES', 'Modelos IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.title', 'de-DE', 'KI-Modelle', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.title', 'pt-PT', 'Modelos IA', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.cache_section.title', 'en-GB', 'Model Cache Management', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cache_section.title', 'it-IT', 'Gestione Cache Modelli', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cache_section.title', 'fr-FR', 'Gestion du Cache des Modèles', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cache_section.title', 'es-ES', 'Gestión de Caché de Modelos', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cache_section.title', 'de-DE', 'Modell-Cache-Verwaltung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cache_section.title', 'pt-PT', 'Gestão de Cache de Modelos', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.tabs.ai (settings nav tab label) ───────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.tabs.ai', 'en-GB', 'AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.ai', 'it-IT', 'AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.ai', 'fr-FR', 'IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.ai', 'es-ES', 'IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.ai', 'de-DE', 'KI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.ai', 'pt-PT', 'IA', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.orphaned_title (FE-only key, but BE-owned) ──
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.orphaned_title', 'en-GB', 'Cached models not in catalog', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.orphaned_title', 'it-IT', 'Modelli in cache non censiti', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.orphaned_title', 'fr-FR', 'Modèles en cache non répertoriés', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.orphaned_title', 'es-ES', 'Modelos en caché no catalogados', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.orphaned_title', 'de-DE', 'Zwischengespeicherte Modelle nicht im Katalog', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.orphaned_title', 'pt-PT', 'Modelos em cache não catalogados', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.censused_title (FE-only key, but BE-owned) ──
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.censused_title', 'en-GB', 'Censused models', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.censused_title', 'it-IT', 'Modelli censiti', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.censused_title', 'fr-FR', 'Modèles répertoriés', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.censused_title', 'es-ES', 'Modelos catalogados', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.censused_title', 'de-DE', 'Katalogisierte Modelle', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.censused_title', 'pt-PT', 'Modelos catalogados', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
