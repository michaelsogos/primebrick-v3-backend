-- Primebrick: mapper-viewer-i18n — seeds the `app.widgets.mapper.*`
-- vocabulary the payload-map VIEWER (v3-ui) + its cell link/sheet title
-- consume. The keys existed only in the FE's English-only pre-auth
-- fallback, so every authenticated non-EN locale rendered English.
-- `source`/`dest_event` are new — the panel's full-width badge labels.
-- Kind/field/meta labels are intentionally absent: the viewer reuses the
-- already-seeded `app.widgets.payload_map.*` vocabulary.
-- `unmapped` keeps the `({count})` placeholder contract the component
-- interpolates.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  -- app.widgets.mapper.view — the list-cell link that opens the sheet
  (uuidv7(), 'app.widgets.mapper.view', 'en-GB', 'View map', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.view', 'en-US', 'View map', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.view', 'it-IT', 'Vedi mappa', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.view', 'fr-FR', 'Voir le mappage', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.view', 'es-ES', 'Ver mapa', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.view', 'de-DE', 'Zuordnung ansehen', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.view', 'pt-PT', 'Ver mapa', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  -- app.widgets.mapper.title — the mapperViewer sheet title
  (uuidv7(), 'app.widgets.mapper.title', 'en-GB', 'Mapping', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.title', 'en-US', 'Mapping', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.title', 'it-IT', 'Mappatura', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.title', 'fr-FR', 'Mappage', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.title', 'es-ES', 'Asignación', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.title', 'de-DE', 'Zuordnung', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.title', 'pt-PT', 'Mapeamento', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  -- app.widgets.mapper.empty — no payload_map authored on the row
  (uuidv7(), 'app.widgets.mapper.empty', 'en-GB', 'No mappings authored — the event payload is forwarded unchanged.', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.empty', 'en-US', 'No mappings authored — the event payload is forwarded unchanged.', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.empty', 'it-IT', 'Nessuna mappatura definita — il payload dell''evento viene inoltrato invariato.', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.empty', 'fr-FR', 'Aucun mappage défini — la charge utile de l''événement est transmise inchangée.', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.empty', 'es-ES', 'No hay mapeos definidos — la carga útil del evento se reenvía sin cambios.', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.empty', 'de-DE', 'Keine Zuordnungen definiert — die Ereignisdaten werden unverändert weitergeleitet.', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.empty', 'pt-PT', 'Nenhum mapeamento definido — o payload do evento é reencaminhado sem alterações.', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  -- app.widgets.mapper.unmapped — the unmapped-fields accordion header ({count} interpolated)
  (uuidv7(), 'app.widgets.mapper.unmapped', 'en-GB', 'Unmapped fields ({count})', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.unmapped', 'en-US', 'Unmapped fields ({count})', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.unmapped', 'it-IT', 'Campi non mappati ({count})', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.unmapped', 'fr-FR', 'Champs non mappés ({count})', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.unmapped', 'es-ES', 'Campos no asignados ({count})', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.unmapped', 'de-DE', 'Nicht zugeordnete Felder ({count})', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.unmapped', 'pt-PT', 'Campos não mapeados ({count})', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  -- app.widgets.mapper.not_mapped — per-field "no mapping" marker in the unmapped list
  (uuidv7(), 'app.widgets.mapper.not_mapped', 'en-GB', 'not mapped', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.not_mapped', 'en-US', 'not mapped', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.not_mapped', 'it-IT', 'non mappato', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.not_mapped', 'fr-FR', 'non mappé', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.not_mapped', 'es-ES', 'no asignado', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.not_mapped', 'de-DE', 'nicht zugeordnet', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.not_mapped', 'pt-PT', 'não mapeado', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  -- app.widgets.mapper.source — the full-width source-endpoint badge (event emit or schedule)
  (uuidv7(), 'app.widgets.mapper.source', 'en-GB', 'SOURCE', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.source', 'en-US', 'SOURCE', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.source', 'it-IT', 'SORGENTE', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.source', 'fr-FR', 'SOURCE', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.source', 'es-ES', 'ORIGEN', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.source', 'de-DE', 'QUELLE', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.source', 'pt-PT', 'ORIGEM', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  -- app.widgets.mapper.dest_event — the full-width destination-endpoint badge (callable)
  (uuidv7(), 'app.widgets.mapper.dest_event', 'en-GB', 'DEST EVENT', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.dest_event', 'en-US', 'DEST EVENT', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.dest_event', 'it-IT', 'EVENTO DEST', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.dest_event', 'fr-FR', 'ÉVÉNEMENT DEST', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.dest_event', 'es-ES', 'EVENTO DEST', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.dest_event', 'de-DE', 'ZIEL-EVENT', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1),
  (uuidv7(), 'app.widgets.mapper.dest_event', 'pt-PT', 'EVENTO DEST', now(), 'migration-mapper-viewer', now(), 'migration-mapper-viewer', 1);
