-- Primebrick: translations.language — CHECK constraint against the
-- canonical supported-language vocabulary (SUPPORTED_LANGUAGES in
-- @primebrick/core — this literal list MUST mirror it; the
-- `i18n-language-literal` check-standards rule enforces parity).
--
-- Prevents the historical drift: seed patches wrote short codes ('it',
-- 'en') instead of full BCP-47 tags — translations silently failed to
-- resolve at runtime. Bad language values now fail loudly at INSERT.

ALTER TABLE public.translations
  ADD CONSTRAINT translations_language_supported_chk
  CHECK (language IN ('en-GB','en-US','it-IT','fr-FR','es-ES','de-DE','pt-PT'));

ALTER TABLE system.translations
  ADD CONSTRAINT translations_language_supported_chk
  CHECK (language IN ('en-GB','en-US','it-IT','fr-FR','es-ES','de-DE','pt-PT'));

ALTER TABLE custom.translations
  ADD CONSTRAINT translations_language_supported_chk
  CHECK (language IN ('en-GB','en-US','it-IT','fr-FR','es-ES','de-DE','pt-PT'));
