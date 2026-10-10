-- Seed the BE↔US gateway shared secret.
--
-- The BE serializes the resolved AuthUser into x-user-* headers on every
-- proxied call and proves itself with this shared secret, sent as the
-- x-gateway-secret header. Each US has the same pair in its own
-- {schema}.config_entries (see us-v3 patches *_seed_gateway_secret.sql).
-- Missing rows → US rejects every proxy call: AUTH_GATEWAY_NOT_CONFIGURED.
INSERT INTO "public"."config_entries"
  ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by", "updated_by")
VALUES
  ('gateway_secret', '22b88f888c93a282f34aae9539c9c1fa7c255a19a1dd0bce4f023b49a3a93bc2', 'secret', '{"validation":{"required":true,"rules":{"min":{"value":32},"max":{"value":256}}}}', 'system.settings.config.auth.gateway_secret.label', 'system.settings.config.auth.gateway_secret.description', true, 'security_parameters', 'system', 'system'),
  ('gateway_secret_header', 'x-gateway-secret', 'string', '{"validation":{"required":true,"rules":{}}}', 'system.settings.config.auth.gateway_secret_header.label', 'system.settings.config.auth.gateway_secret_header.description', true, 'security_parameters', 'system', 'system')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";
