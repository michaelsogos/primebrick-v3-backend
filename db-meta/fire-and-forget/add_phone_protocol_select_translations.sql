-- Fire-and-forget: translations for the phone-prefix and protocol select
-- sheet panels (config.phonePrefixSelect / config.protocolSelect).
-- The panels already used these keys but they were never seeded — the UI
-- showed raw keys. Also seeds keys for the upcoming suggested-prefixes
-- section and sort toggle (see ai-plans/sheet-panels-phase2-refresh-button.md).
--
-- Languages: en-GB, en-US, it-IT, fr-FR, es-ES, de-DE, pt-PT
-- Idempotent via ON CONFLICT.

BEGIN;

-- ─── phonePrefixSelect.title ───────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.phonePrefixSelect.title', 'en-GB', 'Select Country Code', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.title', 'en-US', 'Select Country Code', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.title', 'it-IT', 'Seleziona Prefisso', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.title', 'fr-FR', 'Sélectionner l''Indicatif', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.title', 'es-ES', 'Seleccionar Prefijo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.title', 'de-DE', 'Vorwahl Auswählen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.title', 'pt-PT', 'Selecionar Indicativo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── phonePrefixSelect.searchPlaceholder ───────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.phonePrefixSelect.searchPlaceholder', 'en-GB', 'Search country or prefix...', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.searchPlaceholder', 'en-US', 'Search country or prefix...', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.searchPlaceholder', 'it-IT', 'Cerca paese o prefisso...', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.searchPlaceholder', 'fr-FR', 'Rechercher un pays ou un indicatif...', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.searchPlaceholder', 'es-ES', 'Buscar país o prefijo...', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.searchPlaceholder', 'de-DE', 'Land oder Vorwahl suchen...', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.searchPlaceholder', 'pt-PT', 'Pesquisar país ou indicativo...', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── phonePrefixSelect.noResults ───────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.phonePrefixSelect.noResults', 'en-GB', 'No countries found', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.noResults', 'en-US', 'No countries found', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.noResults', 'it-IT', 'Nessun paese trovato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.noResults', 'fr-FR', 'Aucun pays trouvé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.noResults', 'es-ES', 'No se encontraron países', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.noResults', 'de-DE', 'Keine Länder gefunden', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.noResults', 'pt-PT', 'Nenhum país encontrado', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── phonePrefixSelect.suggested (supported-UI-language prefixes, sticky) ──
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.phonePrefixSelect.suggested', 'en-GB', 'Suggested', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.suggested', 'en-US', 'Suggested', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.suggested', 'it-IT', 'Suggeriti', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.suggested', 'fr-FR', 'Suggérés', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.suggested', 'es-ES', 'Sugeridos', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.suggested', 'de-DE', 'Vorgeschlagen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.suggested', 'pt-PT', 'Sugeridos', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── phonePrefixSelect.allCountries ────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.phonePrefixSelect.allCountries', 'en-GB', 'All Countries', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.allCountries', 'en-US', 'All Countries', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.allCountries', 'it-IT', 'Tutti i Paesi', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.allCountries', 'fr-FR', 'Tous les Pays', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.allCountries', 'es-ES', 'Todos los Países', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.allCountries', 'de-DE', 'Alle Länder', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.allCountries', 'pt-PT', 'Todos os Países', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── phonePrefixSelect.sortByName / sortByPrefix (sort toggle) ─────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.phonePrefixSelect.sortByName', 'en-GB', 'Sort A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByName', 'en-US', 'Sort A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByName', 'it-IT', 'Ordina A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByName', 'fr-FR', 'Trier A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByName', 'es-ES', 'Ordenar A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByName', 'de-DE', 'A–Z sortieren', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByName', 'pt-PT', 'Ordenar A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByPrefix', 'en-GB', 'Sort by prefix', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByPrefix', 'en-US', 'Sort by prefix', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByPrefix', 'it-IT', 'Ordina per prefisso', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByPrefix', 'fr-FR', 'Trier par indicatif', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByPrefix', 'es-ES', 'Ordenar por prefijo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByPrefix', 'de-DE', 'Nach Vorwahl sortieren', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.phonePrefixSelect.sortByPrefix', 'pt-PT', 'Ordenar por indicativo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── protocolSelect.title ──────────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.title', 'en-GB', 'Select Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.title', 'en-US', 'Select Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.title', 'it-IT', 'Seleziona Protocollo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.title', 'fr-FR', 'Sélectionner le Protocole', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.title', 'es-ES', 'Seleccionar Protocolo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.title', 'de-DE', 'Protokoll Auswählen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.title', 'pt-PT', 'Selecionar Protocolo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── protocolSelect.noResults ──────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.noResults', 'en-GB', 'No protocols available', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.noResults', 'en-US', 'No protocols available', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.noResults', 'it-IT', 'Nessun protocollo disponibile', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.noResults', 'fr-FR', 'Aucun protocole disponible', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.noResults', 'es-ES', 'No hay protocolos disponibles', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.noResults', 'de-DE', 'Keine Protokolle verfügbar', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.noResults', 'pt-PT', 'Nenhum protocolo disponível', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
