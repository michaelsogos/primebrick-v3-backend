-- Primebrick: dict-page error-scope key (public.translations / app.*).
--
-- The `kind:"dict"` archetype page (EntityDictPage) declares
-- errorScopeKey `app.common.errors.scope.dictList` for list bootstrap/load
-- failures — the key must exist or an error boundary renders the raw key.
-- Same shape as the emailsender error-scopes patch.

INSERT INTO "public"."translations" ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
  ('app.common.errors.scope.dictList', 'de-DE', 'Verzeichnisliste', now(), 'migration-dict-error-scope', now(), 'migration-dict-error-scope', 1),
  ('app.common.errors.scope.dictList', 'en-GB', 'Dictionary List', now(), 'migration-dict-error-scope', now(), 'migration-dict-error-scope', 1),
  ('app.common.errors.scope.dictList', 'en-US', 'Dictionary List', now(), 'migration-dict-error-scope', now(), 'migration-dict-error-scope', 1),
  ('app.common.errors.scope.dictList', 'es-ES', 'Lista de diccionario', now(), 'migration-dict-error-scope', now(), 'migration-dict-error-scope', 1),
  ('app.common.errors.scope.dictList', 'fr-FR', 'Liste de dictionnaire', now(), 'migration-dict-error-scope', now(), 'migration-dict-error-scope', 1),
  ('app.common.errors.scope.dictList', 'it-IT', 'Lista dizionario', now(), 'migration-dict-error-scope', now(), 'migration-dict-error-scope', 1),
  ('app.common.errors.scope.dictList', 'pt-PT', 'Lista de dicionário', now(), 'migration-dict-error-scope', now(), 'migration-dict-error-scope', 1)
ON CONFLICT ("key", "language") WHERE "deleted_at" IS NULL DO NOTHING;
