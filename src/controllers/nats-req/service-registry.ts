/**
 * NATS request-reply controller: `service.registry.get`.
 *
 * Returns a service_registry row by `code` — fallback for services that
 * need registry data they missed via the `service.*` lifecycle pub/sub
 * (e.g. `webhook` cold start before the first register/heartbeat).
 *
 * Controller contract: transport only — the registry row (or null) is
 * returned verbatim, no business rules applied here.
 */

import { NatsClient } from "@primebrick/sdk";
import { getPool } from "../../db/pool.js";
import {
  ServiceRegistryRepo,
  type ServiceRegistryEntry,
} from "../../modules/proxy/service-registry-repo.js";

export const SERVICE_REGISTRY_GET_SUBJECT = "service.registry.get";

export async function startServiceRegistryController(): Promise<void> {
  const repo = new ServiceRegistryRepo(getPool());
  await NatsClient.subscribeRequest<{ code: string }, ServiceRegistryEntry | null>(
    SERVICE_REGISTRY_GET_SUBJECT,
    async (request) => {
      if (!request?.code || typeof request.code !== "string") return null;
      return repo.findByCode(request.code);
    },
  );
  console.log(`Subscribed to ${SERVICE_REGISTRY_GET_SUBJECT} (nats-req)`);
}
