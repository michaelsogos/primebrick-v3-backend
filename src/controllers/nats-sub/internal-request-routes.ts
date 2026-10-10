/**
 * Governed service-to-BE query endpoints (NATS pub/sub correlation-reply —
 * `makeNatsRequestRoute`, never req/res).
 *
 * Callers are *services*, not users: identity is proven by client-shield
 * headers (UA prefix + key hash vs system.client_registry) via
 * `createPublisherVerifier` — the same contract as internal HTTP calls and
 * the lifecycle subjects. Transport only — rows/records are returned
 * verbatim, no business rules.
 */

import { logger, makeNatsRequestRoute, setNatsShieldRegistry, CLIENT_REGISTRY_SUBJECTS, AUTH_MFA_CONSUME_SUBJECT, type ClientRegistryRow, type MfaConsumeResult } from "@primebrick/sdk";
import type { Msg } from "nats";
import { getPool } from "../../db/pool.js";
import { ApiError } from "../../http/api-errors.js";
import { BeApiKeyPort } from "../../modules/auth/sdk-auth-ports.js";
import { CasdoorService } from "../../modules/auth/services/casdoor.service.js";
import { MfaService } from "../../modules/auth/services/mfa.service.js";
import { ClientRegistryRepo } from "../../modules/proxy/client-registry-repo.js";
import { ServiceRegistryRepo, type ServiceRegistryEntry } from "../../modules/proxy/service-registry-repo.js";
import { createPublisherVerifier } from "./publisher-identity.js";

export const AUTH_APIKEY_BY_HASH_SUBJECT = "auth.apikey.byHash";
export const SERVICE_REGISTRY_GET_SUBJECT = "service.registry.get";

export async function startInternalRequestRoutes(): Promise<void> {
  const pool = getPool();
  const verifier = createPublisherVerifier(pool);
  // Layer-1 shield for every governed NATS route in this process — same
  // contract as US microservices (createMicroservice sets it there).
  setNatsShieldRegistry(verifier.shieldRegistry);
  const verify = verifier.asRouteVerify();
  const apiKeyPort = new BeApiKeyPort(pool);
  const clientRepo = new ClientRegistryRepo(pool);
  const serviceRepo = new ServiceRegistryRepo(pool);

  await makeNatsRequestRoute<unknown, unknown>(
    [
      {
        // API-key lookup for services without a database (webhook precheck).
        subject: AUTH_APIKEY_BY_HASH_SUBJECT,
        permissions: [],
        verify,
        handler: async ({ request }) => {
          const { hash } = (request ?? {}) as { hash?: string };
          if (!hash || typeof hash !== "string") return null;
          return apiKeyPort.findByHash(hash);
        },
      },
      {
        // Cold-start client-registry snapshot (live updates via
        // `client_registry.changed` broadcast).
        subject: CLIENT_REGISTRY_SUBJECTS.GET,
        permissions: [],
        verify,
        handler: async (): Promise<ClientRegistryRow[]> => clientRepo.findAllEnabled(),
      },
      {
        // Registry row by service code — fallback for services that missed
        // the `service.*` lifecycle events (e.g. webhook cold start).
        subject: SERVICE_REGISTRY_GET_SUBJECT,
        permissions: [],
        verify,
        handler: async ({ request }): Promise<ServiceRegistryEntry | null> => {
          const { code } = (request ?? {}) as { code?: string };
          if (!code || typeof code !== "string") return null;
          return serviceRepo.findByCode(code);
        },
      },
      {
        // Single-use consume of an MFA action authorization — the token is
        // BE-minted and enforced on public.mfa_action_authorizations, which
        // only this process may touch. US routes call this before honoring
        // `x-mfa-action-authorization`. Denials are data ({ok:false,code}),
        // not error envelopes: they are an expected outcome.
        subject: AUTH_MFA_CONSUME_SUBJECT,
        permissions: [],
        verify,
        handler: async ({ request }): Promise<MfaConsumeResult> => {
          const { token, action, target_resource } = (request ?? {}) as {
            token?: string;
            action?: string;
            target_resource?: string;
          };
          if (!token || !action || !target_resource) {
            return { ok: false, code: "MFA_CONSUME_BAD_REQUEST" };
          }
          try {
            const mfaService = new MfaService(pool, new CasdoorService(pool));
            const { user_uuid } = await mfaService.consumeActionAuthorization(
              token,
              action,
              target_resource,
            );
            return { ok: true, user_uuid };
          } catch (err) {
            return {
              ok: false,
              code: err instanceof ApiError ? (err.internal_code ?? "MFA_ACTION_DENIED") : "MFA_ACTION_DENIED",
            };
          }
        },
      },
    ],
    { serviceCode: "primebrick-api" },
  );
  logger.done(
    `Subscribed to ${AUTH_APIKEY_BY_HASH_SUBJECT}, ${CLIENT_REGISTRY_SUBJECTS.GET}, ${SERVICE_REGISTRY_GET_SUBJECT} (governed correlation-reply)`,
    { tags: ["nats"] },
  );
}
