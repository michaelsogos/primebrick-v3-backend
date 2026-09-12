-- Fire-and-forget: Add translations for ai_model new fields (download_size_mb, vram_mb, compatibility_status).
--
-- Languages: en-GB, it-IT, fr-FR, es-ES, de-DE, pt-PT
-- Idempotent via ON CONFLICT.
--
-- Date: 2026-09-10

BEGIN;

-- ─── download_size_mb ───
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.download_size_mb', 'en-GB', 'Download Size', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.download_size_mb', 'it-IT', 'Dimensione Download', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.download_size_mb', 'fr-FR', 'Taille de Téléchargement', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.download_size_mb', 'es-ES', 'Tamaño de Descarga', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.download_size_mb', 'de-DE', 'Downloadgröße', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.download_size_mb', 'pt-PT', 'Tamanho de Download', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── vram_mb ───
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.vram_mb', 'en-GB', 'VRAM Required', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.vram_mb', 'it-IT', 'VRAM Richiesta', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.vram_mb', 'fr-FR', 'VRAM Requise', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.vram_mb', 'es-ES', 'VRAM Requerida', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.vram_mb', 'de-DE', 'VRAM-Bedarf', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.vram_mb', 'pt-PT', 'VRAM Necessária', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── compatibility_status ───
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.compatibility_status', 'en-GB', 'Compatibility', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.compatibility_status', 'it-IT', 'Compatibilità', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.compatibility_status', 'fr-FR', 'Compatibilité', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.compatibility_status', 'es-ES', 'Compatibilidad', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.compatibility_status', 'de-DE', 'Kompatibilität', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.compatibility_status', 'pt-PT', 'Compatibilidade', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── compatibility.COMPATIBLE ───
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.compatibility.COMPATIBLE', 'en-GB', 'Compatible', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.COMPATIBLE', 'it-IT', 'Compatibile', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.COMPATIBLE', 'fr-FR', 'Compatible', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.COMPATIBLE', 'es-ES', 'Compatible', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.COMPATIBLE', 'de-DE', 'Kompatibel', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.COMPATIBLE', 'pt-PT', 'Compatível', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── compatibility.NOT_COMPATIBLE ───
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.compatibility.NOT_COMPATIBLE', 'en-GB', 'Not Compatible', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.NOT_COMPATIBLE', 'it-IT', 'Non Compatibile', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.NOT_COMPATIBLE', 'fr-FR', 'Non Compatible', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.NOT_COMPATIBLE', 'es-ES', 'No Compatible', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.NOT_COMPATIBLE', 'de-DE', 'Nicht Kompatibel', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.NOT_COMPATIBLE', 'pt-PT', 'Não Compatível', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── compatibility.UNTESTED ───
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.compatibility.UNTESTED', 'en-GB', 'Untested', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.UNTESTED', 'it-IT', 'Non Testato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.UNTESTED', 'fr-FR', 'Non Testé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.UNTESTED', 'es-ES', 'No Probado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.UNTESTED', 'de-DE', 'Ungetestet', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.compatibility.UNTESTED', 'pt-PT', 'Não Testado', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
