-- `app.widgets.payload_map.meta.rule_id` → `meta.trigger_id` — the kind was
-- renamed with job_rule→job_trigger (core `PayloadMapMeta`); the seeded key
-- drifted behind, leaving the option untranslated AND iconless in the
-- context picker. One UPDATE renames the key for every locale row.
-- `meta.actor_email`/`meta.creator_email` — new context kinds: the event
-- actor's email (x-user-email header) and the rule creator's email
-- (resolved via auth.ctl.resolve_user), both declared `format:"email"` in
-- `PAYLOAD_MAP_META_SCHEMAS` — the only context entries compatible with
-- `array<email>` destinations like emailsender.send `to`.

UPDATE public.translations
SET key = 'app.widgets.payload_map.meta.trigger_id',
    updated_at = now(),
    updated_by = 'migration-meta-trigger-id',
    version = version + 1
WHERE key = 'app.widgets.payload_map.meta.rule_id';

UPDATE public.translations SET value = 'Trigger ID' WHERE key = 'app.widgets.payload_map.meta.trigger_id' AND language IN ('en-GB', 'en-US');
UPDATE public.translations SET value = 'ID del trigger' WHERE key = 'app.widgets.payload_map.meta.trigger_id' AND language = 'it-IT';
UPDATE public.translations SET value = 'Trigger-ID' WHERE key = 'app.widgets.payload_map.meta.trigger_id' AND language = 'de-DE';
UPDATE public.translations SET value = 'ID du déclencheur' WHERE key = 'app.widgets.payload_map.meta.trigger_id' AND language = 'fr-FR';
UPDATE public.translations SET value = 'ID del trigger' WHERE key = 'app.widgets.payload_map.meta.trigger_id' AND language = 'es-ES';
UPDATE public.translations SET value = 'ID do trigger' WHERE key = 'app.widgets.payload_map.meta.trigger_id' AND language = 'pt-PT';

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.payload_map.meta.actor_email', 'en-GB', 'Event actor email', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.actor_email', 'en-US', 'Event actor email', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.actor_email', 'it-IT', 'Email di chi ha scatenato l''evento', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.actor_email', 'de-DE', 'E-Mail des Auslösers', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.actor_email', 'fr-FR', 'E-mail de l''auteur de l''événement', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.actor_email', 'es-ES', 'Correo del actor del evento', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.actor_email', 'pt-PT', 'E-mail do autor do evento', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.creator_email', 'en-GB', 'Rule creator email', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.creator_email', 'en-US', 'Rule creator email', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.creator_email', 'it-IT', 'Email di chi ha creato la regola', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.creator_email', 'de-DE', 'E-Mail des Regelerstellers', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.creator_email', 'fr-FR', 'E-mail du créateur de la règle', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.creator_email', 'es-ES', 'Correo del creador de la regla', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1),
  ('app.widgets.payload_map.meta.creator_email', 'pt-PT', 'E-mail do criador da regra', now(), 'migration-meta-emails', now(), 'migration-meta-emails', 1)
ON CONFLICT (key, language) DO NOTHING;
