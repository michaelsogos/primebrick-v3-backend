-- Primebrick: ELT bulk editor — update.bulk CTA, governed confirm and the
-- `entity.bulkEditor` sheet vocabulary.
--
-- app.common.* (shared):
--   app.common.update_entities_confirm — the `runEntityOp` confirm question
--     served on `update.bulk` (`confirm_key`), rendered with {count, entity}.
--
-- system.entities.list.bulk_actions.* (ELT bulk bar):
--   .edit — the bulk-edit CTA label.
--
-- system.entities.bulk_editor.* (the apply-to-all builder sheet):
--   .title / .add_field / .field_placeholder / .apply / .distribution /
--   .affected / .already_current / .mixed / .empty_value / .no_editable /
--   .rows_panel_title / .selection_summary / .immutable_section

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.update_entities_confirm', 'en-GB', 'Apply the changes to {count} {entity}?', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'app.common.update_entities_confirm', 'en-US', 'Apply the changes to {count} {entity}?', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'app.common.update_entities_confirm', 'it-IT', 'Applicare le modifiche a {count} {entity}?', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'app.common.update_entities_confirm', 'fr-FR', 'Appliquer les modifications à {count} {entity} ?', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'app.common.update_entities_confirm', 'es-ES', '¿Aplicar los cambios a {count} {entity}?', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'app.common.update_entities_confirm', 'de-DE', 'Änderungen auf {count} {entity} anwenden?', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'app.common.update_entities_confirm', 'pt-PT', 'Aplicar as alterações a {count} {entity}?', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.list.bulk_actions.edit', 'en-GB', 'Edit', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.list.bulk_actions.edit', 'en-US', 'Edit', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.list.bulk_actions.edit', 'it-IT', 'Modifica', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.list.bulk_actions.edit', 'fr-FR', 'Modifier', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.list.bulk_actions.edit', 'es-ES', 'Modificar', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.list.bulk_actions.edit', 'de-DE', 'Bearbeiten', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.list.bulk_actions.edit', 'pt-PT', 'Editar', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.bulk_editor.title', 'en-GB', 'Bulk edit', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.title', 'en-US', 'Bulk edit', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.title', 'it-IT', 'Modifica massiva', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.title', 'fr-FR', 'Modification en masse', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.title', 'es-ES', 'Edición masiva', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.title', 'de-DE', 'Massenbearbeitung', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.title', 'pt-PT', 'Edição em massa', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.selection_summary', 'en-GB', '{count} {entity} selected', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.selection_summary', 'en-US', '{count} {entity} selected', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.selection_summary', 'it-IT', '{count} {entity} selezionati', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.selection_summary', 'fr-FR', '{count} {entity} sélectionnés', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.selection_summary', 'es-ES', '{count} {entity} seleccionados', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.selection_summary', 'de-DE', '{count} {entity} ausgewählt', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.selection_summary', 'pt-PT', '{count} {entity} selecionados', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.add_field', 'en-GB', 'Add field', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.add_field', 'en-US', 'Add field', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.add_field', 'it-IT', 'Aggiungi campo', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.add_field', 'fr-FR', 'Ajouter un champ', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.add_field', 'es-ES', 'Añadir campo', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.add_field', 'de-DE', 'Feld hinzufügen', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.add_field', 'pt-PT', 'Adicionar campo', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.field_placeholder', 'en-GB', 'Choose a field…', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.field_placeholder', 'en-US', 'Choose a field…', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.field_placeholder', 'it-IT', 'Scegli un campo…', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.field_placeholder', 'fr-FR', 'Choisir un champ…', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.field_placeholder', 'es-ES', 'Elegir un campo…', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.field_placeholder', 'de-DE', 'Feld wählen…', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.field_placeholder', 'pt-PT', 'Escolher um campo…', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.apply', 'en-GB', 'Apply to {count} rows', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.apply', 'en-US', 'Apply to {count} rows', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.apply', 'it-IT', 'Applica a {count} righe', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.apply', 'fr-FR', 'Appliquer à {count} lignes', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.apply', 'es-ES', 'Aplicar a {count} filas', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.apply', 'de-DE', 'Auf {count} Zeilen anwenden', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.apply', 'pt-PT', 'Aplicar a {count} linhas', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.distribution', 'en-GB', 'Current values', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.distribution', 'en-US', 'Current values', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.distribution', 'it-IT', 'Valori attuali', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.distribution', 'fr-FR', 'Valeurs actuelles', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.distribution', 'es-ES', 'Valores actuales', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.distribution', 'de-DE', 'Aktuelle Werte', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.distribution', 'pt-PT', 'Valores atuais', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.affected', 'en-GB', '{count} affected', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.affected', 'en-US', '{count} affected', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.affected', 'it-IT', '{count} coinvolte', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.affected', 'fr-FR', '{count} concernées', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.affected', 'es-ES', '{count} afectadas', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.affected', 'de-DE', '{count} betroffen', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.affected', 'pt-PT', '{count} afetadas', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.already_current', 'en-GB', '{count} already up to date', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.already_current', 'en-US', '{count} already up to date', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.already_current', 'it-IT', '{count} già aggiornate', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.already_current', 'fr-FR', '{count} déjà à jour', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.already_current', 'es-ES', '{count} ya actualizadas', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.already_current', 'de-DE', '{count} bereits aktuell', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.already_current', 'pt-PT', '{count} já atualizadas', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.mixed', 'en-GB', 'Mixed values', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.mixed', 'en-US', 'Mixed values', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.mixed', 'it-IT', 'Valori diversi', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.mixed', 'fr-FR', 'Valeurs différentes', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.mixed', 'es-ES', 'Valores diferentes', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.mixed', 'de-DE', 'Verschiedene Werte', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.mixed', 'pt-PT', 'Valores diferentes', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.empty_value', 'en-GB', '(empty)', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.empty_value', 'en-US', '(empty)', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.empty_value', 'it-IT', '(vuoto)', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.empty_value', 'fr-FR', '(vide)', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.empty_value', 'es-ES', '(vacío)', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.empty_value', 'de-DE', '(leer)', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.empty_value', 'pt-PT', '(vazio)', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.no_editable', 'en-GB', 'No editable fields for a bulk update', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.no_editable', 'en-US', 'No editable fields for a bulk update', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.no_editable', 'it-IT', 'Nessun campo modificabile in massa', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.no_editable', 'fr-FR', 'Aucun champ modifiable en masse', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.no_editable', 'es-ES', 'Ningún campo editable en masa', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.no_editable', 'de-DE', 'Keine massenbearbeitbaren Felder', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.no_editable', 'pt-PT', 'Nenhum campo editável em massa', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.rows_panel_title', 'en-GB', 'Rows — {field}', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.rows_panel_title', 'en-US', 'Rows — {field}', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.rows_panel_title', 'it-IT', 'Righe — {field}', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.rows_panel_title', 'fr-FR', 'Lignes — {field}', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.rows_panel_title', 'es-ES', 'Filas — {field}', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.rows_panel_title', 'de-DE', 'Zeilen — {field}', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.rows_panel_title', 'pt-PT', 'Linhas — {field}', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.immutable_section', 'en-GB', 'Read-only fields', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.immutable_section', 'en-US', 'Read-only fields', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.immutable_section', 'it-IT', 'Campi di sola lettura', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.immutable_section', 'fr-FR', 'Champs en lecture seule', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.immutable_section', 'es-ES', 'Campos de solo lectura', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.immutable_section', 'de-DE', 'Schreibgeschützte Felder', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1),
  (uuidv7(), 'system.entities.bulk_editor.immutable_section', 'pt-PT', 'Campos somente leitura', now(), 'migration-bulk-editor-i18n', now(), 'migration-bulk-editor-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
