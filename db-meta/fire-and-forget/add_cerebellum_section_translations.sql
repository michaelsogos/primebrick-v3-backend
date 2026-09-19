-- Fire-and-forget patch: labels for the per-assistant cerebellum section
-- on the AI settings page (system.settings.ai.cerebellum_section.*).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del

BEGIN;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.cerebellum_section.title', 'en-GB', 'Assistant tunings (cerebellum)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.title', 'it-IT', 'Tuning per assistente (cervelletto)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.title', 'fr-FR', 'Réglages par assistant (cervelet)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.title', 'es-ES', 'Ajustes por asistente (cerebelo)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.title', 'de-DE', 'Assistenten-Tunings (Kleinhirn)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.title', 'pt-PT', 'Ajustes por assistente (cerebelo)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.description', 'en-GB', 'Each AI assistant resolves its generation params from a cerebellum tuning for the selected model; NULL fields inherit the model defaults.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.description', 'it-IT', 'Ogni assistente AI risolve i parametri di generazione da un tuning (cervelletto) per il modello selezionato; i campi NULL ereditano i predefiniti del modello.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.description', 'fr-FR', 'Chaque assistant IA résout ses paramètres de génération depuis un réglage (cervelet) pour le modèle sélectionné ; les champs NULL héritent des valeurs par défaut du modèle.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.description', 'es-ES', 'Cada asistente IA resuelve sus parámetros de generación desde un ajuste (cerebelo) para el modelo seleccionado; los campos NULL heredan los valores predeterminados del modelo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.description', 'de-DE', 'Jeder KI-Assistent löst seine Generierungsparameter aus einem Tuning (Kleinhirn) für das gewählte Modell auf; NULL-Felder erben die Modell-Standards.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.description', 'pt-PT', 'Cada assistente IA resolve os seus parâmetros de geração a partir de um ajuste (cerebelo) para o modelo selecionado; os campos NULL herdam as predefinições do modelo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.empty', 'en-GB', 'No cerebellum tunings configured — assistants use model defaults.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.empty', 'it-IT', 'Nessun tuning configurato — gli assistenti usano i predefiniti del modello.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.empty', 'fr-FR', 'Aucun réglage configuré — les assistants utilisent les valeurs par défaut du modèle.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.empty', 'es-ES', 'No hay ajustes configurados — los asistentes usan los valores predeterminados del modelo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.empty', 'de-DE', 'Keine Tunings konfiguriert — Assistenten verwenden die Modell-Standards.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.empty', 'pt-PT', 'Sem ajustes configurados — os assistentes usam as predefinições do modelo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.assistant', 'en-GB', 'assistant', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.assistant', 'it-IT', 'assistente', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.assistant', 'fr-FR', 'assistant', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.assistant', 'es-ES', 'asistente', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.assistant', 'de-DE', 'Assistent', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.cerebellum_section.assistant', 'pt-PT', 'assistente', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
