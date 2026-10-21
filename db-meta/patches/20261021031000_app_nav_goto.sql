-- app.nav.goTo — the launcher's goto CTA / keyboard-hint label.
-- "Go to" (not "Open"): the action navigates to a page, it does not open
-- a panel. Distinct from `app.nav.open`, which stays on the sidebar
-- toggle where "open navigation" is the literal action.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.nav.goTo', 'en-GB', 'Go to', now(), 'migration-nav-goto', now(), 'migration-nav-goto', 1),
  ('app.nav.goTo', 'en-US', 'Go to', now(), 'migration-nav-goto', now(), 'migration-nav-goto', 1),
  ('app.nav.goTo', 'it-IT', 'Vai a', now(), 'migration-nav-goto', now(), 'migration-nav-goto', 1),
  ('app.nav.goTo', 'fr-FR', 'Aller à', now(), 'migration-nav-goto', now(), 'migration-nav-goto', 1),
  ('app.nav.goTo', 'es-ES', 'Ir a', now(), 'migration-nav-goto', now(), 'migration-nav-goto', 1),
  ('app.nav.goTo', 'pt-PT', 'Ir para', now(), 'migration-nav-goto', now(), 'migration-nav-goto', 1),
  ('app.nav.goTo', 'de-DE', 'Gehe zu', now(), 'migration-nav-goto', now(), 'migration-nav-goto', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
