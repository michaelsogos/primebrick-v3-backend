-- Fire-and-forget: make user_profiles.avatar_color mandatory.
--
-- avatar_color is the centroid color of the avatar gradient — every user
-- MUST have one (the avatar is rendered from it in sidebar, chat bubbles,
-- admin grids). The column was created nullable; rows created bypassing
-- createUser (seeds, E2E helpers, manual inserts) carried NULL and the
-- gap was only masked client-side by the profile page palette fallback.
--
-- 1) Backfill NULL/empty colors deterministically: palette index =
--    abs(hashtext(seed)) % 10 over avatar_initials (same palette and same
--    hashing scheme as the FE avatar-chrome-palette and the BE
--    avatarPaletteHex helper in user.service.ts).
-- 2) Enforce NOT NULL so no future write path can elude it again.

BEGIN;

UPDATE public.user_profiles
SET avatar_color = (ARRAY[
  '#0284c7', '#059669', '#7c3aed', '#e11d48', '#4f46e5',
  '#0e7490', '#c026d3', '#0d9488', '#1d4ed8', '#ea580c'
])[abs(hashtext(COALESCE(avatar_initials, display_name, 'PB'))) % 10 + 1],
    updated_at = now(),
    updated_by = 'patch-avatar-color-mandatory'
WHERE avatar_color IS NULL OR avatar_color = '';

ALTER TABLE public.user_profiles
  ALTER COLUMN avatar_color SET NOT NULL;

COMMIT;
