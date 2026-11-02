-- Remove the contextual empty-state subtitles added by
-- 20261106090000_payload_map_empty_state.sql — the approved design is a
-- single animated icon + "Niente da fare qui", no secondary text.
DELETE FROM public.translations
WHERE key IN ('app.widgets.payload_map.empty_hint', 'app.widgets.payload_map.empty_passthrough');
