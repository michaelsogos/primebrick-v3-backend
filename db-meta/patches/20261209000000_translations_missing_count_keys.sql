-- The translation-editor sheet LINE 2 reads the uncovered-language list as
-- copy, not only flag chips: "0 missing translations" when the key is fully
-- covered, "Missing translations:" followed by the chips otherwise.
-- snake_case keys per the shared translation-key grammar.

INSERT INTO "public"."translations" ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
  ('app.common.translations.missing_none', 'de-DE', '0 fehlende Übersetzungen', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_none', 'en-GB', '0 missing translations', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_none', 'en-US', '0 missing translations', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_none', 'es-ES', '0 traducciones faltantes', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_none', 'fr-FR', '0 traduction manquante', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_none', 'it-IT', '0 traduzioni mancanti', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_none', 'pt-PT', '0 traduções em falta', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_list', 'de-DE', 'Fehlende Übersetzungen:', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_list', 'en-GB', 'Missing translations:', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_list', 'en-US', 'Missing translations:', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_list', 'es-ES', 'Traducciones faltantes:', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_list', 'fr-FR', 'Traductions manquantes :', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_list', 'it-IT', 'Traduzioni mancanti:', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1),
  ('app.common.translations.missing_list', 'pt-PT', 'Traduções em falta:', now(), 'migration-i18n-editor-missing-count', now(), 'migration-i18n-editor-missing-count', 1)
ON CONFLICT ("key", "language") WHERE "deleted_at" IS NULL DO NOTHING;
