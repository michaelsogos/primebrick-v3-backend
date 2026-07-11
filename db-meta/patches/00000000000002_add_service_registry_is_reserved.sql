-- Add is_reserved column to service_registry and seed reserved HOME/SETTINGS modules.
-- Reserved modules cannot be disabled or deleted — they are part of the Primebrick shell.

ALTER TABLE public.service_registry
  ADD COLUMN IF NOT EXISTS is_reserved boolean NOT NULL DEFAULT false;

-- Seed reserved HOME module (cannot be disabled/deleted, always present).
-- HOME is the empty landing page — no sidebar links, no microservice backend.
INSERT INTO public.service_registry (
  code, base_url, endpoints, name, description, is_behind_scaler,
  status, is_enabled, icon, icon_type, is_reserved,
  created_at, created_by, updated_at, updated_by, version
)
SELECT
  'home', '', '{}'::jsonb, 'Home', 'Primebrick home dashboard — reserved shell module', true,
  'active', true, 'layout-grid', 'icon', true,
  now(), 'system', now(), 'system', 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_registry WHERE code = 'home' AND is_behind_scaler = true
);

-- Seed reserved SETTINGS module (cannot be disabled/deleted, always present).
-- SETTINGS is the system configuration module — 7 sub-pages, no microservice backend.
INSERT INTO public.service_registry (
  code, base_url, endpoints, name, description, is_behind_scaler,
  status, is_enabled, icon, icon_type, is_reserved,
  created_at, created_by, updated_at, updated_by, version
)
SELECT
  'settings', '', '{}'::jsonb, 'Settings', 'Primebrick system settings — reserved shell module', true,
  'active', true, 'settings', 'icon', true,
  now(), 'system', now(), 'system', 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_registry WHERE code = 'settings' AND is_behind_scaler = true
);
