-- Primebrick: be uuid phase 6b — repair actor text columns after v4→v7 rewrite.
-- 00012 rewrote every *_uuid column and audit entity_uuid, but audit actor
-- columns are TEXT (a uuid serialized as text) and were outside the ref
-- graph: created_by / updated_by / deleted_by / *_audit.changed_by (and any
-- other *_by actor column) kept pre-rewrite user uuids, breaking the
-- *_by_name display join.
--
-- The old→new user map is rebuilt ONLY from provable sources:
--   A) user_profiles_audit delta: every uuid value recorded for a profile
--      (uuid.old/uuid.new on INSERT/UPDATE/DELETE rows) plus stale
--      entity_uuid values 00012 could not map, grouped by the identity's
--      idp_code → the current profile uuid for that idp_code (live rows
--      preferred over soft-deleted re-provisions).
--   B) seed contract uuid := idp_code — a uuid-shaped idp_code that differs
--      from the row's uuid is that profile's pre-rewrite public identity.
-- Unmapped actor values (profiles created outside the audited path with no
-- uuid-shaped idp_code, deleted users, ephemeral e2e actors) stay dangling
-- as history — match-only, no guessing.
--
-- CROSS-SCHEMA (same decision as A1 in 00012): the map is owned here with
-- user_profiles, so this patch repairs *_by columns in every schema,
-- including partman partition children.
--
-- Gate (DO block): no actor column value matching map.old may remain.

CREATE TEMP TABLE _actor_map (old text PRIMARY KEY, new uuid NOT NULL) ON COMMIT DROP;

WITH ids AS (
  SELECT COALESCE(a."delta" -> 'idp_code' ->> 'new',
                  a."delta" -> 'idp_code' ->> 'old') AS idp,
         v.old_value
  FROM "public"."user_profiles_audit" a
  CROSS JOIN LATERAL (VALUES
    (a."delta" -> 'uuid' ->> 'old'),
    (a."delta" -> 'uuid' ->> 'new')
  ) AS v(old_value)
  WHERE v.old_value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND COALESCE(a."delta" -> 'idp_code' ->> 'new',
                 a."delta" -> 'idp_code' ->> 'old') IS NOT NULL
  UNION
  SELECT COALESCE(a."delta" -> 'idp_code' ->> 'new',
                  a."delta" -> 'idp_code' ->> 'old'),
         a."entity_uuid"::text
  FROM "public"."user_profiles_audit" a
  WHERE a."entity_uuid" IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM "public"."user_profiles" up WHERE up."uuid" = a."entity_uuid")
    AND COALESCE(a."delta" -> 'idp_code' ->> 'new',
                 a."delta" -> 'idp_code' ->> 'old') IS NOT NULL
),
target AS (
  SELECT DISTINCT ON (p."idp_code") p."idp_code" AS idp, p."uuid" AS new_uuid
  FROM "public"."user_profiles" p
  ORDER BY p."idp_code", (p."deleted_at" IS NULL) DESC, p."created_at" DESC
)
INSERT INTO _actor_map (old, new)
SELECT DISTINCT i.old_value, t.new_uuid
FROM ids i JOIN target t ON t.idp = i.idp
ON CONFLICT (old) DO NOTHING;

INSERT INTO _actor_map (old, new)
SELECT p.idp_code, p.new_uuid
FROM (
  SELECT DISTINCT ON (p."idp_code") p."idp_code", p."uuid" AS new_uuid
  FROM "public"."user_profiles" p
  WHERE p."idp_code" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND p."idp_code" <> p."uuid"::text
  ORDER BY p."idp_code", (p."deleted_at" IS NULL) DESC, p."created_at" DESC
) p
ON CONFLICT (old) DO NOTHING;

DO $$
DECLARE r record; n bigint;
BEGIN
  FOR r IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE column_name ~ '_by$'
      AND data_type IN ('text', 'character varying', 'uuid')
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
  LOOP
    EXECUTE format(
      'UPDATE %I.%I t SET %I = m.new::text FROM _actor_map m WHERE t.%I::text = m.old',
      r.table_schema, r.table_name, r.column_name, r.column_name, r.column_name);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN RAISE NOTICE 'actor repair: %.%.% → % rows', r.table_schema, r.table_name, r.column_name, n; END IF;
  END LOOP;
END $$;

DO $$
DECLARE r record; n bigint; bad bigint := 0;
BEGIN
  FOR r IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE column_name ~ '_by$'
      AND data_type IN ('text', 'character varying', 'uuid')
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM %I.%I t WHERE t.%I::text IN (SELECT old FROM _actor_map)',
      r.table_schema, r.table_name, r.column_name) INTO n;
    bad := bad + n;
  END LOOP;
  IF bad > 0 THEN
    RAISE EXCEPTION 'phase6b gate: % provable actor refs still unmapped', bad;
  END IF;
END $$;
