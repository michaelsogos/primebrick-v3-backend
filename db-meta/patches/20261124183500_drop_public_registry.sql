-- Primebrick: entity → database patch
-- Drop the legacy public patch-registry — all rows were merged into
-- system.primebrick_database_patches by 20261124183000_move_builtins_to_system.
-- Runs post-flip (system is the registry schema from here on).
DROP TABLE IF EXISTS "public"."primebrick_database_patches";
