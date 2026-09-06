-- Fire-and-forget: consolidate config error keys in auth_configurations
-- Updates label_key, description_key columns and type_config JSON
-- to use system.settings.config.auth.* prefix and generic error keys.
-- This script is idempotent and safe to run multiple times.

BEGIN;

-- 1. Update label_key column: config.auth.* → system.settings.config.auth.*
UPDATE "public"."auth_configurations"
SET label_key = REPLACE(label_key, 'config.auth.', 'system.settings.config.auth.'),
    updated_at = now()
WHERE label_key LIKE 'config.auth.%';

-- 2. Update description_key column: config.auth.* → system.settings.config.auth.*
UPDATE "public"."auth_configurations"
SET description_key = REPLACE(description_key, 'config.auth.', 'system.settings.config.auth.'),
    updated_at = now()
WHERE description_key LIKE 'config.auth.%';

-- 3. Update type_config JSON: replace all config.auth. with system.settings.config.auth.
--    This covers values.*.label_key, required_error_label_key, error_label_key.
UPDATE "public"."auth_configurations"
SET type_config = REPLACE(type_config::text, '"config.auth.', '"system.settings.config.auth.')::jsonb,
    updated_at = now()
WHERE type_config::text LIKE '%config.auth.%';

-- 4. Now replace generic error keys in type_config JSON:
--    required_error_label_key: system.settings.config.auth.{key}.errors.required → app.common.validation.required
--    (except auth_mode and idp_type which keep field-specific messages)
UPDATE "public"."auth_configurations"
SET type_config = REPLACE(
      type_config::text,
      '"system.settings.config.auth.' || key || '.errors.required"',
      '"app.common.validation.required"'
    )::jsonb,
    updated_at = now()
WHERE key NOT IN ('auth_mode', 'idp_type')
  AND type_config::text LIKE '%"system.settings.config.auth.' || key || '.errors.required"%';

-- 5. error_label_key for min rule → app.common.validation.tooShort
UPDATE "public"."auth_configurations"
SET type_config = REPLACE(
      type_config::text,
      '"system.settings.config.auth.' || key || '.errors.min"',
      '"app.common.validation.tooShort"'
    )::jsonb,
    updated_at = now()
WHERE type_config::text LIKE '%"system.settings.config.auth.' || key || '.errors.min"%';

-- 6. error_label_key for max rule → app.common.validation.tooLong
UPDATE "public"."auth_configurations"
SET type_config = REPLACE(
      type_config::text,
      '"system.settings.config.auth.' || key || '.errors.max"',
      '"app.common.validation.tooLong"'
    )::jsonb,
    updated_at = now()
WHERE type_config::text LIKE '%"system.settings.config.auth.' || key || '.errors.max"%';

-- 7. error_label_key for url rule → app.common.validation.invalidUrl
UPDATE "public"."auth_configurations"
SET type_config = REPLACE(
      type_config::text,
      '"system.settings.config.auth.' || key || '.errors.invalidUrl"',
      '"app.common.validation.invalidUrl"'
    )::jsonb,
    updated_at = now()
WHERE type_config::text LIKE '%"system.settings.config.auth.' || key || '.errors.invalidUrl"%';

-- 8. error_label_key for email rule → app.common.validation.invalidEmail
UPDATE "public"."auth_configurations"
SET type_config = REPLACE(
      type_config::text,
      '"system.settings.config.auth.' || key || '.errors.invalidEmail"',
      '"app.common.validation.invalidEmail"'
    )::jsonb,
    updated_at = now()
WHERE type_config::text LIKE '%"system.settings.config.auth.' || key || '.errors.invalidEmail"%';

COMMIT;
