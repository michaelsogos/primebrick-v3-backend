/**
 * SecretVault wiring — the BE is the WRITER OWNER of the fleet vault
 * (WP-A5, arch/nats-durability). All vault logic lives in the SDK
 * (`SecretVault`/`SecretVaultReader`); this module is only the deploy-time
 * composition root: inject the PG pool, declare the owned policies, start
 * the cadence.
 *
 * First owned ref: `service_message_key_material` — the rotating parte_B
 * of the fabric message-encryption split key. Ratified invariants:
 *   - material lives ONLY in system.secret_vault_generations (never Redis,
 *     never config_entries — the audit trail would defeat forward secrecy);
 *   - material NEVER transits NATS and is never served through secret.get —
 *     services read it via direct DAL through the SDK reader (A6 wiring);
 *   - rotation hourly, key window physically trimmed to 7 days;
 *   - boot self-heals missing material (zero ceremony after a machine reset).
 */

import {
  SecretVault,
  MESSAGE_KEY_MATERIAL_POLICY,
  logger,
  type SqlPoolPort,
} from "@primebrick/sdk";
import { getPool } from "../../db/dal-gateway.js";

/** One vault per process — the rotation timer is PG-driven, not NATS-bound,
 *  so a lifecycle re-run after a NATS outage must reuse it, not stack a
 *  second rotation interval. */
let vault: SecretVault | null = null;

export async function initSecretVault(): Promise<void> {
  // The governed raw-pool seam: the vault table is deliberately NOT a
  // governed entity, so the SDK engine owns plain parameterized SQL —
  // the Repository/entity DSL does not apply to it by construction.
  // standards-exempt: getPool — the vault table is deliberately not a governed entity; the SDK engine owns parameterized SQL on the raw pool, same class as migration tooling
  const pool = getPool() as unknown as SqlPoolPort;
  const instance = (vault ??= new SecretVault({
    pool,
    schema: "system",
    policies: [MESSAGE_KEY_MATERIAL_POLICY],
  }));
  try {
    await instance.ensureAll();
    logger.done("The secret vault is ready — fabric message-key material rotates hourly with a 7-day key window", { tags: ["secret-vault"] });
  } catch (error) {
    // The table may not exist yet on a degraded-migration boot — the
    // cadence retries forever, so the vault self-heals when migrations
    // recover. Surface loudly, never silently.
    logger.error("The secret vault failed its first provisioning pass — the cadence will keep retrying (migrations applied?)", {
      tags: ["secret-vault"],
      error: error instanceof Error ? error.message : String(error),
    });
  }
  instance.startAutoRotation();
}
