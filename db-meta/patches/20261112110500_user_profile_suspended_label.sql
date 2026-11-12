-- Label for the `suspended` calculated column (follow-up to
-- 20261112105749_user_profile_lifecycle_suspended — never edit applied patches).

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version) OVERRIDING SYSTEM VALUE VALUES
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended', 'en', 'Suspended', '2026-11-12 11:05:00+00', 'system', '2026-11-12 11:05:00+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended', 'it', 'Sospeso', '2026-11-12 11:05:00+00', 'system', '2026-11-12 11:05:00+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended', 'de', 'Gesperrt', '2026-11-12 11:05:00+00', 'system', '2026-11-12 11:05:00+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended', 'es', 'Suspendido', '2026-11-12 11:05:00+00', 'system', '2026-11-12 11:05:00+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended', 'pt', 'Suspenso', '2026-11-12 11:05:00+00', 'system', '2026-11-12 11:05:00+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended', 'fr', 'Suspendu', '2026-11-12 11:05:00+00', 'system', '2026-11-12 11:05:00+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended', 'nl', 'Opgeschort', '2026-11-12 11:05:00+00', 'system', '2026-11-12 11:05:00+00', 'system', 1);
