-- `permissions_warn` split into lead + tail so the permission list renders
-- <strong> between the two sentence halves (interpolated text cannot carry
-- emphasis). The old compound key stays for compat; the widget reads
-- `.lead`/` .tail` + renders `permissions` in bold.
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.payload_map.permissions_warn.lead', 'en-GB', 'This destination checks permission(s):', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.lead', 'en-US', 'This destination checks permission(s):', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.lead', 'it-IT', 'Questa destinazione verifica i permessi:', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.lead', 'de-DE', 'Dieses Ziel prüft die Berechtigung(en):', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.lead', 'fr-FR', 'Cette destination vérifie les permissions :', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.lead', 'es-ES', 'Este destino verifica los permisos:', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.lead', 'pt-PT', 'Este destino verifica a(s) permissão(ões):', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.tail', 'en-GB', 'make sure the triggering user holds them.', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.tail', 'en-US', 'make sure the triggering user holds them.', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.tail', 'it-IT', 'assicurati che l''utente che innesca la regola li possieda.', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.tail', 'de-DE', 'der auslösende Benutzer muss sie besitzen.', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.tail', 'fr-FR', 'assurez-vous que l''utilisateur déclencheur les détient.', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.tail', 'es-ES', 'asegúrese de que el usuario que dispara la regla los posea.', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1),
  ('app.widgets.payload_map.permissions_warn.tail', 'pt-PT', 'certifique-se de que o usuário que dispara a regra as possua.', now(), 'migration-payload-map-perm-bold', now(), 'migration-payload-map-perm-bold', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
