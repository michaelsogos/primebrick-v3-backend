-- Primebrick: app.widgets.sequence_pattern.* — time tokens ({HH} 24h,
-- {hh} 12h, {mm} minutes, {ss} seconds) + the used-token `-` CTA label,
-- and the repurposed `tokens.seq_width` text: it no longer describes a
-- second catalog row — it is the counter-row PADDING form label
-- (0 = no padding, the default; N = `{seq:N}` on insert).
--
-- Key collisions avoided by explicit catalog keys: `{MM}` (month) keeps
-- `mm`; `{mm}` (minutes) is `min`; `{HH}`/`{hh}` are `hh`/`hh12`.
--
-- Keys:
--   .remove                  — used-token remove CTA aria/title
--   .tokens.<key>            — hh, hh12, min, ss (new); seq_width (updated)

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.widgets.sequence_pattern.remove', 'en-GB', 'Remove token from pattern', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.remove', 'en-US', 'Remove token from pattern', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.remove', 'it-IT', 'Rimuovi token dal pattern', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.remove', 'fr-FR', 'Retirer le jeton du motif', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.remove', 'es-ES', 'Quitar token del patrón', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.remove', 'de-DE', 'Token aus Muster entfernen', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.remove', 'pt-PT', 'Remover token do padrão', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh', 'en-GB', 'Hour, 24-hour (00–23)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh', 'en-US', 'Hour, 24-hour (00–23)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh', 'it-IT', 'Ora, formato 24h (00–23)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh', 'fr-FR', 'Heure, format 24h (00–23)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh', 'es-ES', 'Hora, formato 24h (00–23)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh', 'de-DE', 'Stunde, 24h-Format (00–23)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh', 'pt-PT', 'Hora, formato 24h (00–23)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh12', 'en-GB', 'Hour, 12-hour (01–12)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh12', 'en-US', 'Hour, 12-hour (01–12)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh12', 'it-IT', 'Ora, formato 12h (01–12)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh12', 'fr-FR', 'Heure, format 12h (01–12)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh12', 'es-ES', 'Hora, formato 12h (01–12)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh12', 'de-DE', 'Stunde, 12h-Format (01–12)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.hh12', 'pt-PT', 'Hora, formato 12h (01–12)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.min', 'en-GB', 'Minutes (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.min', 'en-US', 'Minutes (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.min', 'it-IT', 'Minuti (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.min', 'fr-FR', 'Minutes (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.min', 'es-ES', 'Minutos (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.min', 'de-DE', 'Minuten (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.min', 'pt-PT', 'Minutos (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),

  (uuidv7(), 'app.widgets.sequence_pattern.tokens.ss', 'en-GB', 'Seconds (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.ss', 'en-US', 'Seconds (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.ss', 'it-IT', 'Secondi (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.ss', 'fr-FR', 'Secondes (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.ss', 'es-ES', 'Segundos (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.ss', 'de-DE', 'Sekunden (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.ss', 'pt-PT', 'Segundos (00–59)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1)
ON CONFLICT (key, language) DO NOTHING;

-- `tokens.seq_width` — repurposed: it is the padding-form label under the
-- single `{seq}` row (0 = no padding, the default). DO UPDATE because the
-- key exists since the widget patch.
INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'en-GB', 'Padding — pad to N chars (0 = none)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'en-US', 'Padding — pad to N chars (0 = none)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'it-IT', 'Padding — riempi fino a N caratteri (0 = nessuno)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'fr-FR', 'Remplissage — compléter jusqu’à N caractères (0 = aucun)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'es-ES', 'Relleno — completar hasta N caracteres (0 = ninguno)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'de-DE', 'Auffüllung — auf N Zeichen auffüllen (0 = keine)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1),
  (uuidv7(), 'app.widgets.sequence_pattern.tokens.seq_width', 'pt-PT', 'Preenchimento — completar até N caracteres (0 = nenhum)', now(), 'migration-sequence-pattern-time-tokens', now(), 'migration-sequence-pattern-time-tokens', 1)
ON CONFLICT (key, language) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now(),
  updated_by = 'migration-sequence-pattern-time-tokens',
  version = translations.version + 1;
