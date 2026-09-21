-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-09-21T14:35:12.294Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TYPE mismatch "temperature" entity≈text db≈numeric — manual ALTER TYPE / migration
-- TYPE mismatch "top_p" entity≈text db≈numeric — manual ALTER TYPE / migration
-- TYPE mismatch "max_tokens" entity≈text db≈int4 — manual ALTER TYPE / migration
-- TYPE mismatch "repetition_penalty" entity≈text db≈numeric — manual ALTER TYPE / migration
-- TYPE mismatch "sort_order" entity≈text db≈int4 — manual ALTER TYPE / migration

-- TYPE mismatch "power_level" entity≈text db≈int4 — manual ALTER TYPE / migration
-- TYPE mismatch "rank" entity≈text db≈numeric — manual ALTER TYPE / migration
-- TYPE mismatch "temperature" entity≈text db≈numeric — manual ALTER TYPE / migration
-- TYPE mismatch "top_p" entity≈text db≈numeric — manual ALTER TYPE / migration
-- TYPE mismatch "max_tokens" entity≈text db≈int4 — manual ALTER TYPE / migration
-- TYPE mismatch "repetition_penalty" entity≈text db≈numeric — manual ALTER TYPE / migration
-- TYPE mismatch "sort_order" entity≈text db≈int4 — manual ALTER TYPE / migration
-- TYPE mismatch "download_size_mb" entity≈text db≈int4 — manual ALTER TYPE / migration
-- TYPE mismatch "vram_mb" entity≈text db≈numeric — manual ALTER TYPE / migration

-- TYPE mismatch "user_profile_uuid" entity≈text db≈uuid — manual ALTER TYPE / migration
-- TYPE mismatch "ip_address" entity≈text db≈raw:inet — manual ALTER TYPE / migration
-- TYPE mismatch "success" entity≈text db≈bool — manual ALTER TYPE / migration

-- TYPE mismatch "user_profile_id" entity≈text db≈int8 — manual ALTER TYPE / migration
-- NULLABILITY "user_profile_id" entity=true db=false — manual ALTER COLUMN … SET/DROP NOT NULL

-- TYPE mismatch "is_admin" entity≈text db≈bool — manual ALTER TYPE / migration

-- TYPE mismatch "user_profile_id" entity≈text db≈int8 — manual ALTER TYPE / migration
-- NULLABILITY "user_profile_id" entity=true db=false — manual ALTER COLUMN … SET/DROP NOT NULL

-- TYPE mismatch "is_enabled" entity≈text db≈bool — manual ALTER TYPE / migration
-- TYPE mismatch "is_preferred" entity≈text db≈bool — manual ALTER TYPE / migration
-- TYPE mismatch "user_profile_id" entity≈text db≈int8 — manual ALTER TYPE / migration
-- NULLABILITY "totp_secret_encrypted" entity=false db=true — manual ALTER COLUMN … SET/DROP NOT NULL
-- NULLABILITY "user_profile_id" entity=true db=false — manual ALTER COLUMN … SET/DROP NOT NULL

-- TYPE mismatch "authenticator_attachment" entity≈varchar db≈text — manual ALTER TYPE / migration
-- TYPE mismatch "user_agent" entity≈varchar db≈text — manual ALTER TYPE / migration
-- TYPE mismatch "os" entity≈varchar db≈text — manual ALTER TYPE / migration
-- TYPE mismatch "device_model" entity≈varchar db≈text — manual ALTER TYPE / migration
-- TYPE mismatch "user_profile_id" entity≈text db≈int8 — manual ALTER TYPE / migration
-- NULLABILITY "user_profile_id" entity=true db=false — manual ALTER COLUMN … SET/DROP NOT NULL

-- NULLABILITY "is_active" entity=false db=true — manual ALTER COLUMN … SET/DROP NOT NULL
-- NULLABILITY "is_admin" entity=false db=true — manual ALTER COLUMN … SET/DROP NOT NULL
-- WARN: DB-only column "passkey_prompt_dismissed" on public.user_profiles — not dropped

-- TYPE mismatch "cloned_from" entity≈text db≈uuid — manual ALTER TYPE / migration

-- TYPE mismatch "is_behind_scaler" entity≈text db≈bool — manual ALTER TYPE / migration
-- TYPE mismatch "is_enabled" entity≈text db≈bool — manual ALTER TYPE / migration
-- TYPE mismatch "is_reserved" entity≈text db≈bool — manual ALTER TYPE / migration


-- === database patch registry (repeatable runs) ===
-- Create once on TARGET: see backend/src/db/database-patch-registry.ts (PATCH_REGISTRY_DDL).
-- patch_id: 20260921143512_drift_public_ai_cerebellum_public_ai_models_public_auth_events_public_mf
-- content_sha256: a79339655704a30eac9b75abd39fc641628bc680430f64d36967ca255e600c9f
-- After apply:
-- INSERT INTO public.primebrick_database_patch (patch_id, content_sha256)
-- VALUES ('20260921143512_drift_public_ai_cerebellum_public_ai_models_public_auth_events_public_mf', 'a79339655704a30eac9b75abd39fc641628bc680430f64d36967ca255e600c9f')
-- ON CONFLICT (patch_id) DO NOTHING;
