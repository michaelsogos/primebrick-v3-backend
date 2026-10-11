-- Fire-and-forget: rename the rotating client-shield secret config keys.
-- Was: gateway_secret / gateway_secret_header. The rotating-secret engine
-- now owns `service_client_shield_secret` (Redis); these rows remain only
-- as static fallback + wire header name for the SDK auth config.
-- gateway_public_* and gateway_header_* are the GATEWAY-mode family and
-- stay untouched. Idempotent: UPDATEs are no-ops when already renamed.
--
-- Also realigns the patch-registry sha256 of the 3 seed patches that were
-- updated in place (per .devin/rules/patch-sha256-management.md).

BEGIN;

-- 0) the secret key itself may be absent (seeded only in newer DBs) —
--    insert the placeholder; the engine's real value lives in Redis anyway
INSERT INTO ai.config_entries ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by", "updated_by")
  SELECT 'service_client_shield_secret', '__ROTATED_BY_SECRET_ENGINE__', 'secret', '{"validation":{"required":true,"rules":{"min":{"value":32},"max":{"value":256}}}}', 'config.service_client_shield_secret.label', 'config.service_client_shield_secret.description', true, 'security_parameters', 'system', 'system'
  WHERE NOT EXISTS (SELECT 1 FROM ai.config_entries WHERE "key" = 'service_client_shield_secret');
INSERT INTO emailsender.config_entries ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by", "updated_by")
  SELECT 'service_client_shield_secret', '__ROTATED_BY_SECRET_ENGINE__', 'secret', '{"validation":{"required":true,"rules":{"min":{"value":32},"max":{"value":256}}}}', 'config.service_client_shield_secret.label', 'config.service_client_shield_secret.description', true, 'security_parameters', 'system', 'system'
  WHERE NOT EXISTS (SELECT 1 FROM emailsender.config_entries WHERE "key" = 'service_client_shield_secret');
INSERT INTO webhook.config_entries ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by", "updated_by")
  SELECT 'service_client_shield_secret', '__ROTATED_BY_SECRET_ENGINE__', 'secret', '{"validation":{"required":true,"rules":{"min":{"value":32},"max":{"value":256}}}}', 'config.service_client_shield_secret.label', 'config.service_client_shield_secret.description', true, 'security_parameters', 'system', 'system'
  WHERE NOT EXISTS (SELECT 1 FROM webhook.config_entries WHERE "key" = 'service_client_shield_secret');
INSERT INTO public.config_entries ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by", "updated_by")
  SELECT 'service_client_shield_secret', '__ROTATED_BY_SECRET_ENGINE__', 'secret', '{"validation":{"required":true,"rules":{"min":{"value":32},"max":{"value":256}}}}', 'config.service_client_shield_secret.label', 'config.service_client_shield_secret.description', true, 'security_parameters', 'system', 'system'
  WHERE NOT EXISTS (SELECT 1 FROM public.config_entries WHERE "key" = 'service_client_shield_secret');

-- 1) config key rename — every service schema + BE public
UPDATE ai.config_entries          SET key = 'service_client_shield_secret'        WHERE key = 'gateway_secret';
UPDATE ai.config_entries          SET key = 'service_client_shield_secret_header' WHERE key = 'gateway_secret_header';
UPDATE emailsender.config_entries SET key = 'service_client_shield_secret'        WHERE key = 'gateway_secret';
UPDATE emailsender.config_entries SET key = 'service_client_shield_secret_header' WHERE key = 'gateway_secret_header';
UPDATE webhook.config_entries     SET key = 'service_client_shield_secret'        WHERE key = 'gateway_secret';
UPDATE webhook.config_entries     SET key = 'service_client_shield_secret_header' WHERE key = 'gateway_secret_header';
UPDATE public.config_entries      SET key = 'service_client_shield_secret'        WHERE key = 'gateway_secret';
UPDATE public.config_entries      SET key = 'service_client_shield_secret_header' WHERE key = 'gateway_secret_header';

-- 2) wire header name value: align with the new concept name
UPDATE ai.config_entries          SET value = 'x-client-shield-secret' WHERE key = 'service_client_shield_secret_header' AND value = 'x-gateway-secret';
UPDATE emailsender.config_entries SET value = 'x-client-shield-secret' WHERE key = 'service_client_shield_secret_header' AND value = 'x-gateway-secret';
UPDATE webhook.config_entries     SET value = 'x-client-shield-secret' WHERE key = 'service_client_shield_secret_header' AND value = 'x-gateway-secret';
UPDATE public.config_entries      SET value = 'x-client-shield-secret' WHERE key = 'service_client_shield_secret_header' AND value = 'x-gateway-secret';

-- 3) patch registry sha256 realignment (files updated in place)
UPDATE public.primebrick_database_patches SET content_sha256 = '07d71948594860f386cf83b961d031605a3ab58c2e69913a482f4eeaa8f838d2'
  WHERE patch_id = '0006_seed_gateway_secret' AND content_sha256 <> '07d71948594860f386cf83b961d031605a3ab58c2e69913a482f4eeaa8f838d2';
UPDATE public.primebrick_database_patches SET content_sha256 = '7586bdc9c798227caa83cd2eadfece66b4e62ff784e1105d6b9cea9c2b170c07'
  WHERE patch_id = '0004_seed_gateway_secret' AND content_sha256 <> '7586bdc9c798227caa83cd2eadfece66b4e62ff784e1105d6b9cea9c2b170c07';
UPDATE public.primebrick_database_patches SET content_sha256 = '242e383345f899d22388410546c7f2788439110d88678a5d1d9c8918596e708f'
  WHERE patch_id = '0003_seed_gateway_secret' AND content_sha256 <> '242e383345f899d22388410546c7f2788439110d88678a5d1d9c8918596e708f';

COMMIT;
