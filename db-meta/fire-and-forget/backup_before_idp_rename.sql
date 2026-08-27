-- Backup script: dump auth_configurations BEFORE the IDP rename migration.
-- Run this ONCE on the live database BEFORE applying add_config_table_standard_columns.sql.
-- This script only SELECTs — it does not modify any data.
-- Use the output to manually re-insert removed/renamed keys if restoration is needed.
--
-- Date: 2026-08-26

-- 1. Show all current rows (for manual reference)
SELECT key, value, type, type_config, label_key, description_key, reserved
FROM public.auth_configurations
WHERE deleted_at IS NULL
ORDER BY key;

-- 2. Re-INSERT statements for keys that will be REMOVED (for restoration if needed):
-- casdoor_client_id (value: 'primebrick-api')
-- casdoor_admin_username (value: 'admin')
-- casdoor_admin_role (value: 'administrators')
-- casdoor_admin_password (written by setup-casdoor.ts, may not exist in all DBs)

-- Restoration template (uncomment and edit values if needed):
-- INSERT INTO public.auth_configurations (key, value, type, type_config, label_key, description_key, reserved, created_by)
-- VALUES
-- ('casdoor_client_id', 'primebrick-api', 'string', NULL, 'config.auth.casdoor_client_id.label', 'config.auth.casdoor_client_id.description', true, 'system'),
-- ('casdoor_admin_username', 'admin', 'string', NULL, 'config.auth.casdoor_admin_username.label', 'config.auth.casdoor_admin_username.description', true, 'system'),
-- ('casdoor_admin_role', 'administrators', 'string', NULL, 'config.auth.casdoor_admin_role.label', 'config.auth.casdoor_admin_role.description', true, 'system')
-- ON CONFLICT (key) DO NOTHING;

-- 3. RENAME restoration statements (to revert idp_* back to casdoor_* if needed):
-- UPDATE public.auth_configurations SET key = 'casdoor_endpoint' WHERE key = 'idp_endpoint';
-- UPDATE public.auth_configurations SET key = 'casdoor_organization' WHERE key = 'idp_organization';
-- UPDATE public.auth_configurations SET key = 'casdoor_builtin_client_id' WHERE key = 'idp_client_id';
-- UPDATE public.auth_configurations SET key = 'casdoor_builtin_client_secret' WHERE key = 'idp_client_secret';
-- UPDATE public.auth_configurations SET key = 'oidc_issuer_type' WHERE key = 'idp_type';
