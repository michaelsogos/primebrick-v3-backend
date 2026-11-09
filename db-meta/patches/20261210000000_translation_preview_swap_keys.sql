-- The translation-editor sheet LINE 3 dropped the fixed-base-language idea:
-- combobox 1 is a generic preview-language picker (its placeholder reads
-- "Preview"), and the swap CTA between the two comboboxes exchanges the
-- preview language with the single update language.
-- snake_case keys per the shared translation-key grammar.

INSERT INTO "public"."translations" ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
  ('app.common.translations.preview', 'de-DE', 'Vorschau', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.preview', 'en-GB', 'Preview', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.preview', 'en-US', 'Preview', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.preview', 'es-ES', 'Vista previa', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.preview', 'fr-FR', 'Aperçu', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.preview', 'it-IT', 'Anteprima', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.preview', 'pt-PT', 'Pré-visualização', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.swap', 'de-DE', 'Sprachen tauschen', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.swap', 'en-GB', 'Swap languages', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.swap', 'en-US', 'Swap languages', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.swap', 'es-ES', 'Intercambiar idiomas', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.swap', 'fr-FR', 'Intervertir les langues', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.swap', 'it-IT', 'Scambia lingue', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1),
  ('app.common.translations.swap', 'pt-PT', 'Trocar idiomas', now(), 'migration-i18n-editor-preview-swap', now(), 'migration-i18n-editor-preview-swap', 1)
ON CONFLICT ("key", "language") WHERE "deleted_at" IS NULL DO NOTHING;
