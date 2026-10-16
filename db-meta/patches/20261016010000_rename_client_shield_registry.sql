-- system.client_registry → system.client_shield_registry — the table holds
-- the client-shield allowlist (UA prefix + client key hash) consumed by BOTH
-- the HTTP client shield and the NATS service shield; the name now says what
-- it protects. Pure rename: same rows, same constraints — index and CHECK
-- names follow the table so drift-checks stay consistent.
ALTER TABLE "system"."client_registry" RENAME TO "client_shield_registry";
ALTER INDEX "system"."system_client_registry_ua_prefix_uidx"
  RENAME TO "system_client_shield_registry_ua_prefix_uidx";
ALTER TABLE "system"."client_shield_registry"
  RENAME CONSTRAINT "client_registry_source_ck" TO "client_shield_registry_source_ck";
