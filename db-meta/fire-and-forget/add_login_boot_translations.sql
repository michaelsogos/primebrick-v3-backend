-- Fire-and-forget patch: login page session-boot translations.
--
-- Shown by the LoadingWatermark while the login page decides between
-- auto-enter and the login form:
--   app.auth.login.auto_logging           — valid local session, auto-enter
--   app.auth.login.auto_logging_hint      — subtitle under the title
--   app.auth.login.refreshing_token       — attempting POST /auth/refresh
--   app.auth.login.refreshing_token_hint  — subtitle under the title
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.auth.login.auto_logging', 'en-GB', 'Auto Logging', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging', 'it-IT', 'Accesso automatico', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging', 'fr-FR', 'Connexion automatique', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging', 'es-ES', 'Acceso automático', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging', 'de-DE', 'Automatische Anmeldung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging', 'pt-PT', 'Login automático', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging_hint', 'en-GB', 'Valid session found, signing you in…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging_hint', 'it-IT', 'Sessione valida trovata, accesso in corso…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging_hint', 'fr-FR', 'Session valide trouvée, connexion en cours…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging_hint', 'es-ES', 'Sesión válida encontrada, accediendo…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging_hint', 'de-DE', 'Gültige Sitzung gefunden, Anmeldung läuft…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.auto_logging_hint', 'pt-PT', 'Sessão válida encontrada, a iniciar sessão…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token', 'en-GB', 'Refreshing Token', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token', 'it-IT', 'Aggiornamento del token', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token', 'fr-FR', 'Actualisation du jeton', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token', 'es-ES', 'Actualizando el token', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token', 'de-DE', 'Token wird erneuert', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token', 'pt-PT', 'A atualizar o token', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token_hint', 'en-GB', 'Restoring your session…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token_hint', 'it-IT', 'Ripristino della sessione…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token_hint', 'fr-FR', 'Restauration de votre session…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token_hint', 'es-ES', 'Restaurando tu sesión…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token_hint', 'de-DE', 'Sitzung wird wiederhergestellt…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.auth.login.refreshing_token_hint', 'pt-PT', 'A restaurar a sua sessão…', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
