-- Fire-and-forget: Update content_sha256 for the 6 seed translation patches.
-- Reason: config_entries rename + RBAC permission renames touched the seed
-- translation rows (commits b6e7507 and 0be9bd2). Run ONCE on each existing
-- database. Idempotent.
BEGIN;
UPDATE public.primebrick_database_patches SET content_sha256 = '7b1cf74c7e3c36987b1d7a15282f56a29abacf0fd315f32c15c8429c978d2f2b' WHERE patch_id = '00000000000001_seed_translations_en_gb' AND content_sha256 <> '7b1cf74c7e3c36987b1d7a15282f56a29abacf0fd315f32c15c8429c978d2f2b';
UPDATE public.primebrick_database_patches SET content_sha256 = '775c3ab2fb30e88236d4b8164bfad9b49debb60c26b80e655a7ee158f512dbd1' WHERE patch_id = '00000000000002_seed_translations_it_it' AND content_sha256 <> '775c3ab2fb30e88236d4b8164bfad9b49debb60c26b80e655a7ee158f512dbd1';
UPDATE public.primebrick_database_patches SET content_sha256 = '18041adb822285b09c9e85ff29881660a4c221c3d2b694c44da1bb96ac06cf06' WHERE patch_id = '00000000000003_seed_translations_fr_fr' AND content_sha256 <> '18041adb822285b09c9e85ff29881660a4c221c3d2b694c44da1bb96ac06cf06';
UPDATE public.primebrick_database_patches SET content_sha256 = 'e9e07ab6313c11fd916071eae8915921e2ab8d05109726bedcefacbfed3db17d' WHERE patch_id = '00000000000004_seed_translations_es_es' AND content_sha256 <> 'e9e07ab6313c11fd916071eae8915921e2ab8d05109726bedcefacbfed3db17d';
UPDATE public.primebrick_database_patches SET content_sha256 = 'caef9278d40a642eea4865c707c60a5ec5063f44757f7d82e4e45315798f9f00' WHERE patch_id = '00000000000005_seed_translations_de_de' AND content_sha256 <> 'caef9278d40a642eea4865c707c60a5ec5063f44757f7d82e4e45315798f9f00';
UPDATE public.primebrick_database_patches SET content_sha256 = 'cc4a147ea10300c0cde4e616fde9c651c2f568e2e2f8b56e0ddc8480b3783ddd' WHERE patch_id = '00000000000006_seed_translations_pt_pt' AND content_sha256 <> 'cc4a147ea10300c0cde4e616fde9c651c2f568e2e2f8b56e0ddc8480b3783ddd';
COMMIT;
