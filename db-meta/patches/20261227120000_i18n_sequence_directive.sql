-- Primebrick: app.common.validation.sequence_directive — the field issue
-- raised by `checkFieldValue` (v3-core) when a `format:"sequence"` column
-- receives anything that is not a sequence directive ({seq: <uuid> |
-- {uuid|code} | {pattern,step,start,tz?}}). Literal values are never
-- writable on seq-bound columns — the repository resolves the directive
-- in-transaction. All 7 supported languages.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.validation.sequence_directive', 'en-GB', 'Expected a sequence directive — select a sequence or define a pattern', now(), 'migration-seq-directive', now(), 'migration-seq-directive', 1),
  (uuidv7(), 'app.common.validation.sequence_directive', 'en-US', 'Expected a sequence directive — select a sequence or define a pattern', now(), 'migration-seq-directive', now(), 'migration-seq-directive', 1),
  (uuidv7(), 'app.common.validation.sequence_directive', 'it-IT', 'È richiesta una direttiva di sequenza — seleziona una sequenza o definisci un pattern', now(), 'migration-seq-directive', now(), 'migration-seq-directive', 1),
  (uuidv7(), 'app.common.validation.sequence_directive', 'fr-FR', 'Directive de séquence attendue — sélectionnez une séquence ou définissez un modèle', now(), 'migration-seq-directive', now(), 'migration-seq-directive', 1),
  (uuidv7(), 'app.common.validation.sequence_directive', 'es-ES', 'Se esperaba una directiva de secuencia — selecciona una secuencia o define un patrón', now(), 'migration-seq-directive', now(), 'migration-seq-directive', 1),
  (uuidv7(), 'app.common.validation.sequence_directive', 'de-DE', 'Sequenzdirektive erwartet — Sequenz auswählen oder Muster definieren', now(), 'migration-seq-directive', now(), 'migration-seq-directive', 1),
  (uuidv7(), 'app.common.validation.sequence_directive', 'pt-PT', 'Esperada uma diretiva de sequência — selecione uma sequência ou defina um padrão', now(), 'migration-seq-directive', now(), 'migration-seq-directive', 1);
