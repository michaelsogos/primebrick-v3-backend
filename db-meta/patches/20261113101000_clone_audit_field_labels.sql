-- Clone-audit field labels: the `Clonable` mixin (dal) serves
-- cloned_from / cloned_at / cloned_by as audited columns on every
-- clonable entity — shared labels live once in system.common.fields.*,
-- same convention as created_at/updated_by/version.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.common.fields.cloned_from', 'en-GB', 'Cloned From', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_from', 'en-US', 'Cloned From', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_from', 'it-IT', 'Clonato Da', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_from', 'fr-FR', 'Cloné Depuis', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_from', 'es-ES', 'Clonado Desde', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_from', 'de-DE', 'Geklont Von', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_from', 'pt-PT', 'Clonado De', now(), 'initial-setup', now(), 'initial-setup', 1),

  (uuidv7(), 'system.common.fields.cloned_at', 'en-GB', 'Cloned At', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_at', 'en-US', 'Cloned At', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_at', 'it-IT', 'Clonato Il', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_at', 'fr-FR', 'Cloné Le', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_at', 'es-ES', 'Clonado El', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_at', 'de-DE', 'Geklont Am', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_at', 'pt-PT', 'Clonado Em', now(), 'initial-setup', now(), 'initial-setup', 1),

  (uuidv7(), 'system.common.fields.cloned_by', 'en-GB', 'Cloned By', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_by', 'en-US', 'Cloned By', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_by', 'it-IT', 'Clonato Da', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_by', 'fr-FR', 'Cloné Par', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_by', 'es-ES', 'Clonado Por', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_by', 'de-DE', 'Geklont Von', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_by', 'pt-PT', 'Clonado Por', now(), 'initial-setup', now(), 'initial-setup', 1);
