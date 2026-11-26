-- ComboSelect render-window truncation hint (user-ratified 2026-11-26): the
-- capped window tells the user the list did NOT end — scroll reveals the next
-- chunk, typing narrows the vocabulary. .one/.other plural pair, shared by
-- every combobox surface.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.combo_more_items.one', 'en-GB', '{count} more item — keep typing to narrow the list', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.one', 'en-US', '{count} more item — keep typing to narrow the list', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.one', 'it-IT', '{count} altro elemento — continua a digitare per restringere la lista', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.one', 'fr-FR', '{count} élément supplémentaire — continuez à taper pour affiner la liste', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.one', 'es-ES', '{count} elemento más — sigue escribiendo para acotar la lista', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.one', 'de-DE', '{count} weiteres Element — tippen Sie weiter, um die Liste einzugrenzen', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.one', 'pt-PT', '{count} elemento adicional — continue a digitar para restringir a lista', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.other', 'en-GB', '{count} more items — keep typing to narrow the list', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.other', 'en-US', '{count} more items — keep typing to narrow the list', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.other', 'it-IT', '{count} altri elementi — continua a digitare per restringere la lista', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.other', 'fr-FR', '{count} éléments supplémentaires — continuez à taper pour affiner la liste', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.other', 'es-ES', '{count} elementos más — sigue escribiendo para acotar la lista', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.other', 'de-DE', '{count} weitere Elemente — tippen Sie weiter, um die Liste einzugrenzen', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1),
  (uuidv7(), 'app.common.combo_more_items.other', 'pt-PT', '{count} elementos adicionais — continue a digitar para restringir a lista', now(), 'migration-combo-render-window', now(), 'migration-combo-render-window', 1);
