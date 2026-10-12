-- Fire-and-forget: translations for the docs-index admin page
-- (/system/settings/docs-index) — KB inventory, drift, ingest history,
-- force-reindex actions.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!

BEGIN;

-- ─── system.settings.tabs.docsIndex ────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.tabs.docsIndex', 'en-GB', 'Docs index', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.docsIndex', 'en-US', 'Docs index', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.docsIndex', 'it-IT', 'Indice documenti', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.docsIndex', 'fr-FR', 'Index des documents', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.docsIndex', 'es-ES', 'Índice de documentos', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.docsIndex', 'de-DE', 'Dokumentenindex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.tabs.docsIndex', 'pt-PT', 'Índice de documentos', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- ─── system.settings.docsIndex.* ───────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.docsIndex.title', 'en-GB', 'Documentation index', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.title', 'it-IT', 'Indice della documentazione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.description', 'en-GB', 'Knowledge-base index status, source-vs-index drift and ingestion history across all modules.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.description', 'it-IT', 'Stato dell''indice della knowledge base, drift sorgente-indice e storico indicizzazioni di tutti i moduli.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.loadFailed', 'en-GB', 'Failed to load the index status', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.loadFailed', 'it-IT', 'Caricamento dello stato dell''indice fallito', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.section.index', 'en-GB', 'Index inventory', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.section.index', 'it-IT', 'Inventario indice', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.section.drift', 'en-GB', 'Source vs index drift', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.section.drift', 'it-IT', 'Drift sorgente-indice', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.section.history', 'en-GB', 'Ingestion history', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.section.history', 'it-IT', 'Storico indicizzazioni', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.section.probes', 'en-GB', 'Search probes', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.section.probes', 'it-IT', 'Probe di ricerca', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.repo', 'en-GB', 'Repo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.docs', 'en-GB', 'Docs', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.chunks', 'en-GB', 'Chunks', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.unembedded', 'en-GB', 'Unembedded', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.repo', 'it-IT', 'Repo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.docs', 'it-IT', 'Documenti', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.chunks', 'it-IT', 'Chunk', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.unembedded', 'it-IT', 'Non embeddati', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.trigger', 'en-GB', 'Trigger', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.result', 'en-GB', 'Result', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.when', 'en-GB', 'When', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.service', 'en-GB', 'Service', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.status', 'en-GB', 'Status', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.result', 'it-IT', 'Esito', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.when', 'it-IT', 'Quando', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.service', 'it-IT', 'Servizio', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.trigger', 'it-IT', 'Trigger', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.status', 'it-IT', 'Stato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.aligned', 'en-GB', 'Aligned', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.aligned', 'it-IT', 'Allineato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.driftDetected', 'en-GB', 'Drift detected', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.driftDetected', 'it-IT', 'Drift rilevato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.missing', 'en-GB', 'Missing from index', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.missing', 'it-IT', 'Mancanti nell''indice', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.stale', 'en-GB', 'Stale (changed content)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.stale', 'it-IT', 'Obsoleti (contenuto modificato)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.orphans', 'en-GB', 'Orphans (not in pack)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.orphans', 'it-IT', 'Orfani (non nel pack)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindexAll', 'en-GB', 'Reindex all', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindexAll', 'it-IT', 'Reindicizza tutto', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindex', 'en-GB', 'Reindex', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindex', 'it-IT', 'Reindicizza', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindexing', 'en-GB', 'Reindexing…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindexing', 'it-IT', 'Reindicizzazione…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindexDone', 'en-GB', 'Reindex completed', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindexDone', 'it-IT', 'Reindicizzazione completata', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindexFailed', 'en-GB', 'Reindex failed', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.reindexFailed', 'it-IT', 'Reindicizzazione fallita', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.runProbes', 'en-GB', 'Run search probes', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.runProbes', 'it-IT', 'Esegui probe di ricerca', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.probesHint', 'en-GB', 'Canonical queries verified against the live index — would the guide find the doc?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.probesHint', 'it-IT', 'Query canoniche verificate sull''indice reale — la guida troverebbe il documento?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.packError', 'en-GB', 'Pack unreachable', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.packError', 'it-IT', 'Pack non raggiungibile', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.storage', 'en-GB', 'Index size', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.storage', 'it-IT', 'Dimensione indice', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.contentSize', 'en-GB', 'Content', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.contentSize', 'it-IT', 'Contenuto', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.vectorSize', 'en-GB', 'Vectors', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.vectorSize', 'it-IT', 'Vettori', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.expectedDocs', 'en-GB', 'Pack docs', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.expectedDocs', 'it-IT', 'Doc nel pack', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.expectedChunks', 'en-GB', 'Pack chunks', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.docsIndex.col.expectedChunks', 'it-IT', 'Chunk nel pack', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

COMMIT;
