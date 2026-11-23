-- Primebrick: sequence-pattern token copy cleanup — strip developer-facing
-- "—" clauses from user-facing descriptions and repurpose tokens.seq_width
-- as the padding field's short label ("Padding"/"Riempimento").
--
-- public.translations (app.* vocabulary):
--   app.widgets.sequence_pattern.tokens.seq        — drop "exactly one per
--     pattern" clause (the single-counter rule is enforced by the parser,
--     not explained in prose).
--   app.widgets.sequence_pattern.tokens.sez{,2,3} — drop "partition value
--     at claim time" clause; sezionali context is a runtime concern.
--   app.widgets.sequence_pattern.tokens.brace_{open,close} — drop "always
--     allowed" clause; a literal needs no permission note.
--   app.widgets.sequence_pattern.tokens.seq_width — now the PrimeField
--     label above the NumericInput, so it is a noun, not a sentence.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'en-GB', 'Counter value', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'en-US', 'Counter value', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'it-IT', 'Valore del contatore', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'fr-FR', 'Valeur du compteur', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'es-ES', 'Valor del contador', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'de-DE', 'Zählerwert', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'pt-PT', 'Valor do contador', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'en-GB', 'Padding', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'en-US', 'Padding', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'it-IT', 'Riempimento', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'fr-FR', 'Remplissage', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'es-ES', 'Relleno', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'de-DE', 'Auffüllung', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'pt-PT', 'Preenchimento', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'en-GB', 'Sezionale slot 1', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'en-US', 'Sezionale slot 1', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'it-IT', 'Sezionale 1', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'fr-FR', 'Sectionnel 1', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'es-ES', 'Seccional 1', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'de-DE', 'Sektional 1', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'pt-PT', 'Seccional 1', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'en-GB', 'Sezionale slot 2', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'en-US', 'Sezionale slot 2', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'it-IT', 'Sezionale 2', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'fr-FR', 'Sectionnel 2', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'es-ES', 'Seccional 2', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'de-DE', 'Sektional 2', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'pt-PT', 'Seccional 2', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'en-GB', 'Sezionale slot 3', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'en-US', 'Sezionale slot 3', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'it-IT', 'Sezionale 3', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'fr-FR', 'Sectionnel 3', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'es-ES', 'Seccional 3', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'de-DE', 'Sektional 3', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'pt-PT', 'Seccional 3', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'en-GB', 'Literal “{”', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'en-US', 'Literal “{”', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'it-IT', '“{” letterale', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'fr-FR', '« { » littérale', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'es-ES', '«{» literal', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'de-DE', '„{“ Literal', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'pt-PT', '“{” literal', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'en-GB', 'Literal “}”', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'en-US', 'Literal “}”', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'it-IT', '“}” letterale', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'fr-FR', '« } » littérale', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'es-ES', '«}» literal', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'de-DE', '„}“ Literal', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'pt-PT', '“}” literal', now(), 'migration-seq-pattern-label-cleanup', now(), 'migration-seq-pattern-label-cleanup', 1)
ON CONFLICT (key, language) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now(),
  updated_by = 'migration-seq-pattern-label-cleanup',
  version = translations.version + 1;
