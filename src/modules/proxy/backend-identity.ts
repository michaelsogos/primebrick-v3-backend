/**
 * Backend service identity (B11) — the BE's own caller identity for
 * outbound internal calls (proxy → US, NATS publishes).
 *
 * The client key is a module config (`config_entries` key `service_client_shield_key`),
 * NOT an env var — per the env policy, only the DB connection lives in env.
 * Each service holds its own key; `system.client_registry` stores only the
 * sha256 hash per UA prefix.
 *
 * Loaded once at startup by `initBackendIdentity()` (also self-enrolls the
 * BE into `system.client_registry` as a `source='registry'` row — the BE
 * never sends `service.register`); read synchronously on the hot path by
 * the proxy via `backendIdentityHeaders()`.
 */

import {
  logger,
  NatsClient,
  CLIENT_SHIELD_KEY_HEADER,
  CLIENT_REGISTRY_SUBJECTS,
  buildUserAgent,
  clientKeyHash,
  detectPackageIdentity,
  configureInternalClient,
} from "@primebrick/sdk";
import { getPool } from "../../db/pool.js";
import { ConfigEntriesDal } from "../auth/config_entries_dal.js";
import { ClientRegistryRepo } from "./client-registry-repo.js";

let currentUa: string | null = null;
let currentKey: string | null = null;

/** Identity headers for outbound internal calls. UA is always set; the key
 * only when configured (a missing key means the gate will 401 — loud, not silent). */
export function backendIdentityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "user-agent": currentUa ?? buildUserAgent(detectPackageIdentity(), "backend"),
  };
  if (currentKey) headers[CLIENT_SHIELD_KEY_HEADER] = currentKey;
  return headers;
}

export async function initBackendIdentity(): Promise<void> {
  const identity = detectPackageIdentity();
  currentUa = buildUserAgent(identity, "backend");
  // The SDK internal client is the single outbound path for BE→US calls —
  // configure it now so `internalFetch` carries the BE identity everywhere.
  configureInternalClient(backendIdentityHeaders);
  const uaPrefix = `${identity.name}/${identity.version ?? ""}`;

  const dal = new ConfigEntriesDal(getPool());
  const row = await dal.findByKey("service_client_shield_key");
  currentKey = row?.value ?? null;

  if (!currentKey) {
    logger.error(
      "config_entries 'service_client_shield_key' not set — BE cannot enroll in client_registry; every proxied call will fail the identity gate",
      { tags: ["core"] },
    );
    return;
  }

  const repo = new ClientRegistryRepo(getPool());
  await repo.upsertRegistryRow(uaPrefix, clientKeyHash(currentKey));
  await NatsClient.publish(CLIENT_REGISTRY_SUBJECTS.CHANGED, { ua_prefix: uaPrefix });
  logger.done(`The service ${uaPrefix} has been registered and its protection shield key enrolled`, { tags: ["core"] });

  // Same allowlist visibility the microservices log — the BE's view of the
  // internal caller registry it owns (source='manual' rows are admin-managed).
  const rows = await repo.findAllEnabled();
  logger.info("Services allowed to communicate with are:", { tags: ["core"] });
  for (const r of rows) {
    logger.info(`  - ${r.ua_prefix}`, { tags: ["core"] });
  }
}
