-- app.common.selected_count → retired, replaced by the .one/.other key
-- pair picked IN CODE (the canonical plural mechanism — same shape as
-- app.widgets.schedule_spec.unit.*.one/.other). $t() interpolates {var}
-- placeholders ONLY: the old "{count === 1 ? 'x' : 'y'}" values never
-- existed as a contract and rendered the ternary literally.

UPDATE "public"."translations"
SET "deleted_at" = '2026-12-17T00:00:00Z', "deleted_by" = 'migration-selected-count-plural'
WHERE "key" = 'app.common.selected_count' AND "deleted_at" IS NULL;

INSERT INTO "public"."translations" ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
  ('app.common.selected_count.one', 'de-DE', '{count} ausgewählt', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.one', 'en-GB', '{count} selected', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.one', 'en-US', '{count} selected', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.one', 'es-ES', '{count} seleccionado', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.one', 'fr-FR', '{count} sélectionné', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.one', 'it-IT', '{count} selezionato', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.one', 'pt-PT', '{count} selecionado', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.other', 'de-DE', '{count} ausgewählt', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.other', 'en-GB', '{count} selected', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.other', 'en-US', '{count} selected', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.other', 'es-ES', '{count} seleccionados', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.other', 'fr-FR', '{count} sélectionnés', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.other', 'it-IT', '{count} selezionati', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1),
  ('app.common.selected_count.other', 'pt-PT', '{count} selecionados', now(), 'migration-selected-count-plural', now(), 'migration-selected-count-plural', 1)
ON CONFLICT ("key", "language") WHERE "deleted_at" IS NULL DO NOTHING;
