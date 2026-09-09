-- Fire-and-forget patch: Add AI assistant prefix + regex topic translation keys
--
-- These 2 keys support the reusable AI assistant title pattern:
--   <span class="text-primary-gradient">AI Assistant</span> <span>Regex</span>
--
-- Keys added (2 total, × 6 languages = 12 INSERTs):
--   app.common.ai.assistant_prefix  — "AI Assistant" / "Assistente AI" / etc.
--   app.smart.regex.ai.topic        — "Regex" (same in all languages)
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
-- The BE caches translations in Redis with key pattern:
--   translations:i18n:system:{language}
-- TTL is 6 hours, but to see the changes immediately, run:
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
-- Or if Redis requires auth:
--   redis-cli -a <password> --scan --pattern 'translations:i18n:system:*' | xargs redis-cli -a <password> del

BEGIN;

-- ─── app.common.ai.assistant_prefix ─────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.ai.assistant_prefix', 'en-GB', 'AI Assistant', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.ai.assistant_prefix', 'it-IT', 'Assistente AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.ai.assistant_prefix', 'fr-FR', 'Assistant IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.ai.assistant_prefix', 'es-ES', 'Asistente IA', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.ai.assistant_prefix', 'de-DE', 'KI-Assistent', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.ai.assistant_prefix', 'pt-PT', 'Assistente IA', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.topic ───────────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.topic', 'en-GB', 'Regex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.topic', 'it-IT', 'Regex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.topic', 'fr-FR', 'Regex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.topic', 'es-ES', 'Regex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.topic', 'de-DE', 'Regex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.topic', 'pt-PT', 'Regex', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
