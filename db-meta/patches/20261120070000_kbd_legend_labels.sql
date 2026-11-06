-- 20261120070000_kbd_legend_labels.sql
--
-- ELT footer keyboard legend — label copy updates only (the keys name the
-- bindings, the values are copy):
--   keys.select    "Select"      -> "Select Row"      (Space selects the row)
--   keys.actions   "Menu"        -> "Menu/Action"     (Enter opens the row action menu)
--   keys.page      "Page"        -> "Page Up/Down"    (Pag.↑ / Pag.↓)
--   keys.firstLast "First/last"  -> "First/Last Page" (Home / End)

UPDATE system.translations
SET value = v.value,
    updated_at = now(),
    updated_by = 'migration-20261120070000'
FROM (VALUES
  ('system.entities.list.keys.select',    'en-GB', 'Select Row'),
  ('system.entities.list.keys.select',    'en-US', 'Select Row'),
  ('system.entities.list.keys.select',    'it-IT', 'Seleziona Riga'),
  ('system.entities.list.keys.select',    'de-DE', 'Zeile Auswählen'),
  ('system.entities.list.keys.select',    'fr-FR', 'Sélectionner la Ligne'),
  ('system.entities.list.keys.select',    'es-ES', 'Seleccionar Fila'),
  ('system.entities.list.keys.select',    'pt-PT', 'Selecionar Linha'),
  ('system.entities.list.keys.actions',   'en-GB', 'Menu/Action'),
  ('system.entities.list.keys.actions',   'en-US', 'Menu/Action'),
  ('system.entities.list.keys.actions',   'it-IT', 'Menu/Azione'),
  ('system.entities.list.keys.actions',   'de-DE', 'Menü/Aktion'),
  ('system.entities.list.keys.actions',   'fr-FR', 'Menu/Action'),
  ('system.entities.list.keys.actions',   'es-ES', 'Menú/Acción'),
  ('system.entities.list.keys.actions',   'pt-PT', 'Menu/Ação'),
  ('system.entities.list.keys.page',      'en-GB', 'Page Up/Down'),
  ('system.entities.list.keys.page',      'en-US', 'Page Up/Down'),
  ('system.entities.list.keys.page',      'it-IT', 'Pagina Su/Giù'),
  ('system.entities.list.keys.page',      'de-DE', 'Seite Auf/Ab'),
  ('system.entities.list.keys.page',      'fr-FR', 'Page Haut/Bas'),
  ('system.entities.list.keys.page',      'es-ES', 'Página Arriba/Abajo'),
  ('system.entities.list.keys.page',      'pt-PT', 'Página Acima/Abaixo'),
  ('system.entities.list.keys.firstLast', 'en-GB', 'First/Last Page'),
  ('system.entities.list.keys.firstLast', 'en-US', 'First/Last Page'),
  ('system.entities.list.keys.firstLast', 'it-IT', 'Prima/Ultima Pagina'),
  ('system.entities.list.keys.firstLast', 'de-DE', 'Erste/Letzte Seite'),
  ('system.entities.list.keys.firstLast', 'fr-FR', 'Première/Dernière Page'),
  ('system.entities.list.keys.firstLast', 'es-ES', 'Primera/Última Página'),
  ('system.entities.list.keys.firstLast', 'pt-PT', 'Primeira/Última Página')
) AS v(key, language, value)
WHERE system.translations.key = v.key
  AND system.translations.language = v.language
  AND system.translations.deleted_at IS NULL;
