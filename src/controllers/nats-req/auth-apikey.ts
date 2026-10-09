/**
 * DEPRECATO — NON PASSIAMO DA NATS REQ/RES. Pending migration to pub/sub
 * correlation reply (`auth.apikey.byHash` → `auth.apikey.response.<id>`).
 * Do not add new nats-req controllers.
 *
 * NATS request-reply controller: `auth.apikey.byHash`.
 *
 * Backs `NatsApiKeyPort` (SDK) — lets services WITHOUT a database (e.g.
 * the `webhook` ingress) verify API keys for auth prechecks. The real
 * lookup goes through `BeApiKeyPort` (Redis-cached, then public.api_keys).
 *
 * Controller contract: transport only — no auth decision, no business
 * rules; the record (or null) is returned verbatim.
 */

import { logger } from "@primebrick/sdk";
import { NatsClient, type ApiKeyRecord } from "@primebrick/sdk";
import { getPool } from "../../db/pool.js";
import { BeApiKeyPort } from "../../modules/auth/sdk-auth-ports.js";

export const AUTH_APIKEY_BY_HASH_SUBJECT = "auth.apikey.byHash";

export async function startAuthApiKeyController(): Promise<void> {
  const port = new BeApiKeyPort(getPool());
  await NatsClient.subscribeRequest<{ hash: string }, ApiKeyRecord | null>(
    AUTH_APIKEY_BY_HASH_SUBJECT,
    async (request) => {
      if (!request?.hash || typeof request.hash !== "string") return null;
      return port.findByHash(request.hash);
    },
  );
  logger.info(`Subscribed to ${AUTH_APIKEY_BY_HASH_SUBJECT} (nats-req)`, { tags: ["nats"] });
}
