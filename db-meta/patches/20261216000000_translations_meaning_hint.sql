-- app.common.translations.meaning_hint — label of the free-form "meaning"
-- input shown in powered mode: extra context handed to the AI model
-- alongside the automatic key/entity/facet context.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('app.common.translations.meaning_hint', 'en-GB', 'Meaning hint (optional)', '2026-12-16T00:00:00Z', 'dev-micha-2', '2026-12-16T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.meaning_hint', 'en-US', 'Meaning hint (optional)', '2026-12-16T00:00:00Z', 'dev-micha-2', '2026-12-16T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.meaning_hint', 'it-IT', 'Suggerimento di significato (opzionale)', '2026-12-16T00:00:00Z', 'dev-micha-2', '2026-12-16T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.meaning_hint', 'fr-FR', 'Indice de sens (facultatif)', '2026-12-16T00:00:00Z', 'dev-micha-2', '2026-12-16T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.meaning_hint', 'de-DE', 'Bedeutungshinweis (optional)', '2026-12-16T00:00:00Z', 'dev-micha-2', '2026-12-16T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.meaning_hint', 'es-ES', 'Pista de significado (opcional)', '2026-12-16T00:00:00Z', 'dev-micha-2', '2026-12-16T00:00:00Z', 'dev-micha-2', 1),
('app.common.translations.meaning_hint', 'pt-PT', 'Sugestão de significado (opcional)', '2026-12-16T00:00:00Z', 'dev-micha-2', '2026-12-16T00:00:00Z', 'dev-micha-2', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
