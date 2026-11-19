-- Primebrick: `app.entity_events.event.batch` — the envelope correlation
-- id label. The bare "Batch" read ambiguous next to `uuids` ("Righe
-- interessate"): `batch` IS a uuidv7 stamped on every thin event of one
-- bulk op — "Batch UUID" names the thing (an id), not the bag.

UPDATE public.translations SET value = 'Batch UUID', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.event.batch' AND language = 'en-GB';
UPDATE public.translations SET value = 'Batch UUID', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.event.batch' AND language = 'en-US';
UPDATE public.translations SET value = 'UUID batch', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.event.batch' AND language = 'it-IT';
UPDATE public.translations SET value = 'UUID du lot', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.event.batch' AND language = 'fr-FR';
UPDATE public.translations SET value = 'UUID de lote', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.event.batch' AND language = 'es-ES';
UPDATE public.translations SET value = 'Batch-UUID', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.event.batch' AND language = 'de-DE';
UPDATE public.translations SET value = 'UUID do lote', updated_at = now(), updated_by = 'migration-entity-events-i18n', version = version + 1
WHERE key = 'app.entity_events.event.batch' AND language = 'pt-PT';
