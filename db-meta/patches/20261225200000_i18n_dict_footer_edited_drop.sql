-- Drop orphaned dict footer aggregate label.
-- The footer UX guard now collapses overflow into a "+N" badge (no text
-- label), so system.entities.dict.footer_edited has no consumer.

DELETE FROM system.translations
WHERE key = 'system.entities.dict.footer_edited';
