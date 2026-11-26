-- Primebrick: SequenceSetDialog unavailable-analysis copy for unbound
-- operator sequences. The dialog explains the missing scan target instead
-- of calling sequence-analyze and surfacing the governed validation error.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.widgets.sequence.set.analyze_unbound', 'en-GB', 'Usage analysis is available only for sequences bound to a field', now(), 'migration-sequence-analyze-unbound', now(), 'migration-sequence-analyze-unbound', 1),
  (uuidv7(), 'app.widgets.sequence.set.analyze_unbound', 'en-US', 'Usage analysis is available only for sequences bound to a field', now(), 'migration-sequence-analyze-unbound', now(), 'migration-sequence-analyze-unbound', 1),
  (uuidv7(), 'app.widgets.sequence.set.analyze_unbound', 'it-IT', 'L''analisi di utilizzo è disponibile solo per le sequenze associate a un campo', now(), 'migration-sequence-analyze-unbound', now(), 'migration-sequence-analyze-unbound', 1),
  (uuidv7(), 'app.widgets.sequence.set.analyze_unbound', 'fr-FR', 'L''analyse d''utilisation est disponible uniquement pour les séquences associées à un champ', now(), 'migration-sequence-analyze-unbound', now(), 'migration-sequence-analyze-unbound', 1),
  (uuidv7(), 'app.widgets.sequence.set.analyze_unbound', 'es-ES', 'El análisis de uso solo está disponible para las secuencias asociadas a un campo', now(), 'migration-sequence-analyze-unbound', now(), 'migration-sequence-analyze-unbound', 1),
  (uuidv7(), 'app.widgets.sequence.set.analyze_unbound', 'de-DE', 'Die Nutzungsanalyse ist nur für Sequenzen verfügbar, die einem Feld zugeordnet sind', now(), 'migration-sequence-analyze-unbound', now(), 'migration-sequence-analyze-unbound', 1),
  (uuidv7(), 'app.widgets.sequence.set.analyze_unbound', 'pt-PT', 'A análise de utilização está disponível apenas para sequências associadas a um campo', now(), 'migration-sequence-analyze-unbound', now(), 'migration-sequence-analyze-unbound', 1)
ON CONFLICT (key, language) DO NOTHING;
