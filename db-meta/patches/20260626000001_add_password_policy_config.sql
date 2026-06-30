-- Add password_policy config row to auth_configurations.
-- Default policy: letter_number_special (at least one letter, one number, one special char, 8-64 chars).
-- Idempotent: uses ON CONFLICT to skip if the key already exists (e.g. on fresh installs where the init seed already inserted it).
INSERT INTO "public"."auth_configurations" ("key", "value", "description", "created_by")
VALUES (
  'password_policy',
  'letter_number_special',
  'Active password complexity policy (alpha_numeric | letter_and_number | letter_number_special | mixed_case_special)',
  'system'
)
ON CONFLICT ("key") DO NOTHING;
