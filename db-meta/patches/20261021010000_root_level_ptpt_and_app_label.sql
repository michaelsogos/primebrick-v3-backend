-- Root-level label fixes:
-- 1) pt-PT parity for the three root keys — the 20261021003000 seed
--    covered 6 languages but the dictionary convention is 7.
-- 2) `app.nav.rootLevel` relabelled to the APPLICATION semantics:
--    a root level is an app (System = core app, CRM = another app), so
--    the selector reads "Applicazione"/"Application", not "Livello".

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.nav.rootLevel', 'pt-PT', 'Aplicação', now(), 'migration-root-levels-pt', now(), 'migration-root-levels-pt', 1),
  ('app.nav.roots.system', 'pt-PT', 'Sistema', now(), 'migration-root-levels-pt', now(), 'migration-root-levels-pt', 1),
  ('app.nav.roots.crm', 'pt-PT', 'CRM', now(), 'migration-root-levels-pt', now(), 'migration-root-levels-pt', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

UPDATE public.translations SET value = 'Application', updated_at = now(), updated_by = 'migration-root-levels-pt', version = version + 1
 WHERE key = 'app.nav.rootLevel' AND language IN ('en-GB', 'en-US') AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Applicazione', updated_at = now(), updated_by = 'migration-root-levels-pt', version = version + 1
 WHERE key = 'app.nav.rootLevel' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Application', updated_at = now(), updated_by = 'migration-root-levels-pt', version = version + 1
 WHERE key = 'app.nav.rootLevel' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Aplicación', updated_at = now(), updated_by = 'migration-root-levels-pt', version = version + 1
 WHERE key = 'app.nav.rootLevel' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Anwendung', updated_at = now(), updated_by = 'migration-root-levels-pt', version = version + 1
 WHERE key = 'app.nav.rootLevel' AND language = 'de-DE' AND deleted_at IS NULL;
