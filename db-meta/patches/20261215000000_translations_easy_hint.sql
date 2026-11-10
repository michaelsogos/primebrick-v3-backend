-- app.common.translations.easy_hint — tooltip of the "easy" engine segment
-- in the translation editor header toggle (browser Translator API).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('app.common.translations.easy_hint', 'en-GB', 'Browser Translator API (built-in)', '2026-12-15T00:00:00Z', 'dev-micha-2', '2026-12-15T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.easy_hint', 'en-US', 'Browser Translator API (built-in)', '2026-12-15T00:00:00Z', 'dev-micha-2', '2026-12-15T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.easy_hint', 'it-IT', 'API Translator del browser (integrata)', '2026-12-15T00:00:00Z', 'dev-micha-2', '2026-12-15T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.easy_hint', 'fr-FR', 'API Translator du navigateur (intégrée)', '2026-12-15T00:00:00Z', 'dev-micha-2', '2026-12-15T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.easy_hint', 'de-DE', 'Browser-Translator-API (integriert)', '2026-12-15T00:00:00Z', 'dev-micha-2', '2026-12-15T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.easy_hint', 'es-ES', 'API Translator del navegador (integrada)', '2026-12-15T00:00:00Z', 'dev-micha-2', '2026-12-15T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.easy_hint', 'pt-PT', 'API Translator do navegador (integrada)', '2026-12-15T00:00:00Z', 'dev-micha-2', '2026-12-15T00:00:00Z', 'dev-micha-2', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
