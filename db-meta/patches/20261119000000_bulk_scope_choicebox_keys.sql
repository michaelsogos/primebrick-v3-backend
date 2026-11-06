-- Bulk-delete/restore dialog scope choicebox — generic `app.common` keys.
-- The dialog asks "selected rows vs all rows matching the current filters"
-- (the export-scope precedent) — titles carry `{count}`, descriptions are
-- verb-free so the same keys serve delete/restore/disable/enable dialogs.
BEGIN;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
SELECT * FROM (VALUES
('app.common.bulkScopeSelectedTitle', 'en-GB', 'Only the {count} selected', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedTitle', 'en-US', 'Only the {count} selected', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedTitle', 'it-IT', 'Solo i {count} selezionati', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedTitle', 'de-DE', 'Nur die {count} ausgewählten', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedTitle', 'fr-FR', 'Seulement les {count} sélectionnés', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedTitle', 'es-ES', 'Solo los {count} seleccionados', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedTitle', 'pt-PT', 'Apenas os {count} selecionados', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedDesc', 'en-GB', 'Applies only to the rows selected in the table', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedDesc', 'en-US', 'Applies only to the rows selected in the table', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedDesc', 'it-IT', 'Si applica solo alle righe selezionate nella tabella', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedDesc', 'de-DE', 'Gilt nur für die in der Tabelle ausgewählten Zeilen', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedDesc', 'fr-FR', 'S''applique uniquement aux lignes sélectionnées dans le tableau', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedDesc', 'es-ES', 'Se aplica solo a las filas seleccionadas en la tabla', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeSelectedDesc', 'pt-PT', 'Aplica-se apenas às linhas selecionadas na tabela', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllTitle', 'en-GB', 'All {count} items', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllTitle', 'en-US', 'All {count} items', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllTitle', 'it-IT', 'Tutti i {count} elementi', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllTitle', 'de-DE', 'Alle {count} Elemente', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllTitle', 'fr-FR', 'Tous les {count} éléments', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllTitle', 'es-ES', 'Todos los {count} elementos', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllTitle', 'pt-PT', 'Todos os {count} elementos', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllDesc', 'en-GB', 'Applies to every row matching the current filters', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllDesc', 'en-US', 'Applies to every row matching the current filters', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllDesc', 'it-IT', 'Si applica a tutte le righe che corrispondono ai filtri correnti', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllDesc', 'de-DE', 'Gilt für alle Zeilen, die den aktuellen Filtern entsprechen', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllDesc', 'fr-FR', 'S''applique à toutes les lignes correspondant aux filtres actuels', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllDesc', 'es-ES', 'Se aplica a todas las filas que coinciden con los filtros actuales', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1),
('app.common.bulkScopeAllDesc', 'pt-PT', 'Aplica-se a todas as linhas que correspondem aos filtros atuais', now(), 'bulk-scope-keys', now(), 'bulk-scope-keys', 1)
) AS v(key, language, value, created_at, created_by, updated_at, updated_by, version)
WHERE NOT EXISTS (
  SELECT 1 FROM public.translations t WHERE t.key = v.key AND t.language = v.language AND t.deleted_at IS NULL
);

COMMIT;
