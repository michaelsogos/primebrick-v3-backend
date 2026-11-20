-- Dict pager eye filters + footer phrase.
--   system.entities.dict.changes_pending — the dict footer taint label;
--     the configurations key reads "…in:" (field badges follow), dict
--     badges are row identities so no "in" belongs.
--   system.entities.list.view_modified_only_title — eye CTA tooltip for
--     the modified-only filter, sibling of view_selected_only_title.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.dict.changes_pending', 'en-GB', 'Unsaved changes', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.dict.changes_pending', 'en-US', 'Unsaved changes', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.dict.changes_pending', 'it-IT', 'Modifiche non salvate', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.dict.changes_pending', 'fr-FR', 'Modifications non enregistrées', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.dict.changes_pending', 'de-DE', 'Ungespeicherte Änderungen', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.dict.changes_pending', 'es-ES', 'Cambios sin guardar', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.dict.changes_pending', 'pt-PT', 'Alterações por guardar', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.list.view_modified_only_title', 'en-GB', 'Show only modified rows', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.list.view_modified_only_title', 'en-US', 'Show only modified rows', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.list.view_modified_only_title', 'it-IT', 'Mostra solo le righe modificate', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.list.view_modified_only_title', 'fr-FR', 'Afficher uniquement les lignes modifiées', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.list.view_modified_only_title', 'de-DE', 'Nur geänderte Zeilen anzeigen', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.list.view_modified_only_title', 'es-ES', 'Mostrar solo filas modificadas', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1),
  (uuidv7(), 'system.entities.list.view_modified_only_title', 'pt-PT', 'Mostrar apenas linhas modificadas', now(), 'migration-dict-filtered-views', now(), 'migration-dict-filtered-views', 1)
ON CONFLICT (key, language) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = 'migration-dict-filtered-views', version = translations.version + 1;
