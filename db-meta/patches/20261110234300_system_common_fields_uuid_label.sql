-- system.common.fields.uuid labeled "ID" in every locale. The wire-contract
-- uuid is the external identifier — label it "UUID" (same token in all
-- shipped locales), distinct from system.common.fields.id = "Internal ID"
-- which stays the surrogate-PK label.

UPDATE "system"."translations" SET "value" = 'UUID', "updated_at" = now() WHERE "key" = 'system.common.fields.uuid' AND "language" = 'de-DE' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'UUID', "updated_at" = now() WHERE "key" = 'system.common.fields.uuid' AND "language" = 'en-GB' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'UUID', "updated_at" = now() WHERE "key" = 'system.common.fields.uuid' AND "language" = 'en-US' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'UUID', "updated_at" = now() WHERE "key" = 'system.common.fields.uuid' AND "language" = 'es-ES' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'UUID', "updated_at" = now() WHERE "key" = 'system.common.fields.uuid' AND "language" = 'fr-FR' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'UUID', "updated_at" = now() WHERE "key" = 'system.common.fields.uuid' AND "language" = 'it-IT' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'UUID', "updated_at" = now() WHERE "key" = 'system.common.fields.uuid' AND "language" = 'pt-PT' AND "deleted_at" IS NULL;
