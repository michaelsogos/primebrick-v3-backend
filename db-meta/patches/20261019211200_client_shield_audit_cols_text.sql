-- system.client_shield_registry post-apply drift cleanup.
--
-- 1) Audit columns were created varchar while the canonical audit mixin
--    (Auditable/Deletable) declares text — every other table in the registry
--    uses text. varchar→text is lossless and does not rewrite the table
--    (same on-disk representation; only the catalog type changes).
-- 2) Two constraint/index names still carry the pre-rename "client_registry"
--    prefix (the earlier rename patch covered table + ua_prefix index +
--    source CHECK only); align them to the <table>_<col> convention used
--    by every other entity (customers_uuid_uq, service_registry_code_uq…).
ALTER TABLE "system"."client_shield_registry"
  ALTER COLUMN created_by TYPE text,
  ALTER COLUMN updated_by TYPE text,
  ALTER COLUMN deleted_by TYPE text;

ALTER INDEX "system"."client_registry_pkey"
  RENAME TO "client_shield_registry_pkey";
ALTER INDEX "system"."client_registry_uuid_key"
  RENAME TO "client_shield_registry_uuid_uq";
ALTER INDEX "system"."system_client_shield_registry_ua_prefix_uidx"
  RENAME TO "client_shield_registry_ua_prefix_uidx";
