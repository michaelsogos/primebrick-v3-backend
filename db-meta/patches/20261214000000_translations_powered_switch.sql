-- app.common.translations.powered + powered_hint — the easy⇄powered engine
-- switch in the translation editor sheet header (POC: Xenova/m2m100_418M
-- seq2seq worker vs the browser Translator API).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('app.common.translations.powered', 'en-GB', 'Powered', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered', 'en-US', 'Powered', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered', 'it-IT', 'Potenziato', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered', 'fr-FR', 'Avancé', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered', 'de-DE', 'Erweitert', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered', 'es-ES', 'Potenciado', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered', 'pt-PT', 'Avançado', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered_hint', 'en-GB', 'Local MT model (POC) — off uses the browser Translator API', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered_hint', 'en-US', 'Local MT model (POC) — off uses the browser Translator API', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered_hint', 'it-IT', 'Modello MT locale (POC) — off usa l''API Translator del browser', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered_hint', 'fr-FR', 'Modèle MT local (POC) — off : API Translator du navigateur', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered_hint', 'de-DE', 'Lokales MT-Modell (POC) — aus: Browser-Translator-API', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered_hint', 'es-ES', 'Modelo MT local (POC) — off: API Translator del navegador', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.powered_hint', 'pt-PT', 'Modelo MT local (POC) — off: API Translator do navegador', '2026-12-14T00:00:00Z', 'dev-micha-2', '2026-12-14T00:00:00Z', 'dev-micha-2', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
