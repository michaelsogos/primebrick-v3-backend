-- Primebrick: emailsender error-scope keys (public.translations / app.*).
--
-- The emailsender entity pages (providers list — shipped in dbee2ea; the
-- new templates list) declare errorScopeKey/errorScopeKeyInit pointing at
-- `app.common.errors.scope.emailsender*`, but the keys were never seeded:
-- an error boundary on those pages would render the raw key. This seeds
-- all four in the canonical app.* namespace (public.translations), all 7
-- product languages, matching the customersList/customersPageInit shape.

INSERT INTO "public"."translations" ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
  ('app.common.errors.scope.emailsenderProvidersList', 'de-DE', 'E-Mail-Anbieterliste', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersList', 'en-GB', 'Email Providers List', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersList', 'en-US', 'Email Providers List', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersList', 'es-ES', 'Lista proveedores de correo', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersList', 'fr-FR', 'Liste fournisseurs d''email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersList', 'it-IT', 'Lista provider email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersList', 'pt-PT', 'Lista fornecedores de email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),

  ('app.common.errors.scope.emailsenderProvidersPageInit', 'de-DE', 'E-Mail-Anbieterseite-Initialisierung', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersPageInit', 'en-GB', 'Email Providers Page Init', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersPageInit', 'en-US', 'Email Providers Page Init', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersPageInit', 'es-ES', 'Inicialización página proveedores de correo', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersPageInit', 'fr-FR', 'Initialisation page fournisseurs d''email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersPageInit', 'it-IT', 'Inizializzazione pagina provider email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderProvidersPageInit', 'pt-PT', 'Inicialização página fornecedores de email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),

  ('app.common.errors.scope.emailsenderTemplatesList', 'de-DE', 'E-Mail-Vorlagenliste', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesList', 'en-GB', 'Email Templates List', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesList', 'en-US', 'Email Templates List', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesList', 'es-ES', 'Lista plantillas de correo', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesList', 'fr-FR', 'Liste modèles d''email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesList', 'it-IT', 'Lista template email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesList', 'pt-PT', 'Lista modelos de email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),

  ('app.common.errors.scope.emailsenderTemplatesPageInit', 'de-DE', 'E-Mail-Vorlagenseite-Initialisierung', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesPageInit', 'en-GB', 'Email Templates Page Init', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesPageInit', 'en-US', 'Email Templates Page Init', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesPageInit', 'es-ES', 'Inicialización página plantillas de correo', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesPageInit', 'fr-FR', 'Initialisation page modèles d''email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesPageInit', 'it-IT', 'Inizializzazione pagina template email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1),
  ('app.common.errors.scope.emailsenderTemplatesPageInit', 'pt-PT', 'Inicialização página modelos de email', now(), 'migration-emailsender-error-scopes', now(), 'migration-emailsender-error-scopes', 1)
ON CONFLICT ("key", "language") WHERE "deleted_at" IS NULL DO NOTHING;
