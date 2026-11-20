-- Primebrick: `customer_link_type` entity label — it-IT rename.
-- "tipo collegamento" → "relazione clienti" (user terminology: the entity
-- models a customer RELATIONSHIP type, not a generic link). Touch every
-- it-IT surface that carried the old term: nav, title, plural, singular
-- and the new-record title (sentence case per the new.title convention).

UPDATE crm.translations SET value = 'Tipi Relazione Clienti', updated_at = now(), updated_by = 'migration-linktype-rename-i18n', version = version + 1
WHERE key = 'crm.customer_link_types.nav' AND language = 'it-IT';
UPDATE crm.translations SET value = 'Tipi Relazione Clienti', updated_at = now(), updated_by = 'migration-linktype-rename-i18n', version = version + 1
WHERE key = 'crm.entities.customer_link_type.title' AND language = 'it-IT';
UPDATE crm.translations SET value = 'Tipi Relazione Clienti', updated_at = now(), updated_by = 'migration-linktype-rename-i18n', version = version + 1
WHERE key = 'crm.entities.customer_link_type.plural' AND language = 'it-IT';
UPDATE crm.translations SET value = 'Tipo Relazione Clienti', updated_at = now(), updated_by = 'migration-linktype-rename-i18n', version = version + 1
WHERE key = 'crm.entities.customer_link_type.singular' AND language = 'it-IT';
UPDATE crm.translations SET value = 'Nuovo tipo relazione clienti', updated_at = now(), updated_by = 'migration-linktype-rename-i18n', version = version + 1
WHERE key = 'crm.entities.customer_link_type.new.title' AND language = 'it-IT';
