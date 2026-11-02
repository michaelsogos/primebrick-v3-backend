-- app.collaboration.* — same-user multi-tab session keys (F13): the "you"
-- self tooltip and the "you — other tab" label shown when the same user has
-- the record open in another tab/browser. Same seed pattern as
-- 20261029120000_seed_app_collaboration_keys.sql.
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.collaboration.you', 'en-GB', 'You', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you', 'en-US', 'You', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you', 'it-IT', 'Tu', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you', 'fr-FR', 'Vous', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you', 'es-ES', 'Tú', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you', 'pt-PT', 'Você', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you', 'de-DE', 'Du', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),

  ('app.collaboration.you_other_tab', 'en-GB', 'You — other tab', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you_other_tab', 'en-US', 'You — other tab', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you_other_tab', 'it-IT', 'Tu — altra scheda', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you_other_tab', 'fr-FR', 'Vous — autre onglet', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you_other_tab', 'es-ES', 'Tú — otra pestaña', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you_other_tab', 'pt-PT', 'Você — outra aba', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.you_other_tab', 'de-DE', 'Du — anderer Tab', now(), 'migration-collaboration', now(), 'migration-collaboration', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
