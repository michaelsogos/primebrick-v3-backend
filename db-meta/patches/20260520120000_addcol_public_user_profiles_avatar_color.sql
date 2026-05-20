-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-20T12:00:00.000Z

ALTER TABLE "public"."user_profiles" ADD COLUMN IF NOT EXISTS "avatar_color" varchar(7);

COMMENT ON COLUMN public.user_profiles.avatar_color IS 'Avatar color hex code (e.g., #3b82f6) for user profile display';


-- patch_id: 20260520120000_addcol_public_user_profiles_avatar_color
