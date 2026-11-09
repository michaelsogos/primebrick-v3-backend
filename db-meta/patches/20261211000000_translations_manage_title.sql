-- Copy fix: `system.settings.translations.title` reads as a bare noun
-- ("Translations"/"Traduzioni") on the translation-editor sheet title and
-- the dict-cell languages CTA — meaningless as a surface name. Renamed to
-- the management phrasing ("Gestione delle Traduzioni"/"Manage
-- Translations") the same key already implies on its consumers.

UPDATE "public"."translations" SET "value" = 'Übersetzungen verwalten', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'de-DE' AND "deleted_at" IS NULL;
UPDATE "public"."translations" SET "value" = 'Manage Translations', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'en-GB' AND "deleted_at" IS NULL;
UPDATE "public"."translations" SET "value" = 'Manage Translations', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'en-US' AND "deleted_at" IS NULL;
UPDATE "public"."translations" SET "value" = 'Gestionar traducciones', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'es-ES' AND "deleted_at" IS NULL;
UPDATE "public"."translations" SET "value" = 'Gérer les traductions', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'fr-FR' AND "deleted_at" IS NULL;
UPDATE "public"."translations" SET "value" = 'Gestione delle Traduzioni', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'it-IT' AND "deleted_at" IS NULL;
UPDATE "public"."translations" SET "value" = 'Gerir traduções', "updated_at" = now() WHERE "key" = 'system.settings.translations.title' AND "language" = 'pt-PT' AND "deleted_at" IS NULL;
