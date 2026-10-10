-- Fire-and-forget: normalize service_registry codes to lowercase snake_case
-- matching each service's config `service_code` ('AI' -> 'ai',
-- 'EMAILSENDER' -> 'emailsender'). Single source of truth: the service's own
-- config_entries table (2026-10-10). Idempotent.
-- Note: rows are keyed by (code, base_url) — re-registration under the new
-- code would otherwise create a second row for the same instance.

UPDATE public.service_registry SET code = 'ai' WHERE code = 'AI';
UPDATE public.service_registry SET code = 'emailsender' WHERE code = 'EMAILSENDER';
UPDATE public.service_registry SET code = 'webhook' WHERE code = 'WEBHOOK';
