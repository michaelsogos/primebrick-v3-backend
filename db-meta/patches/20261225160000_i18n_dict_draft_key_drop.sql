-- Primebrick: drop `system.entities.dict.draft` — the composer state chip
-- was removed from DictDraftRow (the info/40 accent alone carries the
-- draft semantics); the key has no remaining consumer.

DELETE FROM system.translations
WHERE key = 'system.entities.dict.draft';
