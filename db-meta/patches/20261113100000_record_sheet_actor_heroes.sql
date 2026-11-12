-- Record-sheet actor heroes: the record sheet renders two new states for
-- uid-keyed refs —
--   · pseudo_subject: the ref value is NOT a uuid (`system`, seed aliases)
--     → pseudo-actor warning, the record is never fetched.
--   · unavailable: the ref is uuid-shaped but the API reports the subject
--     no longer exists → destructive hero.
-- Texts interpolate `{entity_singular}` (resolved from
-- `<ns>.entities.<translation_key>.singular`) so ONE pair of keys covers
-- every entity — same convention as `page_title.*`.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.record.pseudo_subject', 'en-GB', 'This is a fictitious {entity_singular} not registered in the system', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.pseudo_subject', 'en-US', 'This is a fictitious {entity_singular} not registered in the system', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.pseudo_subject', 'it-IT', 'Questo è un {entity_singular} fittizio non censito nel sistema', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.pseudo_subject', 'fr-FR', 'Ceci est un {entity_singular} fictif non recensé dans le système', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.pseudo_subject', 'es-ES', 'Este es un {entity_singular} ficticio no registrado en el sistema', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.pseudo_subject', 'de-DE', 'Dies ist ein fiktiver {entity_singular}, der nicht im System erfasst ist', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.pseudo_subject', 'pt-PT', 'Este é um {entity_singular} fictício não registado no sistema', now(), 'initial-setup', now(), 'initial-setup', 1),

  (uuidv7(), 'system.entities.record.unavailable', 'en-GB', 'This {entity_singular} is no longer available in the system', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.unavailable', 'en-US', 'This {entity_singular} is no longer available in the system', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.unavailable', 'it-IT', 'Questo {entity_singular} non è più disponibile nel sistema', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.unavailable', 'fr-FR', 'Ce {entity_singular} n''est plus disponible dans le système', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.unavailable', 'es-ES', 'Este {entity_singular} ya no está disponible en el sistema', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.unavailable', 'de-DE', 'Dieser {entity_singular} ist im System nicht mehr verfügbar', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.record.unavailable', 'pt-PT', 'Este {entity_singular} já não está disponível no sistema', now(), 'initial-setup', now(), 'initial-setup', 1);
