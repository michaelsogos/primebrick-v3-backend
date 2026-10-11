-- Seed the BE↔US gateway shared secret.
--
-- The BE serializes the resolved AuthUser into x-user-* headers on every
-- proxied call and proves itself with this shared secret, sent as the
-- x-client-shield-secret header. Each US has the same pair in its own
-- {schema}.config_entries (see us-v3 patches *_seed_service_client_shield_secret.sql).
-- Missing rows → US rejects every proxy call: AUTH_GATEWAY_NOT_CONFIGURED.
INSERT INTO "public"."config_entries"
  ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by", "updated_by")
VALUES
  ('service_client_shield_secret', '__ROTATED_BY_SECRET_ENGINE__', 'secret', '{"validation":{"required":true,"rules":{"min":{"value":32},"max":{"value":256}}}}', 'system.settings.config.auth.service_client_shield_secret.label', 'system.settings.config.auth.service_client_shield_secret.description', true, 'security_parameters', 'system', 'system'),
  ('service_client_shield_secret_header', 'x-client-shield-secret', 'string', '{"validation":{"required":true,"rules":{}}}', 'system.settings.config.auth.service_client_shield_secret_header.label', 'system.settings.config.auth.service_client_shield_secret_header.description', true, 'security_parameters', 'system', 'system')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";
