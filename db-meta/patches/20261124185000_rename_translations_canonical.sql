-- Primebrick: entity → database patch
-- Canonical (unprefixed) index/constraint names on BE-owned translations
-- tables — same cleanup already applied across every US schema.
ALTER INDEX IF EXISTS "system"."system_translations_key_language_uidx" RENAME TO "translations_key_language_uidx";
ALTER INDEX IF EXISTS "system"."system_translations_language_idx" RENAME TO "translations_language_idx";
ALTER TABLE IF EXISTS "system"."translations" RENAME CONSTRAINT "translations_uuid_key" TO "translations_uuid_uq";
ALTER INDEX IF EXISTS "custom"."custom_translations_key_language_uidx" RENAME TO "translations_key_language_uidx";
ALTER INDEX IF EXISTS "custom"."custom_translations_language_idx" RENAME TO "translations_language_idx";
ALTER TABLE IF EXISTS "custom"."translations" RENAME CONSTRAINT "translations_uuid_key" TO "translations_uuid_uq";
ALTER TABLE IF EXISTS "public"."translations" RENAME CONSTRAINT "translations_uuid_key" TO "translations_uuid_uq";
