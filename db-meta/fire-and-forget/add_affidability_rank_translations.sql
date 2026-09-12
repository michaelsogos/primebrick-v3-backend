-- Add translations for new ai_model fields: affidability, rank, test_scores
-- All 6 languages.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.affidability', 'en-GB', 'Affidability', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.affidability', 'it-IT', 'Affidabilità', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.affidability', 'fr-FR', 'Fiabilité', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.affidability', 'es-ES', 'Confiabilidad', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.affidability', 'de-DE', 'Zuverlässigkeit', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.affidability', 'pt-PT', 'Confiabilidade', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.rank', 'en-GB', 'Rank', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.rank', 'it-IT', 'Classifica', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.rank', 'fr-FR', 'Classement', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.rank', 'es-ES', 'Clasificación', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.rank', 'de-DE', 'Rang', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.rank', 'pt-PT', 'Classificação', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.fields.test_scores', 'en-GB', 'Test Scores', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.test_scores', 'it-IT', 'Punteggi Test', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.test_scores', 'fr-FR', 'Scores de Test', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.test_scores', 'es-ES', 'Puntuaciones de Test', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.test_scores', 'de-DE', 'Testergebnisse', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.test_scores', 'pt-PT', 'Pontuações de Teste', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
