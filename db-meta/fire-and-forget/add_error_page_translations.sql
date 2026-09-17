-- Fire-and-forget patch: translations for the app error page (404 / generic).
--
-- Keys added (× 6 languages):
--   app.error.title.404
--   app.error.title.generic
--   app.error.description.404
--   app.error.description.generic
--   app.error.return_home
--   app.error.go_back
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.error.title.404', 'en-GB', 'Page not found', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.404', 'it-IT', 'Pagina non trovata', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.404', 'fr-FR', 'Page introuvable', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.404', 'es-ES', 'Página no encontrada', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.404', 'de-DE', 'Seite nicht gefunden', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.404', 'pt-PT', 'Página não encontrada', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.generic', 'en-GB', 'Something went wrong', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.generic', 'it-IT', 'Qualcosa è andato storto', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.generic', 'fr-FR', 'Une erreur est survenue', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.generic', 'es-ES', 'Algo salió mal', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.generic', 'de-DE', 'Etwas ist schiefgelaufen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.title.generic', 'pt-PT', 'Algo correu mal', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.404', 'en-GB', 'The page you are looking for does not exist or was moved.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.404', 'it-IT', 'La pagina che stai cercando non esiste o è stata spostata.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.404', 'fr-FR', 'La page que vous recherchez n''existe pas ou a été déplacée.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.404', 'es-ES', 'La página que buscas no existe o fue movida.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.404', 'de-DE', 'Die gesuchte Seite existiert nicht oder wurde verschoben.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.404', 'pt-PT', 'A página que procuras não existe ou foi movida.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.generic', 'en-GB', 'An unexpected error occurred.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.generic', 'it-IT', 'Si è verificato un errore imprevisto.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.generic', 'fr-FR', 'Une erreur inattendue s''est produite.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.generic', 'es-ES', 'Se produjo un error inesperado.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.generic', 'de-DE', 'Ein unerwarteter Fehler ist aufgetreten.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.description.generic', 'pt-PT', 'Ocorreu um erro inesperado.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.return_home', 'en-GB', 'Return to home', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.return_home', 'it-IT', 'Torna alla home', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.return_home', 'fr-FR', 'Retour à l''accueil', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.return_home', 'es-ES', 'Volver al inicio', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.return_home', 'de-DE', 'Zurück zur Startseite', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.return_home', 'pt-PT', 'Voltar ao início', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.go_back', 'en-GB', 'Go back', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.go_back', 'it-IT', 'Torna indietro', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.go_back', 'fr-FR', 'Retour', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.go_back', 'es-ES', 'Volver', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.go_back', 'de-DE', 'Zurück', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.error.go_back', 'pt-PT', 'Voltar', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
