-- add_ai_machine_vram_translation.sql
-- Adds a plain "VRAM" label key for the machine-capabilities KPI that shows
-- the measured fast-memory value (probed) when no dedicated VRAM is reported.
-- The long "fits_catalog" sentence remains the tooltip, not the KPI caption.
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.vram', 'en-GB', 'VRAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram', 'en-US', 'VRAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram', 'it-IT', 'VRAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram', 'fr-FR', 'VRAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram', 'es-ES', 'VRAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram', 'de-DE', 'VRAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram', 'pt-PT', 'VRAM', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- NOTE: out-of-band write — invalidate Redis after running:
--   redis-cli --scan --pattern "translations:i18n:system:*" | xargs redis-cli DEL
