/**
 * NATS request-reply controller: `system.clientRegistry.get`.
 *
 * Serves the client-registry snapshot (enabled rows: ua_prefix +
 * client_key_hash) to microservices so they can verify inbound internal
 * callers. Transport only — rows are returned verbatim.
 *
 * Live updates propagate via the `system.client_registry.changed` pub/sub
 * event; this endpoint exists for cold-start snapshots.
 */

import { logger } from "@primebrick/sdk";
import { NatsClient, CLIENT_REGISTRY_SUBJECTS, type ClientRegistryRow } from "@primebrick/sdk";
import { getPool } from "../../db/pool.js";
import { ClientRegistryRepo } from "../../modules/proxy/client-registry-repo.js";

export async function startClientRegistryController(): Promise<void> {
  const repo = new ClientRegistryRepo(getPool());
  await NatsClient.subscribeRequest<null, ClientRegistryRow[]>(
    CLIENT_REGISTRY_SUBJECTS.GET,
    async () => repo.findAllEnabled(),
  );
  logger.info(`Subscribed to ${CLIENT_REGISTRY_SUBJECTS.GET} (nats-req)`, { tags: ["nats"] });
}
