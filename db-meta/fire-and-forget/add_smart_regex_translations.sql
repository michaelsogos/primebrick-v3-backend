-- Fire-and-forget patch: Add SmartRegexInput AI translation keys
-- These 21 keys are new in the FE (SmartRegexInput component) — they don't exist
-- in the live DB. They cover the flags selector panel and the AI chat panel.
--
-- Keys added (21 total, × 6 languages = 126 INSERTs):
--   app.smart.regex.flags.title
--   app.smart.regex.flags.global
--   app.smart.regex.flags.globalHelp
--   app.smart.regex.flags.ignoreCase
--   app.smart.regex.flags.ignoreCaseHelp
--   app.smart.regex.flags.multiline
--   app.smart.regex.flags.multilineHelp
--   app.smart.regex.ai.title
--   app.smart.regex.ai.welcome
--   app.smart.regex.ai.placeholder
--   app.smart.regex.ai.loadingModel
--   app.smart.regex.ai.modelReady
--   app.smart.regex.ai.webgpuRequired
--   app.smart.regex.ai.useThis
--   app.smart.regex.ai.yes
--   app.smart.regex.ai.no
--   app.smart.regex.ai.chooseOption
--   app.smart.regex.ai.send
--   app.smart.regex.ai.stop
--   app.smart.regex.ai.brainCta
--   app.smart.regex.ai.flagsCta
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
-- The BE caches translations in Redis with key pattern:
--   translations:i18n:system:{language}
-- TTL is 6 hours, but to see the changes immediately, run:
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
-- Or if Redis requires auth:
--   redis-cli -a <password> --scan --pattern 'translations:i18n:system:*' | xargs redis-cli -a <password> del

BEGIN;

-- ─── app.smart.regex.flags.title ───────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.flags.title', 'en-GB', 'Regex Flags', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.title', 'it-IT', 'Flag Regex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.title', 'fr-FR', 'Indicateurs Regex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.title', 'es-ES', 'Indicadores Regex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.title', 'de-DE', 'Regex-Flags', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.title', 'pt-PT', 'Sinalizadores Regex', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.flags.global ──────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.flags.global', 'en-GB', 'Global (g)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.global', 'it-IT', 'Globale (g)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.global', 'fr-FR', 'Global (g)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.global', 'es-ES', 'Global (g)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.global', 'de-DE', 'Global (g)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.global', 'pt-PT', 'Global (g)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.flags.globalHelp ──────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.flags.globalHelp', 'en-GB', 'Match all occurrences, not just the first', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.globalHelp', 'it-IT', 'Corrisponde a tutte le occorrenze, non solo la prima', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.globalHelp', 'fr-FR', 'Correspond à toutes les occurrences, pas seulement la première', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.globalHelp', 'es-ES', 'Coincide con todas las ocurrencias, no solo la primera', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.globalHelp', 'de-DE', 'Entspricht allen Vorkommen, nicht nur dem ersten', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.globalHelp', 'pt-PT', 'Corresponde a todas as ocorrências, não apenas a primeira', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.flags.ignoreCase ──────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.flags.ignoreCase', 'en-GB', 'Ignore case (i)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCase', 'it-IT', 'Ignora maiuscole/minuscole (i)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCase', 'fr-FR', 'Ignorer la casse (i)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCase', 'es-ES', 'Ignorar mayúsculas/minúsculas (i)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCase', 'de-DE', 'Groß-/Kleinschreibung ignorieren (i)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCase', 'pt-PT', 'Ignorar maiúsculas/minúsculas (i)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.flags.ignoreCaseHelp ─────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.flags.ignoreCaseHelp', 'en-GB', 'Case-insensitive matching', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCaseHelp', 'it-IT', 'Corrispondenza senza distinzione tra maiuscole e minuscole', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCaseHelp', 'fr-FR', 'Correspondance insensible à la casse', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCaseHelp', 'es-ES', 'Coincidencia sin distinción de mayúsculas/minúsculas', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCaseHelp', 'de-DE', 'Groß-/Kleinschreibung-unabhängige Übereinstimmung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.ignoreCaseHelp', 'pt-PT', 'Correspondência sem distinção de maiúsculas/minúsculas', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.flags.multiline ──────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.flags.multiline', 'en-GB', 'Multiline (m)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multiline', 'it-IT', 'Multiriga (m)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multiline', 'fr-FR', 'Multiligne (m)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multiline', 'es-ES', 'Multilínea (m)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multiline', 'de-DE', 'Mehrzeilig (m)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multiline', 'pt-PT', 'Multilinha (m)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.flags.multilineHelp ──────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.flags.multilineHelp', 'en-GB', '^ and $ match at line boundaries', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multilineHelp', 'it-IT', '^ e $ corrispondono ai confini di riga', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multilineHelp', 'fr-FR', '^ et $ correspondent aux limites de ligne', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multilineHelp', 'es-ES', '^ y $ coinciden con los límites de línea', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multilineHelp', 'de-DE', '^ und $ entsprechen Zeilengrenzen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.flags.multilineHelp', 'pt-PT', '^ e $ correspondem aos limites de linha', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.title ─────────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.title', 'en-GB', 'AI Regex Assistant', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.title', 'it-IT', 'Assistente Regex AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.title', 'fr-FR', 'Assistant Regex AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.title', 'es-ES', 'Asistente Regex AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.title', 'de-DE', 'KI Regex-Assistent', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.title', 'pt-PT', 'Assistente Regex AI', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.welcome ───────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.welcome', 'en-GB', 'Describe the validation you want in plain language. The AI will generate a regex for you.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.welcome', 'it-IT', 'Descrivi la validazione desiderata in linguaggio naturale. L''AI genererà una regex per te.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.welcome', 'fr-FR', 'Décrivez la validation souhaitée en langage naturel. L''IA générera une regex pour vous.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.welcome', 'es-ES', 'Describe la validación que deseas en lenguaje natural. La IA generará una regex para ti.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.welcome', 'de-DE', 'Beschreibe die gewünschte Validierung in natürlicher Sprache. Die KI generiert eine Regex für dich.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.welcome', 'pt-PT', 'Descreve a validação desejada em linguagem natural. A IA gerará uma regex para ti.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.placeholder ──────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.placeholder', 'en-GB', 'e.g. only lowercase letters, 3 to 5 characters', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.placeholder', 'it-IT', 'es. solo lettere minuscole, da 3 a 5 caratteri', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.placeholder', 'fr-FR', 'ex. uniquement des lettres minuscules, 3 à 5 caractères', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.placeholder', 'es-ES', 'ej. solo letras minúsculas, de 3 a 5 caracteres', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.placeholder', 'de-DE', 'z.B. nur Kleinbuchstaben, 3 bis 5 Zeichen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.placeholder', 'pt-PT', 'ex. apenas letras minúsculas, 3 a 5 caracteres', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.loadingModel ──────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.loadingModel', 'en-GB', 'Loading model {progress}%', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.loadingModel', 'it-IT', 'Caricamento modello {progress}%', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.loadingModel', 'fr-FR', 'Chargement du modèle {progress}%', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.loadingModel', 'es-ES', 'Cargando modelo {progress}%', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.loadingModel', 'de-DE', 'Modell wird geladen {progress}%', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.loadingModel', 'pt-PT', 'A carregar modelo {progress}%', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.modelReady ────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.modelReady', 'en-GB', 'Qwen2.5-0.5B is ready!', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelReady', 'it-IT', 'Qwen2.5-0.5B è pronto!', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelReady', 'fr-FR', 'Qwen2.5-0.5B est prêt !', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelReady', 'es-ES', '¡Qwen2.5-0.5B está listo!', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelReady', 'de-DE', 'Qwen2.5-0.5B ist bereit!', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.modelReady', 'pt-PT', 'Qwen2.5-0.5B está pronto!', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.webgpuRequired ────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.webgpuRequired', 'en-GB', 'AI regex assistant requires WebGPU (Chrome 113+/Edge 113+). Please type the regex manually.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.webgpuRequired', 'it-IT', 'L''assistente regex AI richiede WebGPU (Chrome 113+/Edge 113+). Digita la regex manualmente.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.webgpuRequired', 'fr-FR', 'L''assistant regex AI nécessite WebGPU (Chrome 113+/Edge 113+). Veuillez saisir la regex manuellement.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.webgpuRequired', 'es-ES', 'El asistente regex AI requiere WebGPU (Chrome 113+/Edge 113+). Escribe la regex manualmente.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.webgpuRequired', 'de-DE', 'Der KI-Regex-Assistent benötigt WebGPU (Chrome 113+/Edge 113+). Bitte Regex manuell eingeben.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.webgpuRequired', 'pt-PT', 'O assistente regex AI requer WebGPU (Chrome 113+/Edge 113+). Digite a regex manualmente.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.useThis ───────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.useThis', 'en-GB', 'Use this regex?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.useThis', 'it-IT', 'Vuoi utilizzare questa regex?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.useThis', 'fr-FR', 'Utiliser cette regex ?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.useThis', 'es-ES', '¿Usar esta regex?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.useThis', 'de-DE', 'Diese Regex verwenden?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.useThis', 'pt-PT', 'Usar esta regex?', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.yes ───────────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.yes', 'en-GB', 'Yes', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.yes', 'it-IT', 'Sì', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.yes', 'fr-FR', 'Oui', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.yes', 'es-ES', 'Sí', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.yes', 'de-DE', 'Ja', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.yes', 'pt-PT', 'Sim', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.no ────────────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.no', 'en-GB', 'No', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.no', 'it-IT', 'No', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.no', 'fr-FR', 'Non', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.no', 'es-ES', 'No', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.no', 'de-DE', 'Nein', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.no', 'pt-PT', 'Não', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.chooseOption ─────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.chooseOption', 'en-GB', 'Choose a regex option:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.chooseOption', 'it-IT', 'Scegli un''opzione regex:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.chooseOption', 'fr-FR', 'Choisissez une option regex :', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.chooseOption', 'es-ES', 'Elige una opción regex:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.chooseOption', 'de-DE', 'Wähle eine Regex-Option:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.chooseOption', 'pt-PT', 'Escolhe uma opção regex:', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.send ─────────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.send', 'en-GB', 'Send', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.send', 'it-IT', 'Invia', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.send', 'fr-FR', 'Envoyer', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.send', 'es-ES', 'Enviar', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.send', 'de-DE', 'Senden', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.send', 'pt-PT', 'Enviar', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.stop ──────────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.stop', 'en-GB', 'Stop', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.stop', 'it-IT', 'Ferma', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.stop', 'fr-FR', 'Arrêter', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.stop', 'es-ES', 'Detener', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.stop', 'de-DE', 'Stopp', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.stop', 'pt-PT', 'Parar', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.brainCta ──────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.brainCta', 'en-GB', 'AI assistant', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.brainCta', 'it-IT', 'Assistente AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.brainCta', 'fr-FR', 'Assistant AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.brainCta', 'es-ES', 'Asistente AI', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.brainCta', 'de-DE', 'KI-Assistent', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.brainCta', 'pt-PT', 'Assistente AI', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.flagsCta ──────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.flagsCta', 'en-GB', 'Flags', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.flagsCta', 'it-IT', 'Flag', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.flagsCta', 'fr-FR', 'Indicateurs', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.flagsCta', 'es-ES', 'Indicadores', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.flagsCta', 'de-DE', 'Flags', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.flagsCta', 'pt-PT', 'Sinalizadores', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.breakdown ────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.breakdown', 'en-GB', 'Breakdown', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.breakdown', 'it-IT', 'Analisi', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.breakdown', 'fr-FR', 'Décomposition', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.breakdown', 'es-ES', 'Desglose', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.breakdown', 'de-DE', 'Aufschlüsselung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.breakdown', 'pt-PT', 'Decomposição', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.common.copy ────────────────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.copy', 'en-GB', 'Copy', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.copy', 'it-IT', 'Copia', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.copy', 'fr-FR', 'Copier', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.copy', 'es-ES', 'Copiar', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.copy', 'de-DE', 'Kopieren', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.copy', 'pt-PT', 'Copiar', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.hereYouAre ──────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.hereYouAre', 'en-GB', 'Here you are!', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.hereYouAre', 'it-IT', 'Ecco a te!', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.hereYouAre', 'fr-FR', 'Voilà !', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.hereYouAre', 'es-ES', '¡Aquí tienes!', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.hereYouAre', 'de-DE', 'Hier ist es!', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.hereYouAre', 'pt-PT', 'Aqui está!', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
