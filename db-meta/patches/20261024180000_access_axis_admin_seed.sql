-- Access-axis seed — the ONLY baseline access grant, on `administrators`.
--
-- Under the redesigned access axis `is_admin` implies NOTHING: every
-- module leaf needs an explicit grant (exact leaf key or `.*` wildcard —
-- bare namespaces are illegal). administrators receives the two app-level
-- wildcards; every other role is composed by the user via the Roles UI —
-- nothing else is seeded anywhere.

UPDATE public.role_mappings
SET permissions = permissions || '["access.system.*", "access.crm.*"]'::jsonb,
    updated_at = now(),
    updated_by = 'access-axis-seed',
    version = version + 1
WHERE idp_role = 'administrators'
  AND NOT (permissions @> '["access.system.*", "access.crm.*"]'::jsonb);

-- Audit trail for the grant seed (UPDATE record — insert-once guarded).
INSERT INTO public.role_mappings_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
SELECT id, uuid, 'UPDATE', now(), 'access-axis-seed', version,
  jsonb_build_object(
    'permissions', jsonb_build_object(
      'seeded', '["access.system.*", "access.crm.*"]'::jsonb,
      'new', permissions
    )
  )
FROM public.role_mappings
WHERE idp_role = 'administrators'
  AND permissions @> '["access.system.*", "access.crm.*"]'::jsonb
  AND NOT EXISTS (
    SELECT 1 FROM public.role_mappings_audit a
    WHERE a.entity_uuid = public.role_mappings.uuid
      AND a.changed_by = 'access-axis-seed'
  );

-- app.nav.show_all — the launcher reveal-switch label ("show the entries
-- the access axis filtered out, rendered disabled"). Same seed pattern as
-- app.nav.goTo: one row per shipped language, insert-once.
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.nav.show_all', 'en-GB', 'Show all', now(), 'migration-access-axis', now(), 'migration-access-axis', 1),
  ('app.nav.show_all', 'en-US', 'Show all', now(), 'migration-access-axis', now(), 'migration-access-axis', 1),
  ('app.nav.show_all', 'it-IT', 'Mostra tutto', now(), 'migration-access-axis', now(), 'migration-access-axis', 1),
  ('app.nav.show_all', 'fr-FR', 'Tout afficher', now(), 'migration-access-axis', now(), 'migration-access-axis', 1),
  ('app.nav.show_all', 'es-ES', 'Mostrar todo', now(), 'migration-access-axis', now(), 'migration-access-axis', 1),
  ('app.nav.show_all', 'pt-PT', 'Mostrar tudo', now(), 'migration-access-axis', now(), 'migration-access-axis', 1),
  ('app.nav.show_all', 'de-DE', 'Alle anzeigen', now(), 'migration-access-axis', now(), 'migration-access-axis', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
