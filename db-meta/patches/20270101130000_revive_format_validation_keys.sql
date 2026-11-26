-- Format-failure kmsg keys for the revive spec grammars
-- (VALIDATION_FORMAT_KEY(format) = app.common.validation.<format>):
-- `revive_interval` accepts 'N unit' or 'at <ISO>'; `revive_offset`
-- accepts 'N unit' or 'until <ISO>' — the wave-2 literal modes.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.validation.revive_interval', 'en-GB', 'Must be an interval (e.g. "1 year") or an exact date', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_interval', 'en-US', 'Must be an interval (e.g. "1 year") or an exact date', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_interval', 'it-IT', 'Deve essere un intervallo (es. "1 anno") o una data esatta', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_interval', 'fr-FR', 'Doit être un intervalle (ex. « 1 an ») ou une date exacte', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_interval', 'es-ES', 'Debe ser un intervalo (ej. "1 año") o una fecha exacta', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_interval', 'de-DE', 'Muss ein Intervall (z. B. „1 Jahr") oder ein exaktes Datum sein', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_interval', 'pt-PT', 'Deve ser um intervalo (ex. "1 ano") ou uma data exata', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),

  (uuidv7(), 'app.common.validation.revive_offset', 'en-GB', 'Must be an interval or an exact date', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_offset', 'en-US', 'Must be an interval or an exact date', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_offset', 'it-IT', 'Deve essere un intervallo o una data esatta', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_offset', 'fr-FR', 'Doit être un intervalle ou une date exacte', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_offset', 'es-ES', 'Debe ser un intervalo o una fecha exacta', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_offset', 'de-DE', 'Muss ein Intervall oder ein exaktes Datum sein', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1),
  (uuidv7(), 'app.common.validation.revive_offset', 'pt-PT', 'Deve ser um intervalo ou uma data exata', now(), 'migration-revive-format-keys', now(), 'migration-revive-format-keys', 1);
