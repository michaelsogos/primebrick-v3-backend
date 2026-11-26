-- Primebrick: hard-delete soft-deleted tombstone rows left by migration
-- sweeps. Soft delete is the USER-facing recycle bin (dict page deleted
-- view + restore.single); migration cleanup must not leave tombstones —
-- patches always hard-delete. The unique key_language index is partial
-- (WHERE deleted_at IS NULL) so no live row is touched.

DELETE FROM system.translations WHERE deleted_at IS NOT NULL;
DELETE FROM public.translations WHERE deleted_at IS NOT NULL;
