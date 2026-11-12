-- Primebrick: be uuid phase 6 — rewrite existing uuid values v4→v7.
-- Temp map old→new covers every entity-PK uuid in public + system.
-- Refs are rewritten via map join so stale/lazy refs stay untouched as
-- history — match-preservation, not zero-dangling (auth_events for
-- deleted users and audit entity_uuid of deleted entities keep their
-- historical v4 values by design).
-- CROSS-SCHEMA (approved decision A1): ai.ai_telemetry.user_uuid references
-- public.user_profiles.uuid — this patch owns the user_profiles map, so it
-- rewrites those values here in the same transaction.
-- translations.uuid is the wire row key but nothing references it → pure
-- swap (public + system).
-- Gates (DO block): PK/translations columns end all-v7; every live-matching
-- ref (incl. the ai cross-schema one) becomes v7; per-ref dangling count
-- identical before/after.

CREATE TEMP TABLE _uuid_map (old uuid PRIMARY KEY, new uuid NOT NULL) ON COMMIT DROP;

INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."config_entries" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."mcp_oauth_clients" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."organizations" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."role_mappings" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."service_registry" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."user_mfa_factors" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."user_passkeys" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."user_preferences" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."user_profiles" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."api_keys" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."auth_events" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."mfa_action_authorizations" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "public"."user_invitations" WHERE uuid_extract_version("uuid") <> 7;
INSERT INTO _uuid_map SELECT "uuid", uuidv7() FROM "system"."client_shield_registry" WHERE uuid_extract_version("uuid") <> 7;

CREATE TEMP TABLE _before (ref text PRIMARY KEY, dangling bigint) ON COMMIT DROP;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('public','auth_events','user_profile_uuid','public','user_profiles'),
    ('public','mfa_action_authorizations','user_profile_uuid','public','user_profiles'),
    ('public','user_invitations','user_profile_uuid','public','user_profiles'),
    ('public','user_mfa_factors','user_profile_uuid','public','user_profiles'),
    ('public','user_passkeys','user_profile_uuid','public','user_profiles'),
    ('public','user_preferences','user_uuid','public','user_profiles'),
    ('ai','ai_telemetry','user_uuid','public','user_profiles'),
    ('public','config_entries_audit','entity_uuid','public','config_entries'),
    ('public','organizations_audit','entity_uuid','public','organizations'),
    ('public','role_mappings_audit','entity_uuid','public','role_mappings'),
    ('public','user_profiles_audit','entity_uuid','public','user_profiles')
  ) AS t(sch, tbl, col, tgt_sch, tgt)
  LOOP
    EXECUTE format(
      'INSERT INTO _before SELECT %L, count(*) FROM %I.%I s WHERE s.%I IS NOT NULL AND NOT EXISTS (SELECT 1 FROM %I.%I x WHERE x.uuid = s.%I)',
      r.sch || '.' || r.tbl || '.' || r.col, r.sch, r.tbl, r.col, r.tgt_sch, r.tgt, r.col);
  END LOOP;
END $$;

UPDATE "public"."translations" SET "uuid" = uuidv7() WHERE uuid_extract_version("uuid") <> 7;
UPDATE "system"."translations" SET "uuid" = uuidv7() WHERE uuid_extract_version("uuid") <> 7;

-- user_profile refs (same-schema)
UPDATE "public"."auth_events" s SET "user_profile_uuid" = m.new FROM _uuid_map m WHERE s.user_profile_uuid = m.old;
UPDATE "public"."mfa_action_authorizations" s SET "user_profile_uuid" = m.new FROM _uuid_map m WHERE s.user_profile_uuid = m.old;
UPDATE "public"."user_invitations" s SET "user_profile_uuid" = m.new FROM _uuid_map m WHERE s.user_profile_uuid = m.old;
UPDATE "public"."user_mfa_factors" s SET "user_profile_uuid" = m.new FROM _uuid_map m WHERE s.user_profile_uuid = m.old;
UPDATE "public"."user_passkeys" s SET "user_profile_uuid" = m.new FROM _uuid_map m WHERE s.user_profile_uuid = m.old;
UPDATE "public"."user_preferences" s SET "user_uuid" = m.new FROM _uuid_map m WHERE s.user_uuid = m.old;

-- cross-schema user ref (A1): ai_telemetry.user_uuid → user_profiles.uuid
UPDATE "ai"."ai_telemetry" s SET "user_uuid" = m.new FROM _uuid_map m WHERE s.user_uuid = m.old;

-- audit entity_uuid refs (same-schema; dangling history preserved)
UPDATE "public"."config_entries_audit" a SET "entity_uuid" = m.new FROM _uuid_map m WHERE a.entity_uuid = m.old;
UPDATE "public"."organizations_audit" a SET "entity_uuid" = m.new FROM _uuid_map m WHERE a.entity_uuid = m.old;
UPDATE "public"."role_mappings_audit" a SET "entity_uuid" = m.new FROM _uuid_map m WHERE a.entity_uuid = m.old;
UPDATE "public"."user_profiles_audit" a SET "entity_uuid" = m.new FROM _uuid_map m WHERE a.entity_uuid = m.old;

-- PK rewrite via map
UPDATE "public"."config_entries" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."mcp_oauth_clients" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."organizations" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."role_mappings" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."service_registry" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."user_mfa_factors" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."user_passkeys" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."user_preferences" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."user_profiles" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."api_keys" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."auth_events" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."mfa_action_authorizations" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "public"."user_invitations" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;
UPDATE "system"."client_shield_registry" t SET "uuid" = m.new FROM _uuid_map m WHERE t.uuid = m.old;

DO $$
DECLARE r record; n bigint;
BEGIN
  FOR r IN SELECT sch, tbl FROM (VALUES
    ('public','config_entries'), ('public','mcp_oauth_clients'),
    ('public','organizations'), ('public','role_mappings'),
    ('public','service_registry'), ('public','user_mfa_factors'),
    ('public','user_passkeys'), ('public','user_preferences'),
    ('public','user_profiles'), ('public','api_keys'),
    ('public','auth_events'), ('public','mfa_action_authorizations'),
    ('public','user_invitations'), ('system','client_shield_registry'),
    ('public','translations'), ('system','translations')) AS t(sch, tbl)
  LOOP
    EXECUTE format('SELECT count(*) FROM %I.%I WHERE uuid_extract_version("uuid") <> 7', r.sch, r.tbl) INTO n;
    IF n > 0 THEN RAISE EXCEPTION 'phase6 gate: % non-v7 uuids remain in %.%', n, r.sch, r.tbl; END IF;
  END LOOP;

  FOR r IN SELECT sch, tbl, col, tgt_sch, tgt FROM (VALUES
    ('public','auth_events','user_profile_uuid','public','user_profiles'),
    ('public','mfa_action_authorizations','user_profile_uuid','public','user_profiles'),
    ('public','user_invitations','user_profile_uuid','public','user_profiles'),
    ('public','user_mfa_factors','user_profile_uuid','public','user_profiles'),
    ('public','user_passkeys','user_profile_uuid','public','user_profiles'),
    ('public','user_preferences','user_uuid','public','user_profiles'),
    ('ai','ai_telemetry','user_uuid','public','user_profiles'),
    ('public','config_entries_audit','entity_uuid','public','config_entries'),
    ('public','organizations_audit','entity_uuid','public','organizations'),
    ('public','role_mappings_audit','entity_uuid','public','role_mappings'),
    ('public','user_profiles_audit','entity_uuid','public','user_profiles')
  ) AS t(sch, tbl, col, tgt_sch, tgt)
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM %I.%I s WHERE s.%I IS NOT NULL AND uuid_extract_version(s.%I) <> 7 AND EXISTS (SELECT 1 FROM %I.%I x WHERE x.uuid = s.%I)',
      r.sch, r.tbl, r.col, r.col, r.tgt_sch, r.tgt, r.col) INTO n;
    IF n > 0 THEN RAISE EXCEPTION 'phase6 gate: % live-matching refs left non-v7 in %.%.%', n, r.sch, r.tbl, r.col; END IF;
    EXECUTE format(
      'SELECT count(*) FROM %I.%I s WHERE s.%I IS NOT NULL AND NOT EXISTS (SELECT 1 FROM %I.%I x WHERE x.uuid = s.%I)',
      r.sch, r.tbl, r.col, r.tgt_sch, r.tgt, r.col) INTO n;
    IF n <> (SELECT dangling FROM _before WHERE ref = r.sch || '.' || r.tbl || '.' || r.col) THEN
      RAISE EXCEPTION 'phase6 gate: dangling count changed for %.%.% (before=%, after=%)',
        r.sch, r.tbl, r.col, (SELECT dangling FROM _before WHERE ref = r.sch || '.' || r.tbl || '.' || r.col), n;
    END IF;
  END LOOP;
END $$;
