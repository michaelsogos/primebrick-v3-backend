-- Fire-and-forget patch: Add "New session" translation key for AI assistant header CTA
--
-- Keys added (1 total, × 6 languages = 6 INSERTs):
--   app.smart.regex.ai.newSession
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del

BEGIN;

-- ─── app.smart.regex.ai.newSession ─────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.newSession', 'en-GB', 'New session', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.newSession', 'it-IT', 'Nuova sessione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.newSession', 'fr-FR', 'Nouvelle session', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.newSession', 'es-ES', 'Nueva sesión', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.newSession', 'de-DE', 'Neue Sitzung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.newSession', 'pt-PT', 'Nova sessão', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
