-- Seed service_client_shield_key into public.config_entries.
-- The BE's own client key identifies it on outbound shielded NATS calls:
-- modules/proxy/backend-identity.ts reads it at startup and enrolls its
-- sha256 hash in system.client_shield_registry. Without it every proxied
-- call fails the identity gate ("BE cannot enroll" — fail-loud, no fake
-- fallback). Generated per environment (never committed, never shared).
--
-- Replaces 20261021041000_seed_service_client_shield_key (removed): it
-- omitted the NOT NULL audit columns (updated_by) and could never apply
-- on a fresh environment.

INSERT INTO "public"."config_entries" ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
('service_client_shield_key', encode(gen_random_bytes(32), 'hex'), 'secret', '{"validation":{"required":true,"required_error_label_key":"app.common.validation.required","rules":{"min":{"value":32,"error_label_key":"app.common.validation.tooShort"},"max":{"value":256,"error_label_key":"app.common.validation.tooLong"}}}}', 'system.settings.config.infra.service_client_shield_key.label', 'system.settings.config.infra.service_client_shield_key.description', true, 'system_settings', now(), 'system', now(), 'system', 1)
ON CONFLICT ("key") DO NOTHING;

-- Audit trail for the seed (INSERT record, version 1) — same convention as
-- the init_database config_entries seed block.
INSERT INTO public.config_entries_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
SELECT id, uuid, 'INSERT', created_at, 'initial-setup', 1,
  jsonb_strip_nulls(jsonb_build_object(
    'id', jsonb_build_object('old', null, 'new', id),
    'uuid', jsonb_build_object('old', null, 'new', uuid),
    'key', jsonb_build_object('old', null, 'new', key),
    'value', jsonb_build_object('old', null, 'new', value),
    'type', jsonb_build_object('old', null, 'new', type),
    'type_config', jsonb_build_object('old', null, 'new', type_config),
    'label_key', jsonb_build_object('old', null, 'new', label_key),
    'description_key', jsonb_build_object('old', null, 'new', description_key),
    'reserved', jsonb_build_object('old', null, 'new', reserved),
    'group_key', jsonb_build_object('old', null, 'new', group_key),
    'created_at', jsonb_build_object('old', null, 'new', created_at),
    'created_by', jsonb_build_object('old', null, 'new', COALESCE(created_by, 'system')),
    'updated_at', jsonb_build_object('old', null, 'new', updated_at),
    'updated_by', jsonb_build_object('old', null, 'new', COALESCE(updated_by, created_by, 'system')),
    'version', jsonb_build_object('old', null, 'new', version),
    'deleted_at', jsonb_build_object('old', null, 'new', deleted_at),
    'deleted_by', jsonb_build_object('old', null, 'new', deleted_by)
  ))
FROM public.config_entries
WHERE key = 'service_client_shield_key'
  AND NOT EXISTS (
    SELECT 1 FROM public.config_entries_audit a
    WHERE a.entity_uuid = config_entries.uuid
  );
