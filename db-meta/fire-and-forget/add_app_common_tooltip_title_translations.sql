-- Fire-and-forget: app.common.tooltipTitle.* keys — default per-priority
-- titles for FormLabelWithPriorityHelp tooltips. The FE en-GB fallback covers
-- English only; the DB owns the translations for every language.
--
-- Languages: en-GB, en-US, it-IT, fr-FR, es-ES, de-DE, pt-PT
-- Idempotent via ON CONFLICT.

BEGIN;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.tooltipTitle.information', 'en-GB', 'Info', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.information', 'en-US', 'Info', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.information', 'it-IT', 'Info', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.information', 'fr-FR', 'Info', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.information', 'es-ES', 'Info', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.information', 'de-DE', 'Info', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.information', 'pt-PT', 'Info', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.warning', 'en-GB', 'Warning', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.warning', 'en-US', 'Warning', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.warning', 'it-IT', 'Attenzione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.warning', 'fr-FR', 'Avertissement', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.warning', 'es-ES', 'Advertencia', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.warning', 'de-DE', 'Warnung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.warning', 'pt-PT', 'Aviso', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.error', 'en-GB', 'Error', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.error', 'en-US', 'Error', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.error', 'it-IT', 'Errore', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.error', 'fr-FR', 'Erreur', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.error', 'es-ES', 'Error', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.error', 'de-DE', 'Fehler', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.error', 'pt-PT', 'Erro', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.question', 'en-GB', 'Question', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.question', 'en-US', 'Question', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.question', 'it-IT', 'Domanda', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.question', 'fr-FR', 'Question', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.question', 'es-ES', 'Pregunta', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.question', 'de-DE', 'Frage', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.question', 'pt-PT', 'Pergunta', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.hint', 'en-GB', 'Hint', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.hint', 'en-US', 'Hint', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.hint', 'it-IT', 'Suggerimento', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.hint', 'fr-FR', 'Astuce', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.hint', 'es-ES', 'Sugerencia', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.hint', 'de-DE', 'Hinweis', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.hint', 'pt-PT', 'Dica', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.success', 'en-GB', 'Success', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.success', 'en-US', 'Success', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.success', 'it-IT', 'Successo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.success', 'fr-FR', 'Succès', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.success', 'es-ES', 'Éxito', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.success', 'de-DE', 'Erfolg', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.tooltipTitle.success', 'pt-PT', 'Sucesso', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
