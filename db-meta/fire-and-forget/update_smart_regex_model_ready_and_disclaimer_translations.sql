-- Fire-and-forget: Update modelReady to be generic + add disclaimer and source dropdown keys.
--
-- The modelReady translation had a hardcoded model name ("Qwen2.5-0.5B is ready!").
-- Now the model is config-driven, so the message is generic ("AI model is ready!").
-- Also adds the disclaimer and source dropdown keys for the chat panel input area.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!

BEGIN;

-- ─── app.smart.regex.ai.modelReady (UPDATE existing — remove hardcoded model name) ──
UPDATE public.translations SET value = 'AI model is ready!', updated_at = now() WHERE key = 'app.smart.regex.ai.modelReady' AND language = 'en-GB';
UPDATE public.translations SET value = 'Modello IA pronto!', updated_at = now() WHERE key = 'app.smart.regex.ai.modelReady' AND language = 'it-IT';
UPDATE public.translations SET value = 'Modèle IA prêt !', updated_at = now() WHERE key = 'app.smart.regex.ai.modelReady' AND language = 'fr-FR';
UPDATE public.translations SET value = '¡Modelo IA listo!', updated_at = now() WHERE key = 'app.smart.regex.ai.modelReady' AND language = 'es-ES';
UPDATE public.translations SET value = 'KI-Modell bereit!', updated_at = now() WHERE key = 'app.smart.regex.ai.modelReady' AND language = 'de-DE';
UPDATE public.translations SET value = 'Modelo IA pronto!', updated_at = now() WHERE key = 'app.smart.regex.ai.modelReady' AND language = 'pt-PT';

-- ─── app.smart.regex.ai.disclaimer ─────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.disclaimer', 'en-GB', 'The AI Assistant answers can be imprecise', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.disclaimer', 'it-IT', 'Le risposte dell''assistente IA possono essere imprecise', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.disclaimer', 'fr-FR', 'Les réponses de l''assistant IA peuvent être imprécises', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.disclaimer', 'es-ES', 'Las respuestas del asistente IA pueden ser imprecisas', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.disclaimer', 'de-DE', 'Die Antworten des KI-Assistenten können ungenau sein', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.disclaimer', 'pt-PT', 'As respostas do assistente IA podem ser imprecisas', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.source.local ────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.source.local', 'en-GB', 'Local', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.local', 'it-IT', 'Locale', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.local', 'fr-FR', 'Local', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.local', 'es-ES', 'Local', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.local', 'de-DE', 'Lokal', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.local', 'pt-PT', 'Local', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.source.backend ──────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.source.backend', 'en-GB', 'Backend (coming soon)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.backend', 'it-IT', 'Backend (prossimamente)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.backend', 'fr-FR', 'Backend (bientôt disponible)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.backend', 'es-ES', 'Backend (próximamente)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.backend', 'de-DE', 'Backend (bald verfügbar)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.source.backend', 'pt-PT', 'Backend (em breve)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
