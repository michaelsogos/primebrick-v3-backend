-- Primebrick: dict-page footer — the aggregated taint badge label.
-- Past the individual-badge threshold the footer collapses every warning
-- badge into one `{count} <edited>` badge (UX guard for long taint lists).

INSERT INTO system.translations (key, language, value, created_by, updated_by)
VALUES
  ('system.entities.dict.footer_edited', 'en-GB', 'edited', 'migration-dict-footer-edited', 'migration-dict-footer-edited'),
  ('system.entities.dict.footer_edited', 'en-US', 'edited', 'migration-dict-footer-edited', 'migration-dict-footer-edited'),
  ('system.entities.dict.footer_edited', 'it-IT', 'modificate', 'migration-dict-footer-edited', 'migration-dict-footer-edited'),
  ('system.entities.dict.footer_edited', 'fr-FR', 'modifiées', 'migration-dict-footer-edited', 'migration-dict-footer-edited'),
  ('system.entities.dict.footer_edited', 'de-DE', 'geändert', 'migration-dict-footer-edited', 'migration-dict-footer-edited'),
  ('system.entities.dict.footer_edited', 'es-ES', 'editadas', 'migration-dict-footer-edited', 'migration-dict-footer-edited'),
  ('system.entities.dict.footer_edited', 'pt-PT', 'editadas', 'migration-dict-footer-edited', 'migration-dict-footer-edited')
ON CONFLICT (key, language) DO NOTHING;
