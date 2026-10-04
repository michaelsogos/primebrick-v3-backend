-- Fire-and-forget patch: Guide assistant action CTA translation keys
--
-- Namespace app.smart.guide.ai.action.* — action chips + confirm dialog
-- (navigate CTA, MCP tool confirm, entity resolution card).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
--
-- Date: 2026-10-01

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('app.smart.guide.ai.action.confirm_desc',
     'This will run the "{tool}" server action. Review the details before executing.',
     'Verrà eseguita l''azione server "{tool}". Controlla i dettagli prima di eseguire.',
     'Cela exécutera l''action serveur « {tool} ». Vérifiez les détails avant d''exécuter.',
     'Se ejecutará la acción de servidor "{tool}". Revisa los detalles antes de ejecutar.',
     'Dadurch wird die Server-Aktion „{tool}“ ausgeführt. Prüfe die Details vor der Ausführung.',
     'Isto executará a ação de servidor "{tool}". Reveja os detalhes antes de executar.'),
    ('app.smart.guide.ai.action.resolve_hint',
     'Find the record this action applies to.',
     'Trova il record a cui si applica questa azione.',
     'Trouvez l''enregistrement auquel cette action s''applique.',
     'Encuentra el registro al que se aplica esta acción.',
     'Finde den Datensatz, auf den sich diese Aktion bezieht.',
     'Encontra o registo a que esta ação se aplica.'),
    ('app.smart.guide.ai.action.search_placeholder',
     'Search records…', 'Cerca record…', 'Rechercher des enregistrements…',
     'Buscar registros…', 'Datensätze suchen…', 'Procurar registos…'),
    ('app.smart.guide.ai.action.search',
     'Search', 'Cerca', 'Rechercher', 'Buscar', 'Suchen', 'Procurar'),
    ('app.smart.guide.ai.action.no_results',
     'No matching records.', 'Nessun record trovato.', 'Aucun enregistrement correspondant.',
     'Sin registros coincidentes.', 'Keine passenden Datensätze.', 'Sem registos correspondentes.'),
    ('app.smart.guide.ai.action.open_edit',
     'Open edit page', 'Apri pagina di modifica', 'Ouvrir la page d''édition',
     'Abrir página de edición', 'Bearbeitungsseite öffnen', 'Abrir página de edição'),
    ('app.smart.guide.ai.action.args_label',
     'Parameters (editable JSON)', 'Parametri (JSON modificabile)', 'Paramètres (JSON modifiable)',
     'Parámetros (JSON editable)', 'Parameter (bearbeitbares JSON)', 'Parâmetros (JSON editável)'),
    ('app.smart.guide.ai.action.missing_required',
     'Missing required fields: {fields}',
     'Campi obbligatori mancanti: {fields}',
     'Champs obligatoires manquants : {fields}',
     'Faltan campos obligatorios: {fields}',
     'Fehlende Pflichtfelder: {fields}',
     'Campos obrigatórios em falta: {fields}'),
    ('app.smart.guide.ai.action.done_ok',
     'Action executed successfully.', 'Azione eseguita con successo.', 'Action exécutée avec succès.',
     'Acción ejecutada correctamente.', 'Aktion erfolgreich ausgeführt.', 'Ação executada com sucesso.'),
    ('app.smart.guide.ai.action.done_error',
     'The action failed.', 'L''azione è fallita.', 'L''action a échoué.',
     'La acción falló.', 'Die Aktion ist fehlgeschlagen.', 'A ação falhou.'),
    ('app.smart.guide.ai.action.cancel',
     'Cancel', 'Annulla', 'Annuler', 'Cancelar', 'Abbrechen', 'Cancelar'),
    ('app.smart.guide.ai.action.execute',
     'Execute', 'Esegui', 'Exécuter', 'Ejecutar', 'Ausführen', 'Executar'),
    ('app.smart.guide.ai.action.result_ok',
     'Action "{label}" executed successfully.',
     'Azione "{label}" eseguita con successo.',
     'L''action « {label} » a été exécutée avec succès.',
     'La acción "{label}" se ejecutó correctamente.',
     'Aktion „{label}“ wurde erfolgreich ausgeführt.',
     'A ação "{label}" foi executada com sucesso.'),
    ('app.smart.guide.ai.action.result_error',
     'Action "{label}" failed: {error}',
     'Azione "{label}" fallita: {error}',
     'L''action « {label} » a échoué : {error}',
     'La acción "{label}" falló: {error}',
     'Aktion „{label}“ fehlgeschlagen: {error}',
     'A ação "{label}" falhou: {error}')
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
ON CONFLICT (key, language) DO NOTHING;

COMMIT;
