-- SecretVault storage (WP-A5, arch/nats-durability) — rotating internal
-- secret material, one row per generation. First ref: the fabric
-- message-key material (rotating parte_B of the split key).
--
-- Deliberately NOT a governed entity and NOT config_entries: audited
-- entities copy every write into the audit trail, so key material would
-- survive trimming in audit partitions and forward secrecy would be
-- cosmetic. No CRUD endpoints, no OpenAPI/MCP exposure, no entity audit.
-- The current generation is max(generation); rows older than the
-- retention window are physically deleted by the vault writer, so the
-- rows present ARE the key window.

CREATE TABLE system.secret_vault_generations (
  scope          text        NOT NULL,
  name           text        NOT NULL,
  generation     bigint      NOT NULL,
  material       text        NOT NULL,
  rotated_at     timestamptz NOT NULL DEFAULT now(),
  crypto_scheme  text        NOT NULL DEFAULT 'raw-v1',
  PRIMARY KEY (scope, name, generation)
);

-- Window reads and retention trimming both filter on (scope, name, rotated_at).
CREATE INDEX secret_vault_generations_window_idx
  ON system.secret_vault_generations (scope, name, rotated_at);
