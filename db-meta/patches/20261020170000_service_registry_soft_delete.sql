-- service_registry becomes Deletable — aligns with the arch default
-- (Deletable(Auditable(EntityBase))): removal tombstones the row and every
-- finder auto-excludes it (module switcher, NATS routing gate, schema
-- ownership). `hardDelete*` survives for explicit purge only.
--
-- The two partial unique indexes gain `deleted_at IS NULL` so a tombstoned
-- row never blocks a later re-registration under the same code/base_url.

ALTER TABLE "public"."service_registry"
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "deleted_by" text;

CREATE INDEX IF NOT EXISTS "service_registry_deleted_at_idx"
  ON "public"."service_registry" ("deleted_at");

DROP INDEX IF EXISTS "service_registry_code_uq_scaler";
CREATE UNIQUE INDEX "service_registry_code_uq_scaler"
  ON "public"."service_registry" ("code")
  WHERE is_behind_scaler = true AND deleted_at IS NULL;

DROP INDEX IF EXISTS "service_registry_code_base_url_uq";
CREATE UNIQUE INDEX "service_registry_code_base_url_uq"
  ON "public"."service_registry" ("code", "base_url")
  WHERE is_behind_scaler = false AND deleted_at IS NULL;
