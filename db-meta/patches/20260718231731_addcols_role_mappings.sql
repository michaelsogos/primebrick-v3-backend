-- Add idp_org and last_synced_at columns to role_mappings.
--
-- idp_org:        The Casdoor organization/owner the role belongs to (selected
--                 from the org combobox in the FE role form). Stored for Casdoor
--                 sync purposes; the RBAC lookup is by idp_role alone (JWT
--                 roles_path provides role names as plain strings). Nullable for
--                 backward compat with existing seed rows (administrators, sales,
--                 customer_service, hr, ops) which have no org.
-- last_synced_at: When Casdoor was last successfully synced for this role
--                 (mirrors user_profiles.last_synced_at and
--                 organizations.last_synced_at).

ALTER TABLE public.role_mappings
  ADD COLUMN IF NOT EXISTS idp_org varchar(255);

ALTER TABLE public.role_mappings
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;
