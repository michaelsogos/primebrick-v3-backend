-- Primebrick: translation-editor sheet keys (public.translations / app.*).
--
-- The `i18n.translationEditor` sheet (opened from a `*_key` cell's languages
-- CTA) shows the EN base value, marks existing rows read-only, and exposes
-- the optional browser-Translator generation CTA — these keys must exist or
-- the sheet renders raw keys. Same shape as the dict error-scope patch.

INSERT INTO "public"."translations" ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
  ('app.common.translations.base', 'de-DE', 'Basis', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.base', 'en-GB', 'Base', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.base', 'en-US', 'Base', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.base', 'es-ES', 'Base', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.base', 'fr-FR', 'Base', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.base', 'it-IT', 'Base', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.base', 'pt-PT', 'Base', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.managed', 'de-DE', 'Gespeichert', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.managed', 'en-GB', 'Saved', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.managed', 'en-US', 'Saved', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.managed', 'es-ES', 'Guardado', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.managed', 'fr-FR', 'Enregistré', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.managed', 'it-IT', 'Salvato', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.managed', 'pt-PT', 'Guardado', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generate', 'de-DE', 'Fehlende generieren', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generate', 'en-GB', 'Generate missing', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generate', 'en-US', 'Generate missing', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generate', 'es-ES', 'Generar faltantes', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generate', 'fr-FR', 'Générer les manquantes', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generate', 'it-IT', 'Genera mancanti', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generate', 'pt-PT', 'Gerar em falta', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generating', 'de-DE', 'Generiere…', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generating', 'en-GB', 'Generating…', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generating', 'en-US', 'Generating…', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generating', 'es-ES', 'Generando…', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generating', 'fr-FR', 'Génération…', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generating', 'it-IT', 'Generazione…', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.generating', 'pt-PT', 'A gerar…', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiSkipped', 'de-DE', 'Sprachen übersprungen, die der Browser nicht übersetzen kann: {langs}', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiSkipped', 'en-GB', 'Skipped languages the browser cannot translate: {langs}', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiSkipped', 'en-US', 'Skipped languages the browser cannot translate: {langs}', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiSkipped', 'es-ES', 'Idiomas omitidos que el navegador no puede traducir: {langs}', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiSkipped', 'fr-FR', 'Langues ignorées que le navigateur ne peut pas traduire : {langs}', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiSkipped', 'it-IT', 'Lingue saltate che il browser non può tradurre: {langs}', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiSkipped', 'pt-PT', 'Idiomas ignorados que o navegador não consegue traduzir: {langs}', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiUnavailable', 'de-DE', 'Automatische Übersetzung ist in diesem Browser nicht verfügbar.', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiUnavailable', 'en-GB', 'Automatic translation is not available in this browser.', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiUnavailable', 'en-US', 'Automatic translation is not available in this browser.', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiUnavailable', 'es-ES', 'La traducción automática no está disponible en este navegador.', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiUnavailable', 'fr-FR', 'La traduction automatique n''est pas disponible dans ce navigateur.', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiUnavailable', 'it-IT', 'La traduzione automatica non è disponibile in questo browser.', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1),
  ('app.common.translations.aiUnavailable', 'pt-PT', 'A tradução automática não está disponível neste navegador.', now(), 'migration-i18n-editor-keys', now(), 'migration-i18n-editor-keys', 1)
ON CONFLICT ("key", "language") WHERE "deleted_at" IS NULL DO NOTHING;
