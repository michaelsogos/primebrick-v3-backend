-- Fire-and-forget patch: Add `ai_assistant_model` config + AI models values_source translations.
--
-- Keys added (11 total, × 6 languages = 66 INSERTs):
--   system.settings.config.auth.ai_assistant_model.label
--   system.settings.config.auth.ai_assistant_model.description
--   system.settings.config.auth.ai_assistant_model.qwen3_1.7b.label
--   system.settings.config.auth.ai_assistant_model.qwen3_1.7b.description
--   system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.label
--   system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.description
--   system.settings.config.auth.ai_assistant_model.qwen3_4b.label
--   system.settings.config.auth.ai_assistant_model.qwen3_4b.description
--   system.settings.config.auth.group.ai_features
--   system.settings.config.typeConfig.valuesSource.ai_models
--   app.smart.regex.ai.modelNotConfigured
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
-- The BE caches translations in Redis with key pattern:
--   translations:i18n:system:{language}
-- TTL is 6 hours, but to see the changes immediately, run:
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del

BEGIN;

-- ─── system.settings.config.auth.ai_assistant_model.label ──────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.auth.ai_assistant_model.label', 'en-GB', 'AI Assistant Model', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.label', 'it-IT', 'Modello Assistente AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.label', 'fr-FR', 'Modèle d''Assistant IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.label', 'es-ES', 'Modelo de Asistente IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.label', 'de-DE', 'KI-Assistentenmodell', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.label', 'pt-PT', 'Modelo do Assistente IA', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.config.auth.ai_assistant_model.description ─────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.auth.ai_assistant_model.description', 'en-GB', 'Select the WebLLM model used by the Smart Regex AI assistant. Runs entirely in-browser via WebGPU.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.description', 'it-IT', 'Seleziona il modello WebLLM utilizzato dall''assistente AI Smart Regex. Esegue interamente nel browser via WebGPU.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.description', 'fr-FR', 'Sélectionnez le modèle WebLLM utilisé par l''assistant IA Smart Regex. S''exécute entièrement dans le navigateur via WebGPU.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.description', 'es-ES', 'Selecciona el modelo WebLLM utilizado por el asistente IA Smart Regex. Se ejecuta completamente en el navegador vía WebGPU.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.description', 'de-DE', 'Wählen Sie das WebLLM-Modell, das vom Smart Regex KI-Assistenten verwendet wird. Läuft vollständig im Browser über WebGPU.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.description', 'pt-PT', 'Selecione o modelo WebLLM utilizado pelo assistente IA Smart Regex. Executa inteiramente no navegador via WebGPU.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.config.auth.ai_assistant_model.qwen3_1.7b.label ── (Lower tier)
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.label', 'en-GB', 'Qwen3 1.7B (Lower)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.label', 'it-IT', 'Qwen3 1.7B (Basso)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.label', 'fr-FR', 'Qwen3 1.7B (Bas)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.label', 'es-ES', 'Qwen3 1.7B (Bajo)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.label', 'de-DE', 'Qwen3 1.7B (Niedrig)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.label', 'pt-PT', 'Qwen3 1.7B (Baixo)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.config.auth.ai_assistant_model.qwen3_1.7b.description ──
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.description', 'en-GB', 'Works well in many scenarios but precision is its weak point.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.description', 'it-IT', 'Funziona bene in molti scenari ma la precisione è il suo punto debole.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.description', 'fr-FR', 'Fonctionne bien dans de nombreux scénarios mais la précision est son point faible.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.description', 'es-ES', 'Funciona bien en muchos escenarios pero la precisión es su punto débil.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.description', 'de-DE', 'Funktioniert gut in vielen Szenarien, aber die Präzision ist sein Schwachpunkt.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_1.7b.description', 'pt-PT', 'Funciona bem em muitos cenários, mas a precisão é o seu ponto fraco.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.label ── (Average tier)
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.label', 'en-GB', 'Qwen2.5 1.5B (Average)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.label', 'it-IT', 'Qwen2.5 1.5B (Medio)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.label', 'fr-FR', 'Qwen2.5 1.5B (Moyen)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.label', 'es-ES', 'Qwen2.5 1.5B (Medio)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.label', 'de-DE', 'Qwen2.5 1.5B (Mittel)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.label', 'pt-PT', 'Qwen2.5 1.5B (Médio)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.description ──
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.description', 'en-GB', 'The perfect balance: quick, fast, precise in almost every scenario.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.description', 'it-IT', 'Il bilanciamento perfetto: veloce, rapido, preciso in quasi ogni scenario.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.description', 'fr-FR', 'L''équilibre parfait : rapide, véloce, précis dans presque tous les scénarios.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.description', 'es-ES', 'El equilibrio perfecto: rápido, veloz, preciso en casi cualquier escenario.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.description', 'de-DE', 'Die perfekte Balance: schnell, flink, präzise in fast jedem Szenario.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen2.5_1.5b.description', 'pt-PT', 'O equilíbrio perfeito: rápido, veloz, preciso em quase todos os cenários.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.config.auth.ai_assistant_model.qwen3_4b.label ── (Higher tier)
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.label', 'en-GB', 'Qwen3 4B (Higher)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.label', 'it-IT', 'Qwen3 4B (Alto)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.label', 'fr-FR', 'Qwen3 4B (Élevé)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.label', 'es-ES', 'Qwen3 4B (Alto)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.label', 'de-DE', 'Qwen3 4B (Hoch)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.label', 'pt-PT', 'Qwen3 4B (Alto)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.config.auth.ai_assistant_model.qwen3_4b.description ──
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.description', 'en-GB', 'Very heavy, depends on machine resource capability, but a precise model with deeper reasoning.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.description', 'it-IT', 'Molto pesante, dipende dalle capacità delle risorse della macchina, ma un modello preciso con ragionamento più profondo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.description', 'fr-FR', 'Très lourd, dépend des capacités de la machine, mais un modèle précis avec un raisonnement plus approfondi.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.description', 'es-ES', 'Muy pesado, depende de la capacidad de recursos de la máquina, pero un modelo preciso con razonamiento más profundo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.description', 'de-DE', 'Sehr schwer, hängt von den Ressourcen der Maschine ab, aber ein präzises Modell mit tieferem Reasoning.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.ai_assistant_model.qwen3_4b.description', 'pt-PT', 'Muito pesado, depende da capacidade de recursos da máquina, mas um modelo preciso com raciocínio mais profundo.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.config.auth.group.ai_features ──────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.auth.group.ai_features', 'en-GB', 'AI Features', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.group.ai_features', 'it-IT', 'Funzionalità IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.group.ai_features', 'fr-FR', 'Fonctionnalités IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.group.ai_features', 'es-ES', 'Funciones de IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.group.ai_features', 'de-DE', 'KI-Funktionen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.auth.group.ai_features', 'pt-PT', 'Funcionalidades IA', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── system.settings.config.typeConfig.valuesSource.ai_models ───────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.typeConfig.valuesSource.ai_models', 'en-GB', 'AI Models', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.valuesSource.ai_models', 'it-IT', 'Modelli IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.valuesSource.ai_models', 'fr-FR', 'Modèles IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.valuesSource.ai_models', 'es-ES', 'Modelos IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.valuesSource.ai_models', 'de-DE', 'KI-Modelle', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.valuesSource.ai_models', 'pt-PT', 'Modelos IA', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.modelNotConfigured ──────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.modelNotConfigured', 'en-GB', 'AI assistant model is not configured. Contact an administrator to set the ''ai_assistant_model'' configuration.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelNotConfigured', 'it-IT', 'Il modello dell''assistente IA non è configurato. Contattare un amministratore per impostare la configurazione ''ai_assistant_model''.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelNotConfigured', 'fr-FR', 'Le modèle de l''assistant IA n''est pas configuré. Contactez un administrateur pour définir la configuration ''ai_assistant_model''.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelNotConfigured', 'es-ES', 'El modelo del asistente IA no está configurado. Contacte con un administrador para establecer la configuración ''ai_assistant_model''.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelNotConfigured', 'de-DE', 'Das KI-Assistentenmodell ist nicht konfiguriert. Wenden Sie sich an einen Administrator, um die Konfiguration ''ai_assistant_model'' festzulegen.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelNotConfigured', 'pt-PT', 'O modelo do assistente IA não está configurado. Contacte um administrador para definir a configuração ''ai_assistant_model''.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
