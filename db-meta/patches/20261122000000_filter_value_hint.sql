-- Filters sheet — standard-tab input hint for free-value controls
-- (`system.entities.list.filterValueHint`): replaces `filterPlaceholder`
-- ("No filter applied"), which rendered STATE copy as an INPUT hint —
-- the placeholder must serve the action, not describe the status.
--
-- Copy tone: an instruction for what to type, no jargon.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.list.filterValueHint', 'en-GB', 'Filter value…', now(), 'migration-filter-value-hint', now(), 'migration-filter-value-hint', 1),
  ('system.entities.list.filterValueHint', 'en-US', 'Filter value…', now(), 'migration-filter-value-hint', now(), 'migration-filter-value-hint', 1),
  ('system.entities.list.filterValueHint', 'it-IT', 'Valore del filtro…', now(), 'migration-filter-value-hint', now(), 'migration-filter-value-hint', 1),
  ('system.entities.list.filterValueHint', 'de-DE', 'Filterwert…', now(), 'migration-filter-value-hint', now(), 'migration-filter-value-hint', 1),
  ('system.entities.list.filterValueHint', 'fr-FR', 'Valeur du filtre…', now(), 'migration-filter-value-hint', now(), 'migration-filter-value-hint', 1),
  ('system.entities.list.filterValueHint', 'es-ES', 'Valor del filtro…', now(), 'migration-filter-value-hint', now(), 'migration-filter-value-hint', 1),
  ('system.entities.list.filterValueHint', 'pt-PT', 'Valor do filtro…', now(), 'migration-filter-value-hint', now(), 'migration-filter-value-hint', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
