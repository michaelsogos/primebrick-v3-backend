-- Root-level labels for the module shell — `service_registry.part_of`
-- introduces the {root}/{module} hierarchy (System / CRM). The sidebar
-- root selector and the breadcrumb root segment translate the level via
-- `app.nav.roots.<part_of>`; `app.nav.rootLevel` is the selector's
-- aria-label. All keys live in the CORE `app.*` namespace — a root level
-- is a platform concept, never module-owned.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.nav.rootLevel', 'en-GB', 'Level', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.system', 'en-GB', 'System', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.crm', 'en-GB', 'CRM', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.rootLevel', 'it-IT', 'Livello', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.system', 'it-IT', 'Sistema', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.crm', 'it-IT', 'CRM', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.rootLevel', 'fr-FR', 'Niveau', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.system', 'fr-FR', 'Système', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.crm', 'fr-FR', 'CRM', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.rootLevel', 'es-ES', 'Nivel', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.system', 'es-ES', 'Sistema', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.crm', 'es-ES', 'CRM', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.rootLevel', 'de-DE', 'Ebene', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.system', 'de-DE', 'System', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.crm', 'de-DE', 'CRM', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.rootLevel', 'en-US', 'Level', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.system', 'en-US', 'System', now(), 'migration-root-levels', now(), 'migration-root-levels', 1),
  ('app.nav.roots.crm', 'en-US', 'CRM', now(), 'migration-root-levels', now(), 'migration-root-levels', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
