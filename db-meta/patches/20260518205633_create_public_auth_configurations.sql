-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-18T20:56:33.000Z

CREATE TABLE IF NOT EXISTS "public"."auth_configurations" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(50) NOT NULL,
  "value" text NOT NULL,
  "description" text,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  "deleted_at" timestamptz,
  "deleted_by" text,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_configurations_key_uq" ON "public"."auth_configurations" ("key");
CREATE INDEX IF NOT EXISTS "auth_configurations_deleted_at_idx" ON "public"."auth_configurations" ("deleted_at");

-- Seed initial configuration values
INSERT INTO "public"."auth_configurations" ("key", "value", "description", "created_by") VALUES
('casdoor_endpoint', 'http://localhost:8000', 'URL base del server Casdoor', 'system'),
('casdoor_organization', 'ACME', 'Nome dell organization di riferimento', 'system'),
('casdoor_client_id', 'primebrick-api', 'Client ID della nostra applicazione', 'system'),
('casdoor_admin_username', 'admin', 'Username dell utente amministratore standard', 'system'),
('casdoor_admin_role', 'Administrators', 'Nome del ruolo amministrativo', 'system'),
('oidc_issuer_url', 'http://localhost:8000', 'OIDC issuer URL per validazione token', 'system'),
('oidc_issuer_type', 'casdoor', 'Tipo di IDP (casdoor, keycloak, auth0)', 'system')
ON CONFLICT ("key") DO NOTHING;

-- === patch registry (repeatable runs) ===
-- patch_id: 20260518205633_create_public_auth_configurations
-- content_sha256: TBD
-- After apply:
-- INSERT INTO public.primebrick_schema_meta_patch (patch_id, content_sha256)
-- VALUES ('20260518205633_create_public_auth_configurations', 'TBD')
-- ON CONFLICT (patch_id) DO NOTHING;
