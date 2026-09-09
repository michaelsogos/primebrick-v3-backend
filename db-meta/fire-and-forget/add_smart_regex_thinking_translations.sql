-- Add thinking/generating status translations for Smart Regex AI panel
-- These keys are shown while the AI model is streaming (thinking vs generating)

BEGIN;

-- ─── app.smart.regex.ai.thinking ─────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.thinking', 'en-GB', 'Thinking', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.thinking', 'it-IT', 'Pensando', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.thinking', 'fr-FR', 'Réflexion', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.thinking', 'es-ES', 'Pensando', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.thinking', 'de-DE', 'Denken', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.thinking', 'pt-PT', 'Pensando', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.generating ───────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.generating', 'en-GB', 'Generating', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.generating', 'it-IT', 'Generando', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.generating', 'fr-FR', 'Génération', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.generating', 'es-ES', 'Generando', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.generating', 'de-DE', 'Generieren', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.generating', 'pt-PT', 'Gerando', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
