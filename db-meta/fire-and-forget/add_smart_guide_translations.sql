-- Fire-and-forget patch: Guide assistant (smart-guide) translation keys
--
-- Namespace app.smart.guide.ai.* — the shared smart-ai panel renders all
-- chrome strings from this namespace; plus app.aiGuide.aria for the topbar
-- CTA and app.smart.guide.ai.cerebellum_name for the cerebellum row.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
--
-- Date: 2026-11-21

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('app.aiGuide.aria',
     'User guide', 'Guida utente', 'Guide utilisateur', 'Guía de usuario', 'Benutzerhandbuch', 'Guia do utilizador'),
    ('app.smart.guide.ai.cerebellum_name',
     'User Guide', 'Guida Utente', 'Guide Utilisateur', 'Guía de Usuario', 'Benutzerhandbuch', 'Guia do Utilizador'),
    ('app.smart.guide.ai.title',
     'User Guide', 'Guida Utente', 'Guide Utilisateur', 'Guía de Usuario', 'Benutzerhandbuch', 'Guia do Utilizador'),
    ('app.smart.guide.ai.topic',
     'User guide', 'Guida utente', 'Guide utilisateur', 'Guía de usuario', 'Benutzerhandbuch', 'Guia do utilizador'),
    ('app.smart.guide.ai.welcome',
     'Ask anything about how Primebrick works — modules, users, permissions, configuration. I answer from the official documentation.',
     'Chiedimi qualsiasi cosa su come funziona Primebrick — moduli, utenti, permessi, configurazione. Rispondo dalla documentazione ufficiale.',
     'Posez vos questions sur le fonctionnement de Primebrick — modules, utilisateurs, permissions, configuration. Je réponds à partir de la documentation officielle.',
     'Pregunta lo que quieras sobre cómo funciona Primebrick — módulos, usuarios, permisos, configuración. Respondo desde la documentación oficial.',
     'Frage alles über die Funktionsweise von Primebrick — Module, Benutzer, Berechtigungen, Konfiguration. Ich antworte aus der offiziellen Dokumentation.',
     'Pergunta qualquer coisa sobre como o Primebrick funciona — módulos, utilizadores, permissões, configuração. Respondo a partir da documentação oficial.'),
    ('app.smart.guide.ai.placeholder',
     'e.g. how do I make a user admin?',
     'es. come rendo admin un utente?',
     'ex. comment rendre un utilisateur admin ?',
     'ej. ¿cómo hago administrador a un usuario?',
     'z.B. wie mache ich einen Benutzer zum Admin?',
     'ex. como torno um utilizador admin?'),
    ('app.smart.guide.ai.newSession',
     'New session', 'Nuova sessione', 'Nouvelle session', 'Nueva sesión', 'Neue Sitzung', 'Nova sessão'),
    ('app.smart.guide.ai.cache.title',
     'Model cache', 'Cache del modello', 'Cache du modèle', 'Caché del modelo', 'Modell-Cache', 'Cache do modelo'),
    ('app.smart.guide.ai.loadingModel',
     'Loading model {progress}%', 'Caricamento modello {progress}%', 'Chargement du modèle {progress}%', 'Cargando modelo {progress}%', 'Modell wird geladen {progress}%', 'A carregar modelo {progress}%'),
    ('app.smart.guide.ai.loadingVram',
     'Loading model into VRAM...', 'Caricamento modello in VRAM...', 'Chargement du modèle en VRAM...', 'Cargando modelo en VRAM...', 'Modell wird in VRAM geladen...', 'A carregar modelo para a VRAM...'),
    ('app.smart.guide.ai.cancelLoad',
     'Cancel', 'Annulla', 'Annuler', 'Cancelar', 'Abbrechen', 'Cancelar'),
    ('app.smart.guide.ai.modelReady',
     'AI model is ready!', 'Modello AI pronto!', 'Modèle IA prêt !', '¡Modelo IA listo!', 'KI-Modell ist bereit!', 'Modelo de IA pronto!'),
    ('app.smart.guide.ai.webgpuRequired',
     'The guide assistant requires WebGPU (Chrome 113+/Edge 113+).',
     'L''assistente guida richiede WebGPU (Chrome 113+/Edge 113+).',
     'L''assistant guide nécessite WebGPU (Chrome 113+/Edge 113+).',
     'El asistente de guía requiere WebGPU (Chrome 113+/Edge 113+).',
     'Der Guide-Assistent benötigt WebGPU (Chrome 113+/Edge 113+).',
     'O assistente de guia requer WebGPU (Chrome 113+/Edge 113+).'),
    ('app.smart.guide.ai.modelNotConfigured',
     'AI assistant model is not configured. Contact an administrator to set the ''ai_assistant_model'' configuration.',
     'Il modello dell''assistente AI non è configurato. Contatta un amministratore per impostare la configurazione ''ai_assistant_model''.',
     'Le modèle de l''assistant IA n''est pas configuré. Contactez un administrateur pour définir la configuration ''ai_assistant_model''.',
     'El modelo del asistente IA no está configurado. Contacta con un administrador para establecer la configuración ''ai_assistant_model''.',
     'Das KI-Assistentenmodell ist nicht konfiguriert. Wende dich an einen Administrator, um die Konfiguration ''ai_assistant_model'' zu setzen.',
     'O modelo do assistente de IA não está configurado. Contacta um administrador para definir a configuração ''ai_assistant_model''.'),
    ('app.smart.guide.ai.disclaimer',
     'The AI Assistant answers can be imprecise',
     'Le risposte dell''assistente AI possono essere imprecise',
     'Les réponses de l''assistant IA peuvent être imprécises',
     'Las respuestas del asistente IA pueden ser imprecisas',
     'Die Antworten des KI-Assistenten können ungenau sein',
     'As respostas do assistente de IA podem ser imprecisas'),
    ('app.smart.guide.ai.source.local',
     'Local', 'Locale', 'Local', 'Local', 'Lokal', 'Local'),
    ('app.smart.guide.ai.source.backend',
     'Backend (coming soon)', 'Backend (in arrivo)', 'Backend (bientôt)', 'Backend (próximamente)', 'Backend (demnächst)', 'Backend (em breve)'),
    ('app.smart.guide.ai.thinking',
     'Thinking', 'Sto pensando', 'Réflexion', 'Pensando', 'Denkt nach', 'A pensar'),
    ('app.smart.guide.ai.generating',
     'Generating', 'Generazione', 'Génération', 'Generando', 'Generiert', 'A gerar'),
    ('app.smart.guide.ai.send',
     'Send', 'Invia', 'Envoyer', 'Enviar', 'Senden', 'Enviar'),
    ('app.smart.guide.ai.stop',
     'Stop', 'Stop', 'Arrêter', 'Detener', 'Stopp', 'Parar'),
    ('app.smart.guide.ai.sources',
     'Sources', 'Fonti', 'Sources', 'Fuentes', 'Quellen', 'Fontes'),
    ('app.smart.guide.ai.searching',
     'Searching the documentation...', 'Ricerca nella documentazione...', 'Recherche dans la documentation...', 'Buscando en la documentación...', 'Dokumentation wird durchsucht...', 'A pesquisar na documentação...'),
    ('app.smart.guide.ai.model_details.title',
     'Model details', 'Dettagli modello', 'Détails du modèle', 'Detalles del modelo', 'Modelldetails', 'Detalhes do modelo'),
    ('app.smart.guide.ai.model_details.engine',
     'Engine', 'Motore', 'Moteur', 'Motor', 'Engine', 'Motor'),
    ('app.smart.guide.ai.model_details.quantization',
     'Quantization', 'Quantizzazione', 'Quantification', 'Cuantización', 'Quantisierung', 'Quantização'),
    ('app.smart.guide.ai.model_details.download_size',
     'Download size', 'Dimensione download', 'Taille du téléchargement', 'Tamaño de descarga', 'Download-Größe', 'Tamanho da transferência'),
    ('app.smart.guide.ai.model_details.cache_size',
     'Cache size', 'Dimensione cache', 'Taille du cache', 'Tamaño de caché', 'Cache-Größe', 'Tamanho da cache'),
    ('app.smart.guide.ai.model_details.vram_size',
     'VRAM size', 'Dimensione VRAM', 'Taille VRAM', 'Tamaño VRAM', 'VRAM-Größe', 'Tamanho VRAM'),
    ('app.smart.guide.ai.model_details.power',
     'Power', 'Potenza', 'Puissance', 'Potencia', 'Leistung', 'Potência'),
    ('app.smart.guide.ai.model_details.test_score',
     'Test', 'Test', 'Test', 'Prueba', 'Test', 'Teste'),
    ('app.smart.guide.ai.model_details.speed',
     'Speed', 'Velocità', 'Vitesse', 'Velocidad', 'Geschwindigkeit', 'Velocidade'),
    ('app.smart.guide.ai.model_details.rank',
     'Rank', 'Rank', 'Rang', 'Rango', 'Rang', 'Classificação'),
    ('app.smart.guide.ai.sort.by',
     'Sort by', 'Ordina per', 'Trier par', 'Ordenar por', 'Sortieren nach', 'Ordenar por'),
    ('app.smart.guide.ai.sort.alphabetic',
     'Alphabetical', 'Alfabetico', 'Alphabétique', 'Alfabético', 'Alphabetisch', 'Alfabética')
), expanded AS (
  SELECT key_suffix AS key, language, value
  FROM localized
  CROSS JOIN LATERAL (VALUES
    ('en-GB', en_gb), ('it-IT', it_it), ('fr-FR', fr_fr),
    ('es-ES', es_es), ('de-DE', de_de), ('pt-PT', pt_pt)
  ) AS translation(language, value)
)
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
SELECT key, language, value, now(), 'initial-setup', now(), 'initial-setup', 1
FROM expanded
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
