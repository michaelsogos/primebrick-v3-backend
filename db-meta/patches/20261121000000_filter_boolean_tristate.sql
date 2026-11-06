-- Filters sheet — boolean tri-state criterion labels
-- (`system.entities.list.booleanAny|booleanTrue|booleanFalse`) rendered by
-- the shared dispatcher's boolean_tristate control, and the field-list
-- search placeholder (`searchFields`) shared by the standard and
-- advanced tabs.
--
-- Copy tone: user-facing answers ("Any / Yes / No"), no DB jargon.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.list.booleanAny', 'en-GB', 'Any', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanAny', 'en-US', 'Any', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanAny', 'it-IT', 'Qualsiasi', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanAny', 'de-DE', 'Beliebig', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanAny', 'fr-FR', 'Tous', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanAny', 'es-ES', 'Cualquiera', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanAny', 'pt-PT', 'Qualquer', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),

  ('system.entities.list.booleanTrue', 'en-GB', 'Yes', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanTrue', 'en-US', 'Yes', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanTrue', 'it-IT', 'Sì', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanTrue', 'de-DE', 'Ja', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanTrue', 'fr-FR', 'Oui', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanTrue', 'es-ES', 'Sí', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanTrue', 'pt-PT', 'Sim', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),

  ('system.entities.list.booleanFalse', 'en-GB', 'No', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanFalse', 'en-US', 'No', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanFalse', 'it-IT', 'No', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanFalse', 'de-DE', 'Nein', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanFalse', 'fr-FR', 'Non', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanFalse', 'es-ES', 'No', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.booleanFalse', 'pt-PT', 'Não', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),

  ('system.entities.list.searchFields', 'en-GB', 'Search fields…', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.searchFields', 'en-US', 'Search fields…', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.searchFields', 'it-IT', 'Cerca campi…', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.searchFields', 'de-DE', 'Felder suchen…', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.searchFields', 'fr-FR', 'Rechercher des champs…', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.searchFields', 'es-ES', 'Buscar campos…', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1),
  ('system.entities.list.searchFields', 'pt-PT', 'Pesquisar campos…', now(), 'migration-filter-tristate', now(), 'migration-filter-tristate', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
