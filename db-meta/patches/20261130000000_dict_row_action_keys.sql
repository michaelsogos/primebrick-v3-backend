-- Primebrick: dict-row action + required-field keys (public.translations / app.*).
--
-- The dict archetype's reorder chevrons need DISTINCT accessible labels
-- (the shared `keys.move` = "Move" is the keyboard-legend wording, wrong
-- for two opposite actions), and the required-empty save gate surfaces
-- its reason inline per cell — these keys must exist or the controls
-- render raw keys. Same shape as the dict error-scope patch.

INSERT INTO "public"."translations" ("key", "language", "value", "created_at", "created_by", "updated_at", "updated_by", "version") VALUES
  ('system.entities.list.keys.moveUp', 'de-DE', 'Nach oben verschieben', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveUp', 'en-GB', 'Move up', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveUp', 'en-US', 'Move up', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveUp', 'es-ES', 'Mover arriba', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveUp', 'fr-FR', 'Déplacer vers le haut', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveUp', 'it-IT', 'Sposta su', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveUp', 'pt-PT', 'Mover para cima', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveDown', 'de-DE', 'Nach unten verschieben', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveDown', 'en-GB', 'Move down', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveDown', 'en-US', 'Move down', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveDown', 'es-ES', 'Mover abajo', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveDown', 'fr-FR', 'Déplacer vers le bas', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveDown', 'it-IT', 'Sposta giù', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('system.entities.list.keys.moveDown', 'pt-PT', 'Mover para baixo', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('app.common.errors.required', 'de-DE', 'Erforderlich', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('app.common.errors.required', 'en-GB', 'Required', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('app.common.errors.required', 'en-US', 'Required', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('app.common.errors.required', 'es-ES', 'Obligatorio', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('app.common.errors.required', 'fr-FR', 'Requis', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('app.common.errors.required', 'it-IT', 'Obbligatorio', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1),
  ('app.common.errors.required', 'pt-PT', 'Obrigatório', now(), 'migration-dict-row-keys', now(), 'migration-dict-row-keys', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
