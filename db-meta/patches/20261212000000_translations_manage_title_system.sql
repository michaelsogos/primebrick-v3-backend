-- Follow-up to 20261211000000: that patch targeted public.translations but
-- `system.*`-namespaced keys live in system.translations (per-schema module
-- ownership) — it updated 0 rows. Same copy fix, correct table this time:
-- `system.settings.translations.title` renamed to the management phrasing.

UPDATE "system"."translations" SET "value" = 'Übersetzungen verwalten', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'de-DE' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'Manage Translations', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'en-GB' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'Manage Translations', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'en-US' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'Gestionar traducciones', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'es-ES' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'Gérer les traductions', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'fr-FR' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'Gestione delle Traduzioni', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'it-IT' AND "deleted_at" IS NULL;
UPDATE "system"."translations" SET "value" = 'Gerir traduções', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'pt-PT' AND "deleted_at" IS NULL;
