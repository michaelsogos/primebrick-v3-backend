-- Primebrick: revive spec columns carry instant literals beside the
-- 'N unit' cadence — 'at <RFC3339>' pins expire_at, 'until <RFC3339>'
-- pins switch_at ('until 2027-06-16T12:30:00.123+02:00' needs 35 chars
-- — varchar(30) cannot hold it). Widening only, no data rewrite.
ALTER TABLE "system"."sequences"
  ALTER COLUMN "revive_every" TYPE varchar(40),
  ALTER COLUMN "revive_grace" TYPE varchar(40);
