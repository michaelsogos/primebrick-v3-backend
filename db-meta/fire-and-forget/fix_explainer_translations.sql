-- Fire-and-forget patch: Fix untranslated English words in regex explainer translations
-- Replaces basic English words (newline, Set, Backslash, Pipe, Caret, Slash, tab, underscore)
-- with proper translations in it-IT, fr-FR, es-ES, de-DE, pt-PT.
-- Technical regex terms (lookahead, lookbehind, Backreference) are kept as-is.

BEGIN;

-- Italian fixes (it-IT)
UPDATE public.translations SET value = 'Qualsiasi carattere (tranne nuova linea)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.any' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Insieme di caratteri {raw}', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.character_set' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Più letterale (+)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_plus' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Barra rovesciata letterale', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_backslash' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Barra verticale letterale (|)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_pipe' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Circonflesso letterale (^)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_caret' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Dollaro letterale ($)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_dollar' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Barra letterale (/)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_slash' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Carattere di nuova linea', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.newline' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Carattere di tabulazione', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.tab' AND language = 'it-IT' AND deleted_at IS NULL;

-- French fixes (fr-FR)
UPDATE public.translations SET value = 'Tout caractere (sauf saut de ligne)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.any' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Ensemble de caracteres {raw}', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.character_set' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Caractere de mot (\w: lettres, chiffres, tiret bas)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.word' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Barre oblique inversée litterale', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_backslash' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Barre verticale litterale (|)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_pipe' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Circonflexe litteral (^)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_caret' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Barre oblique litterale (/)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_slash' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Caractere de saut de ligne', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.newline' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Caractere de tabulation', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.tab' AND language = 'fr-FR' AND deleted_at IS NULL;

-- Spanish fixes (es-ES)
UPDATE public.translations SET value = 'Cualquier caracter (excepto salto de linea)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.any' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Barra vertical literal (|)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_pipe' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Circunflejo literal (^)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_caret' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Caracter de salto de linea', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.newline' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Caracter de tabulacion', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.tab' AND language = 'es-ES' AND deleted_at IS NULL;

-- German fixes (de-DE)
UPDATE public.translations SET value = 'Literaler umgekehrter Schrägstrich', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_backslash' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Literaler senkrechter Strich (|)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_pipe' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Literaler Zirkumflex (^)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_caret' AND language = 'de-DE' AND deleted_at IS NULL;

-- Portuguese fixes (pt-PT)
UPDATE public.translations SET value = 'Caractere de palavra (\w: letras, digitos, sublinhado)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.word' AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Qualquer caractere (exceto quebra de linha)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.any' AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Barra invertida literal', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_backslash' AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Barra vertical literal (|)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_pipe' AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Circunflexo literal (^)', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.literal_caret' AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Caractere de quebra de linha', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.newline' AND language = 'pt-PT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Caractere de tabulação', updated_at = now(), updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.tab' AND language = 'pt-PT' AND deleted_at IS NULL;

COMMIT;
