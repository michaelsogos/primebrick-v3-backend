-- ComboSelect multiSummaryAt collapsed state renders ONE summary chip
-- ("N selected") instead of the per-value badge list. The key is generic
-- (app.common.*) — the system.entities.list.selected* vocabulary stays
-- scoped to the row-selection toolbar.
-- Plural-aware via the seeded expression contract ('{count === 1 ? ...}').
-- snake_case keys per the shared translation-key grammar.

INSERT INTO "public"."translations" ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
  ('app.common.selected_count', 'de-DE', '{count} ausgewählt', now(), 'migration-combo-selected-count', now(), 'migration-combo-selected-count', 1),
  ('app.common.selected_count', 'en-GB', '{count} selected', now(), 'migration-combo-selected-count', now(), 'migration-combo-selected-count', 1),
  ('app.common.selected_count', 'en-US', '{count} selected', now(), 'migration-combo-selected-count', now(), 'migration-combo-selected-count', 1),
  ('app.common.selected_count', 'es-ES', '{count} {count === 1 ? ''seleccionado'' : ''seleccionados''}', now(), 'migration-combo-selected-count', now(), 'migration-combo-selected-count', 1),
  ('app.common.selected_count', 'fr-FR', '{count} {count === 1 ? ''sélectionné'' : ''sélectionnés''}', now(), 'migration-combo-selected-count', now(), 'migration-combo-selected-count', 1),
  ('app.common.selected_count', 'it-IT', '{count} {count === 1 ? ''selezionato'' : ''selezionati''}', now(), 'migration-combo-selected-count', now(), 'migration-combo-selected-count', 1),
  ('app.common.selected_count', 'pt-PT', '{count} {count === 1 ? ''selecionado'' : ''selecionados''}', now(), 'migration-combo-selected-count', now(), 'migration-combo-selected-count', 1)
ON CONFLICT ("key", "language") WHERE "deleted_at" IS NULL DO NOTHING;
