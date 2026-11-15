-- Clone-audit label collision fix: the seed patch
-- 20261113101000_clone_audit_field_labels gave cloned_from and cloned_by
-- the SAME label in it-IT ("Clonato Da") and de-DE ("Geklont Von") — the
-- two columns render indistinguishable. The mapping per spec:
--   cloned_from → the source record this one is a clone OF ("Clone di")
--   cloned_by   → the actor who cloned ("Clonato da")
-- Other locales already carry distinct labels (Cloned From/Depuis/Desde/
-- De vs By/Par/Por). Same repair pattern as
-- 20261112190000_suspended_labels_bcp47_fix: delete + re-seed.

DELETE FROM system.translations
WHERE key = 'system.common.fields.cloned_from'
  AND language IN ('it-IT', 'de-DE');

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.common.fields.cloned_from', 'it-IT', 'Clone Di', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.fields.cloned_from', 'de-DE', 'Klon Von', now(), 'initial-setup', now(), 'initial-setup', 1);
