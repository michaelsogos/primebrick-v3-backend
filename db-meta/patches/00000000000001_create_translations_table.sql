-- Primebrick: Translations tables — DB is the sole source of truth for i18n.
-- Schema = module boundary: public.translations (app module), system.translations (system module).
-- One row per (key, language) pair. The key is the full dot-path
-- (e.g. 'app.auth.login.title'). The API returns a flat i18n dict
-- built by PostgreSQL's jsonb_object_agg(key, value).

-- === system schema (for system module: settings + entity labels) ===
CREATE SCHEMA IF NOT EXISTS system;
GRANT ALL ON SCHEMA system TO primebrick;
GRANT ALL ON SCHEMA system TO public;

-- === public.translations (app module: app.* — all app-scope UI keys) ===
CREATE TABLE IF NOT EXISTS public.translations (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  key VARCHAR(255) NOT NULL,
  language VARCHAR(10) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ,
  deleted_by VARCHAR(255)
);

CREATE UNIQUE INDEX IF NOT EXISTS translations_key_language_uidx
  ON public.translations (key, language)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS translations_language_idx
  ON public.translations (language)
  WHERE deleted_at IS NULL;

-- === system.translations (system module: system.* — settings + entity labels) ===
CREATE TABLE IF NOT EXISTS system.translations (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  key VARCHAR(255) NOT NULL,
  language VARCHAR(10) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ,
  deleted_by VARCHAR(255)
);

CREATE UNIQUE INDEX IF NOT EXISTS system_translations_key_language_uidx
  ON system.translations (key, language)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS system_translations_language_idx
  ON system.translations (language)
  WHERE deleted_at IS NULL;
