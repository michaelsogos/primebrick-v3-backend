-- app.collaboration.* — field-level live-editing badge keys: the chat-style
-- "{name} sta modificando …" indicator rendered at the right edge of a form
-- field's label while another session holds it in EDITING presence state.
-- Same seed pattern as 20261029120000_seed_app_collaboration_keys.sql.
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.collaboration.editing_field', 'en-GB', '{name} is editing', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field', 'en-US', '{name} is editing', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field', 'it-IT', '{name} sta modificando', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field', 'fr-FR', '{name} est en train de modifier', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field', 'es-ES', '{name} está editando', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field', 'pt-PT', '{name} está a editar', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field', 'de-DE', '{name} bearbeitet gerade', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),

  ('app.collaboration.editing_field_multi', 'en-GB', '{count} users are editing', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field_multi', 'en-US', '{count} users are editing', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field_multi', 'it-IT', '{count} utenti stanno modificando', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field_multi', 'fr-FR', '{count} utilisateurs modifient', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field_multi', 'es-ES', '{count} usuarios están editando', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field_multi', 'pt-PT', '{count} utilizadores estão a editar', now(), 'migration-collaboration', now(), 'migration-collaboration', 1),
  ('app.collaboration.editing_field_multi', 'de-DE', '{count} Benutzer bearbeiten gerade', now(), 'migration-collaboration', now(), 'migration-collaboration', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
