-- NumericInput stepper aria-labels (`app.widgets.numeric_input.*`) —
-- screen-reader names for the +/− spinbutton controls of the shared
-- numeric control. Action copy, no jargon.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.numeric_input.increment', 'en-GB', 'Increase value', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.increment', 'en-US', 'Increase value', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.increment', 'it-IT', 'Aumenta valore', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.increment', 'de-DE', 'Wert erhöhen', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.increment', 'fr-FR', 'Augmenter la valeur', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.increment', 'es-ES', 'Aumentar el valor', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.increment', 'pt-PT', 'Aumentar o valor', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.decrement', 'en-GB', 'Decrease value', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.decrement', 'en-US', 'Decrease value', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.decrement', 'it-IT', 'Diminuisci valore', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.decrement', 'de-DE', 'Wert verringern', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.decrement', 'fr-FR', 'Diminuer la valeur', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.decrement', 'es-ES', 'Disminuir el valor', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1),
  ('app.widgets.numeric_input.decrement', 'pt-PT', 'Diminuir o valor', now(), 'migration-numeric-input-stepper', now(), 'migration-numeric-input-stepper', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
