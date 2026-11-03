-- `app.common.validation.lang` — the shared message for the `lang` format
-- token (BCP-47 language tags: it-IT, en, zh-Hans…), evaluated by the core
-- `isLang` predicate via `checkFieldValue`/`jsonSchemaCheck` — same grammar,
-- same message, everywhere.
-- `app.common.showDisabledOptions`/`hideDisabledOptions` — the ComboSelect
-- `disabledToggle` eye CTA labels (reveal/hide the incompatible partition —
-- shown disabled and searchable, never selectable).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.validation.lang', 'en-GB', 'A BCP-47 language tag (e.g. it-IT, en-US)', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.validation.lang', 'en-US', 'A BCP-47 language tag (e.g. it-IT, en-US)', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.validation.lang', 'it-IT', 'Un tag lingua BCP-47 (es. it-IT, en-US)', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.validation.lang', 'de-DE', 'Ein BCP-47-Sprach-Tag (z. B. it-IT, en-US)', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.validation.lang', 'fr-FR', 'Une étiquette de langue BCP-47 (ex. it-IT, en-US)', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.validation.lang', 'es-ES', 'Una etiqueta de idioma BCP-47 (ej. it-IT, en-US)', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.validation.lang', 'pt-PT', 'Uma etiqueta de língua BCP-47 (ex. it-IT, en-US)', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.showDisabledOptions', 'en-GB', 'Show unavailable options', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.showDisabledOptions', 'en-US', 'Show unavailable options', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.showDisabledOptions', 'it-IT', 'Mostra le opzioni non disponibili', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.showDisabledOptions', 'de-DE', 'Nicht verfügbare Optionen anzeigen', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.showDisabledOptions', 'fr-FR', 'Afficher les options indisponibles', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.showDisabledOptions', 'es-ES', 'Mostrar opciones no disponibles', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.showDisabledOptions', 'pt-PT', 'Mostrar opções indisponíveis', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.hideDisabledOptions', 'en-GB', 'Hide unavailable options', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.hideDisabledOptions', 'en-US', 'Hide unavailable options', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.hideDisabledOptions', 'it-IT', 'Nascondi le opzioni non disponibili', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.hideDisabledOptions', 'de-DE', 'Nicht verfügbare Optionen ausblenden', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.hideDisabledOptions', 'fr-FR', 'Masquer les options indisponibles', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.hideDisabledOptions', 'es-ES', 'Ocultar opciones no disponibles', now(), 'migration-lang-format', now(), 'migration-lang-format', 1),
  ('app.common.hideDisabledOptions', 'pt-PT', 'Ocultar opções indisponíveis', now(), 'migration-lang-format', now(), 'migration-lang-format', 1)
ON CONFLICT (key, language) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = 'migration-lang-format';
