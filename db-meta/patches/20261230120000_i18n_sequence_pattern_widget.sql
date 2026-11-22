-- Primebrick: app.widgets.sequence_pattern.* — the `format:"sequence_pattern"`
-- pattern-builder widget (token sheet + preview) UI vocabulary, plus the
-- shared validation key the `sequence_pattern` format check surfaces
-- (`app.common.validation.<format>` — same rule as every format).
--
-- Keys:
--   .tokens_cta                    — aria/title of the in-input {} CTA
--   .title / .tokens_title / .preview — sheet title + section titles
--   .example_counter               — preview example-context counter label
--   .used / .insert                — used-token badge title + inject CTA
--   .tokens.<id>                   — per-token row labels (catalog ids:
--     seq, seq_width, yyyy, yy, MM, dd, q, sez, sez2, sez3, brace_open,
--     brace_close)

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  -- ── chrome ──────────────────────────────────────────────────────────────
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_cta', 'en-GB', 'Insert pattern token', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_cta', 'en-US', 'Insert pattern token', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_cta', 'it-IT', 'Inserisci token del pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_cta', 'fr-FR', 'Insérer un jeton', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_cta', 'es-ES', 'Insertar token del patrón', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_cta', 'de-DE', 'Muster-Token einfügen', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_cta', 'pt-PT', 'Inserir token do padrão', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.title', 'en-GB', 'Pattern tokens', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.title', 'en-US', 'Pattern tokens', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.title', 'it-IT', 'Token del pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.title', 'fr-FR', 'Jetons du motif', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.title', 'es-ES', 'Tokens del patrón', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.title', 'de-DE', 'Muster-Tokens', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.title', 'pt-PT', 'Tokens do padrão', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens_title', 'en-GB', 'Available tokens', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_title', 'en-US', 'Available tokens', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_title', 'it-IT', 'Token disponibili', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_title', 'fr-FR', 'Jetons disponibles', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_title', 'es-ES', 'Tokens disponibles', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_title', 'de-DE', 'Verfügbare Tokens', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens_title', 'pt-PT', 'Tokens disponíveis', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.preview', 'en-GB', 'Preview', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.preview', 'en-US', 'Preview', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.preview', 'it-IT', 'Anteprima', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.preview', 'fr-FR', 'Aperçu', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.preview', 'es-ES', 'Vista previa', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.preview', 'de-DE', 'Vorschau', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.preview', 'pt-PT', 'Pré-visualização', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.example_counter', 'en-GB', 'Counter', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.example_counter', 'en-US', 'Counter', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.example_counter', 'it-IT', 'Contatore', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.example_counter', 'fr-FR', 'Compteur', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.example_counter', 'es-ES', 'Contador', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.example_counter', 'de-DE', 'Zähler', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.example_counter', 'pt-PT', 'Contador', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.used', 'en-GB', 'Already used in the pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.used', 'en-US', 'Already used in the pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.used', 'it-IT', 'Già usato nel pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.used', 'fr-FR', 'Déjà utilisé dans le motif', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.used', 'es-ES', 'Ya utilizado en el patrón', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.used', 'de-DE', 'Bereits im Muster verwendet', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.used', 'pt-PT', 'Já utilizado no padrão', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.insert', 'en-GB', 'Insert at cursor', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.insert', 'en-US', 'Insert at cursor', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.insert', 'it-IT', 'Inserisci al cursore', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.insert', 'fr-FR', 'Insérer au curseur', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.insert', 'es-ES', 'Insertar en el cursor', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.insert', 'de-DE', 'Am Cursor einfügen', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.insert', 'pt-PT', 'Inserir no cursor', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  -- ── token labels (catalog ids — sequenceTokenCatalog) ───────────────────
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'en-GB', 'Counter value — exactly one per pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'en-US', 'Counter value — exactly one per pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'it-IT', 'Valore del contatore — uno solo per pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'fr-FR', 'Valeur du compteur — un seul par motif', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'es-ES', 'Valor del contador — uno solo por patrón', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'de-DE', 'Zählerwert — genau einer pro Muster', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq', 'pt-PT', 'Valor do contador — apenas um por padrão', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'en-GB', 'Counter, zero-padded — edit the width digit (1–19)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'en-US', 'Counter, zero-padded — edit the width digit (1–19)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'it-IT', 'Contatore con padding zeri — modifica la cifra (1–19)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'fr-FR', 'Compteur complété de zéros — modifiez le chiffre (1–19)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'es-ES', 'Contador con ceros a la izquierda — edita el dígito (1–19)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'de-DE', 'Zähler mit Null-Padding — Ziffer bearbeiten (1–19)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'pt-PT', 'Contador com zeros à esquerda — edite o dígito (1–19)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yyyy', 'en-GB', 'Year, 4 digits', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yyyy', 'en-US', 'Year, 4 digits', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yyyy', 'it-IT', 'Anno, 4 cifre', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yyyy', 'fr-FR', 'Année, 4 chiffres', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yyyy', 'es-ES', 'Año, 4 dígitos', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yyyy', 'de-DE', 'Jahr, 4-stellig', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yyyy', 'pt-PT', 'Ano, 4 dígitos', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yy', 'en-GB', 'Year, 2 digits', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yy', 'en-US', 'Year, 2 digits', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yy', 'it-IT', 'Anno, 2 cifre', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yy', 'fr-FR', 'Année, 2 chiffres', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yy', 'es-ES', 'Año, 2 dígitos', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yy', 'de-DE', 'Jahr, 2-stellig', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.yy', 'pt-PT', 'Ano, 2 dígitos', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.mm', 'en-GB', 'Month, 2 digits', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.mm', 'en-US', 'Month, 2 digits', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.mm', 'it-IT', 'Mese, 2 cifre', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.mm', 'fr-FR', 'Mois, 2 chiffres', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.mm', 'es-ES', 'Mes, 2 dígitos', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.mm', 'de-DE', 'Monat, 2-stellig', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.mm', 'pt-PT', 'Mês, 2 dígitos', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.dd', 'en-GB', 'Day, 2 digits', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.dd', 'en-US', 'Day, 2 digits', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.dd', 'it-IT', 'Giorno, 2 cifre', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.dd', 'fr-FR', 'Jour, 2 chiffres', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.dd', 'es-ES', 'Día, 2 dígitos', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.dd', 'de-DE', 'Tag, 2-stellig', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.dd', 'pt-PT', 'Dia, 2 dígitos', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.q', 'en-GB', 'Quarter (Q1–Q4)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.q', 'en-US', 'Quarter (Q1–Q4)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.q', 'it-IT', 'Trimestre (Q1–Q4)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.q', 'fr-FR', 'Trimestre (T1–T4)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.q', 'es-ES', 'Trimestre (T1–T4)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.q', 'de-DE', 'Quartal (Q1–Q4)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.q', 'pt-PT', 'Trimestre (T1–T4)', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'en-GB', 'Sezionale slot 1 — partition value at claim time', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'en-US', 'Sezionale slot 1 — partition value at claim time', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'it-IT', 'Sezionale 1 — valore partizione all''emissione', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'fr-FR', 'Sectionnel 1 — valeur de partition à l''émission', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'es-ES', 'Seccional 1 — valor de partición en la emisión', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'de-DE', 'Sektional 1 — Partitionswert bei Vergabe', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez', 'pt-PT', 'Seccional 1 — valor de partição na emissão', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'en-GB', 'Sezionale slot 2 — partition value at claim time', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'en-US', 'Sezionale slot 2 — partition value at claim time', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'it-IT', 'Sezionale 2 — valore partizione all''emissione', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'fr-FR', 'Sectionnel 2 — valeur de partition à l''émission', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'es-ES', 'Seccional 2 — valor de partición en la emisión', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'de-DE', 'Sektional 2 — Partitionswert bei Vergabe', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez2', 'pt-PT', 'Seccional 2 — valor de partição na emissão', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'en-GB', 'Sezionale slot 3 — partition value at claim time', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'en-US', 'Sezionale slot 3 — partition value at claim time', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'it-IT', 'Sezionale 3 — valore partizione all''emissione', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'fr-FR', 'Sectionnel 3 — valeur de partition à l''émission', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'es-ES', 'Seccional 3 — valor de partición en la emisión', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'de-DE', 'Sektional 3 — Partitionswert bei Vergabe', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.sez3', 'pt-PT', 'Seccional 3 — valor de partição na emissão', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'en-GB', 'Literal “{” — always allowed', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'en-US', 'Literal “{” — always allowed', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'it-IT', '“{” letterale — sempre consentita', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'fr-FR', '« { » littérale — toujours permise', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'es-ES', '«{» literal — siempre permitida', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'de-DE', '„{“ Literal — immer erlaubt', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_open', 'pt-PT', '“{” literal — sempre permitida', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'en-GB', 'Literal “}” — always allowed', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'en-US', 'Literal “}” — always allowed', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'it-IT', '“}” letterale — sempre consentita', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'fr-FR', '« } » littérale — toujours permise', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'es-ES', '«}» literal — siempre permitida', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'de-DE', '„}“ Literal — immer erlaubt', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.brace_close', 'pt-PT', '“}” literal — sempre permitida', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),

  -- ── shared format validation key (app.common.validation.<format>) ────────
  (uuidv7(), 'app.common.validation.sequence_pattern', 'en-GB', 'Invalid sequence pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_pattern', 'en-US', 'Invalid sequence pattern', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_pattern', 'it-IT', 'Pattern di sequenza non valido', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_pattern', 'fr-FR', 'Motif de séquence invalide', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_pattern', 'es-ES', 'Patrón de secuencia no válido', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_pattern', 'de-DE', 'Ungültiges Sequenzmuster', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_pattern', 'pt-PT', 'Padrão de sequência inválido', now(), 'migration-sequence-pattern-widget', now(), 'migration-sequence-pattern-widget', 1)
ON CONFLICT (key, language) DO NOTHING;
