-- ─── Phase 4+5: uuid becomes the PRIMARY KEY on every domain entity ─────────
--
-- Swap surrogate bigint `id` PKs for the already-populated `uuid` columns
-- (added in 00000000000009/10 with uuidv7() defaults), drop the now-dead
-- `user_profile_id` bigint references mirrored by `user_profile_uuid`, and
-- drop `entity_id` on audit parents (entity_uuid is the join key; the audit
-- row's own `id` is retained — it identifies the audit record, not the entity).
--
-- be has no physical FKs on entity tables (repository-enforced references),
-- so no dependent-FK ordering is required: drop old PK → promote uuid →
-- drop obsolete columns. Bare `*_uuid_uq` indexes go (the PK covers
-- uniqueness); `client_shield_registry_uuid_uq` is constraint-backed →
-- DROP CONSTRAINT. The old PK on config_entries keeps its pre-rename name
-- `auth_configurations_pkey`.

BEGIN;

-- ─── Guard: every uuid must be fully populated and distinct ────────────────
DO $$
DECLARE
  t text;
  bad bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'api_keys','auth_events','config_entries','mcp_oauth_clients',
    'mfa_action_authorizations','organizations','role_mappings','service_registry',
    'user_invitations','user_mfa_factors','user_passkeys','user_preferences',
    'user_profiles','system.client_shield_registry'
  ] LOOP
    EXECUTE format('SELECT count(*) FROM %s WHERE uuid IS NULL', t) INTO bad;
    IF bad > 0 THEN
      RAISE EXCEPTION '% has % NULL uuid values — aborting', t, bad;
    END IF;
    EXECUTE format('SELECT count(*) - count(DISTINCT uuid) FROM %s', t) INTO bad;
    IF bad > 0 THEN
      RAISE EXCEPTION '% has % duplicate uuid values — aborting', t, bad;
    END IF;
  END LOOP;

  -- Legacy ref twins must be fully backfilled before they are dropped.
  FOREACH t IN ARRAY ARRAY[
    'mfa_action_authorizations','user_invitations','user_mfa_factors','user_passkeys'
  ] LOOP
    EXECUTE format('SELECT count(*) FROM %s WHERE user_profile_uuid IS NULL', t) INTO bad;
    IF bad > 0 THEN
      RAISE EXCEPTION '% has % NULL user_profile_uuid values — aborting', t, bad;
    END IF;
  END LOOP;

  -- Audit parents: entity_uuid must be complete before entity_id is dropped.
  FOREACH t IN ARRAY ARRAY[
    'config_entries_audit','organizations_audit','role_mappings_audit','user_profiles_audit'
  ] LOOP
    EXECUTE format('SELECT count(*) FROM %s WHERE entity_uuid IS NULL', t) INTO bad;
    IF bad > 0 THEN
      RAISE EXCEPTION '% has % NULL entity_uuid values — aborting', t, bad;
    END IF;
  END LOOP;
END $$;

-- ─── Drop redundant uuid unique indexes (PK will cover uniqueness) ─────────
DROP INDEX api_keys_uuid_uq;
DROP INDEX auth_events_uuid_uq;
DROP INDEX config_entries_uuid_uq;
DROP INDEX mcp_oauth_clients_uuid_uq;
DROP INDEX mfa_action_authorizations_uuid_uq;
DROP INDEX organizations_uuid_uq;
DROP INDEX role_mappings_uuid_uq;
DROP INDEX service_registry_uuid_uq;
DROP INDEX user_invitations_uuid_uq;
DROP INDEX user_mfa_factors_uuid_uq;
DROP INDEX user_passkeys_uuid_uq;
DROP INDEX user_preferences_uuid_uq;
DROP INDEX user_profiles_uuid_uq;
ALTER TABLE system.client_shield_registry
  DROP CONSTRAINT client_shield_registry_uuid_uq;

-- ─── PK swap: uuid replaces the surrogate bigint id ─────────────────────────
-- DROP COLUMN id also removes the identity/serial sequence it owns.
ALTER TABLE api_keys
  DROP CONSTRAINT api_keys_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;
ALTER TABLE auth_events
  DROP CONSTRAINT auth_events_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;
ALTER TABLE config_entries
  DROP CONSTRAINT auth_configurations_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;
ALTER TABLE mcp_oauth_clients
  DROP CONSTRAINT mcp_oauth_clients_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;
ALTER TABLE mfa_action_authorizations
  DROP CONSTRAINT mfa_action_authorizations_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id,
  DROP COLUMN user_profile_id,
  ALTER COLUMN user_profile_uuid SET NOT NULL;
ALTER TABLE organizations
  DROP CONSTRAINT organizations_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;
ALTER TABLE role_mappings
  DROP CONSTRAINT role_mappings_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;
ALTER TABLE service_registry
  DROP CONSTRAINT service_registry_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;
ALTER TABLE user_invitations
  DROP CONSTRAINT user_invitations_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id,
  DROP COLUMN user_profile_id,
  ALTER COLUMN user_profile_uuid SET NOT NULL;
ALTER TABLE user_mfa_factors
  DROP CONSTRAINT user_mfa_factors_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id,
  DROP COLUMN user_profile_id,
  ALTER COLUMN user_profile_uuid SET NOT NULL;
ALTER TABLE user_passkeys
  DROP CONSTRAINT user_passkeys_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id,
  DROP COLUMN user_profile_id,
  ALTER COLUMN user_profile_uuid SET NOT NULL;
ALTER TABLE user_preferences
  DROP CONSTRAINT user_preferences_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;
ALTER TABLE user_profiles
  DROP CONSTRAINT user_profiles_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;
ALTER TABLE system.client_shield_registry
  DROP CONSTRAINT client_shield_registry_pkey,
  ADD PRIMARY KEY (uuid),
  DROP COLUMN id;

-- ─── Mirror the dropped *_user_profile_id_idx access paths on uuid ──────────
CREATE INDEX mfa_action_authorizations_user_profile_uuid_idx
  ON mfa_action_authorizations (user_profile_uuid);
CREATE INDEX user_invitations_user_profile_uuid_idx
  ON user_invitations (user_profile_uuid);
CREATE INDEX user_mfa_factors_user_profile_uuid_idx
  ON user_mfa_factors (user_profile_uuid);
CREATE INDEX user_passkeys_user_profile_uuid_idx
  ON user_passkeys (user_profile_uuid);

-- ─── Audit parents: entity_uuid is the join key — drop the surrogate twin ──
-- DROP COLUMN on a partitioned parent propagates to every partition.
ALTER TABLE config_entries_audit  DROP COLUMN entity_id;
ALTER TABLE organizations_audit   DROP COLUMN entity_id;
ALTER TABLE role_mappings_audit   DROP COLUMN entity_id;
ALTER TABLE user_profiles_audit   DROP COLUMN entity_id;

COMMIT;
