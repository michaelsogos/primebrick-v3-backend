-- Fire-and-forget patch: UI strings for the shared Smart AI footer
-- (cerebellum selector, restyled model-details popover groups) and the
-- Smart JSON config assistant panel (app.smart.json.ai.*).
--
-- These mirror the app.smart.regex.ai.* keys already seeded; identical
-- strings reuse the same translations. FE en-GB fallback carries the
-- same English values — this patch seeds all six locales in the DB.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del

BEGIN;

-- ─── Shared Smart AI keys (app.smart.ai.*) ────────────────────────────────
WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('cerebellum.title', 'Cerebellum', 'Cervelletto', 'Cervelet', 'Cerebelo', 'Kleinhirn', 'Cerebelo'),
    ('cerebellum.model_defaults', 'Model defaults', 'Predefiniti del modello', 'Valeurs par défaut du modèle', 'Valores predeterminados del modelo', 'Modell-Standards', 'Predefinições do modelo'),
    ('cerebellum.default', 'default', 'predefinito', 'par défaut', 'predeterminado', 'Standard', 'predefinido'),
    ('model_details.sampling', 'Sampling', 'Campionamento', 'Échantillonnage', 'Muestreo', 'Sampling', 'Amostragem'),
    ('model_details.kv_cache', 'KV cache', 'KV cache', 'Cache KV', 'Caché KV', 'KV-Cache', 'Cache KV'),
    ('model_details.kv_cache_on', 'KV cache', 'KV cache', 'Cache KV', 'Caché KV', 'KV-Cache', 'Cache KV'),
    ('model_details.kv_cache_off', 'No KV cache', 'Nessuna KV cache', 'Pas de cache KV', 'Sin caché KV', 'Kein KV-Cache', 'Sem cache KV')
), expanded AS (
  SELECT 'app.smart.ai.' || key_suffix AS key, language, value
  FROM localized
  CROSS JOIN LATERAL (VALUES
    ('en-GB', en_gb), ('it-IT', it_it), ('fr-FR', fr_fr),
    ('es-ES', es_es), ('de-DE', de_de), ('pt-PT', pt_pt)
  ) AS translation(language, value)
)
INSERT INTO public.translations (key, language, value, created_by, updated_by)
SELECT key, language, value, 'system_migration', 'system_migration'
FROM expanded
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by;

-- ─── Smart JSON assistant keys (app.smart.json.ai.*) ──────────────────────
WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('title', 'AI JSON Assistant', 'Assistente JSON AI', 'Assistant JSON AI', 'Asistente JSON AI', 'KI JSON-Assistent', 'Assistente JSON AI'),
    ('topic', 'JSON configuration', 'Configurazione JSON', 'Configuration JSON', 'Configuración JSON', 'JSON-Konfiguration', 'Configuração JSON'),
    ('brainCta', 'AI assistant', 'Assistente AI', 'Assistant AI', 'Asistente AI', 'KI-Assistent', 'Assistente AI'),
    ('welcome', 'Ask what you can configure, or describe the validation you need. The AI will produce a JSON config for you.', 'Chiedi cosa puoi configurare o descrivi la validazione che ti serve. L''IA produrrà una configurazione JSON per te.', 'Demandez ce que vous pouvez configurer ou décrivez la validation souhaitée. L''IA produira une configuration JSON pour vous.', 'Pregunta qué puedes configurar o describe la validación que necesitas. La IA producirá una configuración JSON para ti.', 'Fragen Sie, was Sie konfigurieren können, oder beschreiben Sie die benötigte Validierung. Die KI erstellt eine JSON-Konfiguration für Sie.', 'Pergunta o que podes configurar ou descreve a validação de que precisas. A IA produzirá uma configuração JSON para ti.'),
    ('placeholder', 'e.g. a field for people names, max 5 words', 'es. un campo per nomi di persone, massimo 5 parole', 'ex. un champ pour des noms de personnes, 5 mots max', 'ej. un campo para nombres de personas, máximo 5 palabras', 'z.B. ein Feld für Personennamen, maximal 5 Wörter', 'ex. um campo para nomes de pessoas, máximo 5 palavras'),
    ('explorer_intro', 'Here''s what you can configure — pick a topic, or describe what you need in the chat:', 'Ecco cosa puoi configurare — scegli un argomento o descrivi ciò che ti serve nella chat:', 'Voici ce que vous pouvez configurer — choisissez un sujet ou décrivez votre besoin dans le chat :', 'Esto es lo que puedes configurar — elige un tema o describe lo que necesitas en el chat:', 'Das können Sie konfigurieren — wählen Sie ein Thema oder beschreiben Sie im Chat, was Sie benötigen:', 'Aqui está o que podes configurar — escolhe um tópico ou descreve o que precisas no chat:'),
    ('candidate', 'Candidate JSON', 'JSON candidato', 'JSON candidat', 'JSON candidato', 'JSON-Kandidat', 'JSON candidato'),
    ('candidate_intro', 'Here you go — review the JSON below and apply it if it looks right:', 'Ecco a te — controlla il JSON qui sotto e applicalo se ti va bene:', 'Voilà — vérifiez le JSON ci-dessous et appliquez-le s''il vous convient :', 'Aquí tienes — revisa el JSON a continuación y aplícalo si te parece bien:', 'Bitte sehr — prüfen Sie das JSON unten und wenden Sie es an, wenn es passt:', 'Aqui está — revê o JSON abaixo e aplica-o se te parecer bem:'),
    ('valid', 'Valid', 'Valido', 'Valide', 'Válido', 'Gültig', 'Válido'),
    ('invalid', 'Invalid', 'Non valido', 'Invalide', 'Inválido', 'Ungültig', 'Inválido'),
    ('apply', 'Apply', 'Applica', 'Appliquer', 'Aplicar', 'Anwenden', 'Aplicar'),
    ('discard', 'Discard', 'Scarta', 'Ignorer', 'Descartar', 'Verwerfen', 'Descartar'),
    ('newSession', 'New session', 'Nuova sessione', 'Nouvelle session', 'Nueva sesión', 'Neue Sitzung', 'Nova sessão'),
    ('cache.title', 'Model cache', 'Cache modelli', 'Cache des modèles', 'Caché de modelos', 'Modell-Cache', 'Cache de modelos'),
    ('loadingModel', 'Loading model {progress}%', 'Caricamento modello {progress}%', 'Chargement du modèle {progress}%', 'Cargando modelo {progress}%', 'Modell wird geladen {progress}%', 'A carregar modelo {progress}%'),
    ('loadingVram', 'Loading model into VRAM...', 'Caricamento del modello in VRAM...', 'Chargement du modèle dans la VRAM...', 'Cargando el modelo en VRAM...', 'Modell wird in VRAM geladen...', 'A carregar o modelo para a VRAM...'),
    ('cancelLoad', 'Cancel', 'Annulla', 'Annuler', 'Cancelar', 'Abbrechen', 'Cancelar'),
    ('modelReady', 'AI model is ready!', 'Il modello AI è pronto!', 'Le modèle IA est prêt !', '¡El modelo IA está listo!', 'Das KI-Modell ist bereit!', 'O modelo IA está pronto!'),
    ('webgpuRequired', 'The AI JSON assistant requires WebGPU (Chrome 113+/Edge 113+). Please edit the JSON manually.', 'L''assistente JSON AI richiede WebGPU (Chrome 113+/Edge 113+). Modifica il JSON manualmente.', 'L''assistant JSON AI nécessite WebGPU (Chrome 113+/Edge 113+). Modifiez le JSON manuellement.', 'El asistente JSON AI requiere WebGPU (Chrome 113+/Edge 113+). Edita el JSON manualmente.', 'Der KI-JSON-Assistent benötigt WebGPU (Chrome 113+/Edge 113+). Bearbeiten Sie das JSON manuell.', 'O assistente JSON AI requer WebGPU (Chrome 113+/Edge 113+). Edita o JSON manualmente.'),
    ('modelNotConfigured', 'AI assistant model is not configured. Contact an administrator to set the ''ai_assistant_model'' configuration.', 'Il modello dell''assistente IA non è configurato. Contattare un amministratore per impostare la configurazione ''ai_assistant_model''.', 'Le modèle de l''assistant IA n''est pas configuré. Contactez un administrateur pour définir la configuration ''ai_assistant_model''.', 'El modelo del asistente IA no está configurado. Contacte con un administrador para establecer la configuración ''ai_assistant_model''.', 'Das KI-Assistentenmodell ist nicht konfiguriert. Wenden Sie sich an einen Administrator, um die Konfiguration ''ai_assistant_model'' festzulegen.', 'O modelo do assistente IA não está configurado. Contacte um administrador para definir a configuração ''ai_assistant_model''.'),
    ('disclaimer', 'The AI Assistant answers can be imprecise', 'Le risposte dell''assistente IA possono essere imprecise', 'Les réponses de l''assistant IA peuvent être imprécises', 'Las respuestas del asistente IA pueden ser imprecisas', 'Die Antworten des KI-Assistenten können ungenau sein', 'As respostas do assistente IA podem ser imprecisas'),
    ('source.local', 'Local', 'Locale', 'Local', 'Local', 'Lokal', 'Local'),
    ('source.backend', 'Backend (coming soon)', 'Backend (prossimamente)', 'Backend (bientôt disponible)', 'Backend (próximamente)', 'Backend (bald verfügbar)', 'Backend (em breve)'),
    ('thinking', 'Thinking', 'Pensando', 'Réflexion', 'Pensando', 'Denken', 'Pensando'),
    ('generating', 'Generating', 'Generando', 'Génération', 'Generando', 'Generieren', 'Gerando'),
    ('send', 'Send', 'Invia', 'Envoyer', 'Enviar', 'Senden', 'Enviar'),
    ('stop', 'Stop', 'Stop', 'Arrêter', 'Detener', 'Stopp', 'Parar'),
    ('model_details.title', 'Model details', 'Dettagli modello', 'Détails du modèle', 'Detalles del modelo', 'Modelldetails', 'Detalhes do modelo'),
    ('model_details.engine', 'Engine', 'Motore', 'Moteur', 'Motor', 'Engine', 'Motor'),
    ('model_details.quantization', 'Quantization', 'Quantizzazione', 'Quantification', 'Cuantización', 'Quantisierung', 'Quantização'),
    ('model_details.download_size', 'Download size', 'Dimensione download', 'Taille du téléchargement', 'Tamaño de descarga', 'Downloadgröße', 'Tamanho da transferência'),
    ('model_details.cache_size', 'Cache size', 'Dimensione cache', 'Taille du cache', 'Tamaño de caché', 'Cachegröße', 'Tamanho da cache'),
    ('model_details.vram_size', 'VRAM size', 'Dimensione VRAM', 'Taille VRAM', 'Tamaño de VRAM', 'VRAM-Größe', 'Tamanho da VRAM'),
    ('model_details.power', 'Power', 'Potenza', 'Puissance', 'Potencia', 'Leistung', 'Potência'),
    ('model_details.test_score', 'Test', 'Test', 'Test', 'Prueba', 'Test', 'Teste'),
    ('model_details.speed', 'Speed', 'Velocità', 'Vitesse', 'Velocidad', 'Geschwindigkeit', 'Velocidade'),
    ('model_details.rank', 'Rank', 'Classifica', 'Classement', 'Clasificación', 'Rang', 'Classificação'),
    ('sort.by', 'Sort by', 'Ordina per', 'Trier par', 'Ordenar por', 'Sortieren nach', 'Ordenar por'),
    ('sort.alphabetic', 'Alphabetical', 'Alfabetico', 'Alphabétique', 'Alfabético', 'Alphabetisch', 'Alfabético')
), expanded AS (
  SELECT 'app.smart.json.ai.' || key_suffix AS key, language, value
  FROM localized
  CROSS JOIN LATERAL (VALUES
    ('en-GB', en_gb), ('it-IT', it_it), ('fr-FR', fr_fr),
    ('es-ES', es_es), ('de-DE', de_de), ('pt-PT', pt_pt)
  ) AS translation(language, value)
)
INSERT INTO public.translations (key, language, value, created_by, updated_by)
SELECT key, language, value, 'system_migration', 'system_migration'
FROM expanded
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by;

COMMIT;
