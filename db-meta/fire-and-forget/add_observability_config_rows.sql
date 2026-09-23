-- Fire-and-forget: seed observability config rows (telemetry/logging) on
-- existing databases AND update the init_database patch registry hash
-- (the init patch was modified to include these same seed rows).
--
-- Rows are BE-owned single-point config consumed by:
--   - the BE itself (src/observability/telemetry.ts)
--   - all microservices via SharedConfig.telemetry (NATS config.get)
-- Date: 2026-09-23
-- New init patch sha256: 271d709240294772f192f48b3f00c41f481582d9111714a3e209cb07fcf843e2

BEGIN;

INSERT INTO "public"."config_entries" ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by") VALUES
('telemetry_enabled', 'false', 'boolean', '{"validation":{"required":true,"required_error_label_key":"app.common.validation.required","rules":{}}}', 'system.settings.config.telemetry.telemetry_enabled.label', 'system.settings.config.telemetry.telemetry_enabled.description', true, 'observability', 'system'),
('otel_exporter_otlp_endpoint', '', 'url', '{"default_protocol":"http","allowed_protocols":["http","https"],"validation":{"required":false,"rules":{}}}', 'system.settings.config.telemetry.otel_exporter_otlp_endpoint.label', 'system.settings.config.telemetry.otel_exporter_otlp_endpoint.description', true, 'observability', 'system'),
('otel_exporter_otlp_headers', '', 'json', '{"validation":{"required":false,"rules":{}}}', 'system.settings.config.telemetry.otel_exporter_otlp_headers.label', 'system.settings.config.telemetry.otel_exporter_otlp_headers.description', true, 'observability', 'system'),
('otel_traces_sampler', 'always_on', 'badge', '{"values":{"always_on":{"label_key":"system.settings.config.telemetry.otel_traces_sampler.always_on","color":"primary"},"always_off":{"label_key":"system.settings.config.telemetry.otel_traces_sampler.always_off","color":"secondary"},"traceidratio":{"label_key":"system.settings.config.telemetry.otel_traces_sampler.traceidratio","color":"secondary"}},"validation":{"required":true,"required_error_label_key":"app.common.validation.required","rules":{}}}', 'system.settings.config.telemetry.otel_traces_sampler.label', 'system.settings.config.telemetry.otel_traces_sampler.description', true, 'observability', 'system'),
('otel_traces_sampler_arg', '1', 'number', '{"validation":{"required":false,"rules":{"min":{"value":0,"error_label_key":"app.common.validation.tooShort"},"max":{"value":1,"error_label_key":"app.common.validation.tooLong"}}}}', 'system.settings.config.telemetry.otel_traces_sampler_arg.label', 'system.settings.config.telemetry.otel_traces_sampler_arg.description', true, 'observability', 'system'),
('log_format', 'pretty', 'badge', '{"values":{"pretty":{"label_key":"system.settings.config.telemetry.log_format.pretty","color":"primary"},"json":{"label_key":"system.settings.config.telemetry.log_format.json","color":"secondary"}},"validation":{"required":true,"required_error_label_key":"app.common.validation.required","rules":{}}}', 'system.settings.config.telemetry.log_format.label', 'system.settings.config.telemetry.log_format.description', true, 'observability', 'system'),
('log_level', 'info', 'badge', '{"values":{"debug":{"label_key":"system.settings.config.telemetry.log_level.debug","color":"secondary"},"info":{"label_key":"system.settings.config.telemetry.log_level.info","color":"primary"},"warn":{"label_key":"system.settings.config.telemetry.log_level.warn","color":"secondary"},"error":{"label_key":"system.settings.config.telemetry.log_level.error","color":"destructive"}},"validation":{"required":true,"required_error_label_key":"app.common.validation.required","rules":{}}}', 'system.settings.config.telemetry.log_level.label', 'system.settings.config.telemetry.log_level.description', true, 'observability', 'system')
ON CONFLICT ("key") DO NOTHING;

UPDATE public.primebrick_database_patches
SET content_sha256 = '271d709240294772f192f48b3f00c41f481582d9111714a3e209cb07fcf843e2'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '271d709240294772f192f48b3f00c41f481582d9111714a3e209cb07fcf843e2';

COMMIT;
