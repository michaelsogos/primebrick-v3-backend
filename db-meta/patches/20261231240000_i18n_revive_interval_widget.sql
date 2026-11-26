-- `format:"revive_interval"` widget + sequence revive contract i18n
-- (bugfix-sequence-create-form-contract):
--
--   • `app.widgets.revive_interval.unit.<unit>` — the 5-unit dropdown
--     vocabulary (day|week|month|quarter|year — exactly
--     UOM_DROPDOWN_MAX_OPTIONS, internal dropdown, no picker sheet).
--   • `app.common.validation.sequence_*` — the keyed issues
--     `sequenceReviveShapeIssues` emits (same predicate the wire
--     validator and the form registry share): {slot}/{value}/{every}
--     placeholders interpolate via the `|<json>` kmsg carrier.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  -- ── unit dropdown ─────────────────────────────────────────────────
  (uuidv7(), 'app.widgets.revive_interval.unit.day', 'en-GB', 'Day', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.day', 'en-US', 'Day', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.day', 'it-IT', 'Giorno', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.day', 'fr-FR', 'Jour', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.day', 'es-ES', 'Día', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.day', 'de-DE', 'Tag', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.day', 'pt-PT', 'Dia', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  (uuidv7(), 'app.widgets.revive_interval.unit.week', 'en-GB', 'Week', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.week', 'en-US', 'Week', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.week', 'it-IT', 'Settimana', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.week', 'fr-FR', 'Semaine', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.week', 'es-ES', 'Semana', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.week', 'de-DE', 'Woche', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.week', 'pt-PT', 'Semana', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  (uuidv7(), 'app.widgets.revive_interval.unit.month', 'en-GB', 'Month', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.month', 'en-US', 'Month', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.month', 'it-IT', 'Mese', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.month', 'fr-FR', 'Mois', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.month', 'es-ES', 'Mes', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.month', 'de-DE', 'Monat', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.month', 'pt-PT', 'Mês', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  (uuidv7(), 'app.widgets.revive_interval.unit.quarter', 'en-GB', 'Quarter', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.quarter', 'en-US', 'Quarter', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.quarter', 'it-IT', 'Trimestre', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.quarter', 'fr-FR', 'Trimestre', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.quarter', 'es-ES', 'Trimestre', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.quarter', 'de-DE', 'Quartal', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.quarter', 'pt-PT', 'Trimestre', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  (uuidv7(), 'app.widgets.revive_interval.unit.year', 'en-GB', 'Year', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.year', 'en-US', 'Year', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.year', 'it-IT', 'Anno', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.year', 'fr-FR', 'Année', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.year', 'es-ES', 'Año', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.year', 'de-DE', 'Jahr', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.widgets.revive_interval.unit.year', 'pt-PT', 'Ano', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  -- ── revive contract validation keys ───────────────────────────────
  (uuidv7(), 'app.common.validation.sequence_sez_not_in_pattern', 'en-GB', 'Sezionale "{slot}" is not used by the pattern', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_sez_not_in_pattern', 'en-US', 'Sezionale "{slot}" is not used by the pattern', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_sez_not_in_pattern', 'it-IT', 'Il sezionale "{slot}" non è usato dal pattern', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_sez_not_in_pattern', 'fr-FR', 'Le sezionale "{slot}" n''est pas utilisé par le motif', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_sez_not_in_pattern', 'es-ES', 'El sezionale "{slot}" no se usa en el patrón', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_sez_not_in_pattern', 'de-DE', 'Der Sezionale "{slot}" wird vom Muster nicht verwendet', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_sez_not_in_pattern', 'pt-PT', 'O sezionale "{slot}" não é usado pelo padrão', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  (uuidv7(), 'app.common.validation.sequence_revive_slot_requires_every', 'en-GB', 'A revive slot needs a revive interval', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_requires_every', 'en-US', 'A revive slot needs a revive interval', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_requires_every', 'it-IT', 'Lo slot di rinnovo richiede un intervallo di rinnovo', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_requires_every', 'fr-FR', 'Le slot de renouvellement nécessite un intervalle', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_requires_every', 'es-ES', 'El slot de renovación necesita un intervalo', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_requires_every', 'de-DE', 'Der Erneuerungs-Slot benötigt ein Intervall', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_requires_every', 'pt-PT', 'O slot de renovação precisa de um intervalo', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  (uuidv7(), 'app.common.validation.sequence_revive_slot_required', 'en-GB', 'Choose which sezionale the revive advances', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_required', 'en-US', 'Choose which sezionale the revive advances', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_required', 'it-IT', 'Scegli quale sezionale avanzare al rinnovo', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_required', 'fr-FR', 'Choisissez quel sezionale le renouvellement fait avancer', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_required', 'es-ES', 'Elige qué sezionale avanza la renovación', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_required', 'de-DE', 'Wählen Sie, welcher Sezionale bei der Erneuerung vorrückt', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_required', 'pt-PT', 'Escolha qual sezionale a renovação avança', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  (uuidv7(), 'app.common.validation.sequence_revive_slot_not_in_pattern', 'en-GB', '"{slot}" is not a sezionale the pattern uses', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_not_in_pattern', 'en-US', '"{slot}" is not a sezionale the pattern uses', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_not_in_pattern', 'it-IT', '"{slot}" non è un sezionale usato dal pattern', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_not_in_pattern', 'fr-FR', '"{slot}" n''est pas un sezionale utilisé par le motif', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_not_in_pattern', 'es-ES', '"{slot}" no es un sezionale que el patrón use', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_not_in_pattern', 'de-DE', '"{slot}" ist kein vom Muster verwendeter Sezionale', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_not_in_pattern', 'pt-PT', '"{slot}" não é um sezionale usado pelo padrão', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  (uuidv7(), 'app.common.validation.sequence_revive_slot_value_required', 'en-GB', 'Sezionale "{slot}" needs a value for the revive to advance', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_value_required', 'en-US', 'Sezionale "{slot}" needs a value for the revive to advance', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_value_required', 'it-IT', 'Il sezionale "{slot}" richiede un valore per il rinnovo', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_value_required', 'fr-FR', 'Le sezionale "{slot}" nécessite une valeur pour le renouvellement', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_value_required', 'es-ES', 'El sezionale "{slot}" necesita un valor para la renovación', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_value_required', 'de-DE', 'Der Sezionale "{slot}" benötigt einen Wert für die Erneuerung', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_slot_value_required', 'pt-PT', 'O sezionale "{slot}" precisa de um valor para a renovação', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),

  (uuidv7(), 'app.common.validation.sequence_revive_value_not_advancable', 'en-GB', '"{value}" cannot be advanced by "{every}" — use a date-like sezionale (e.g. 2026, 2026-03)', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_value_not_advancable', 'en-US', '"{value}" cannot be advanced by "{every}" — use a date-like sezionale (e.g. 2026, 2026-03)', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_value_not_advancable', 'it-IT', '"{value}" non può avanzare di "{every}" — usa un sezionale a data (es. 2026, 2026-03)', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_value_not_advancable', 'fr-FR', '"{value}" ne peut pas avancer de "{every}" — utilisez un sezionale de type date (ex. 2026, 2026-03)', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_value_not_advancable', 'es-ES', '"{value}" no puede avanzar en "{every}" — usa un sezionale de tipo fecha (p. ej. 2026, 2026-03)', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_value_not_advancable', 'de-DE', '"{value}" kann nicht um "{every}" vorrücken — verwenden Sie einen datumsartigen Sezionale (z. B. 2026, 2026-03)', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1),
  (uuidv7(), 'app.common.validation.sequence_revive_value_not_advancable', 'pt-PT', '"{value}" não pode avançar em "{every}" — use um sezionale de data (ex. 2026, 2026-03)', now(), 'migration-revive-interval-widget', now(), 'migration-revive-interval-widget', 1);
