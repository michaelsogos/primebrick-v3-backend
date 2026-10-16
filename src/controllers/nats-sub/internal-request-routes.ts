/**
 * Governed service-to-BE query endpoints (NATS pub/sub correlation-reply —
 * `makeNatsRequestRoute`, never req/res).
 *
 * Callers are *services*, not users: identity is proven by client-shield
 * headers (UA prefix + key hash vs system.client_shield_registry) via
 * `createPublisherVerifier` — the same contract as internal HTTP calls and
 * the lifecycle subjects. Transport only — rows/records are returned
 * verbatim, no business rules.
 */

import { logger, makeNatsRequestRoute, setNatsShieldRegistry, CLIENT_SHIELD_REGISTRY_SUBJECTS, AUTH_MFA_CONSUME_SUBJECT, CachingApiKeyPort, type ClientShieldRegistryRow, type MfaConsumeResult } from "@primebrick/sdk";
import type { Msg } from "nats";
import { ApiError } from "../../http/api-errors.js";
import { DomainApiKeyPort } from "../../modules/auth/sdk-auth-ports.js";
import { CasdoorService } from "../../modules/auth/services/casdoor.service.js";
import { MfaService } from "../../modules/auth/services/mfa.service.js";
import { ClientShieldRegistryService } from "../../modules/system/client-shield-registry.service.js";
import { ServiceRegistryService, type ServiceRegistryEntry } from "../../modules/system/service-registry.service.js";
import { createPublisherVerifier } from "./publisher-identity.js";
import { getCachePort } from "../../cache/cache-port-holder.js";

export const AUTH_APIKEY_BY_HASH_SUBJECT = "auth.apikey.byHash";
export const SERVICE_REGISTRY_GET_SUBJECT = "service.registry.get";

export async function startInternalRequestRoutes(): Promise<void> {
  const verifier = createPublisherVerifier();
  // Layer-1 shield for every governed NATS route in this process — same
  // contract as US microservices (createMicroservice sets it there).
  setNatsShieldRegistry(verifier.shieldRegistry);
  const verify = verifier.asRouteVerify();
  // Cached composition: CachingApiKeyPort (SDK, shared `be:api_keys` Redis
  // key) wrapping the DB resolver — same cache behavior as before the
  // unification, now through the single SDK implementation.
  const apiKeyPort = new CachingApiKeyPort(
    new DomainApiKeyPort(),
    () => getCachePort(),
  );
  const clientSvc = new ClientShieldRegistryService();
  const serviceSvc = new ServiceRegistryService();

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
        // `client_shield_registry.changed` broadcast).
        subject: CLIENT_SHIELD_REGISTRY_SUBJECTS.GET,
        permissions: [],
        verify,
        handler: async (): Promise<ClientShieldRegistryRow[]> => clientSvc.findAllEnabled(),
      },
      {
        // Registry row by service code — fallback for services that missed
        // the `service.*` lifecycle events (e.g. webhook cold start).
        // `{ capability }` instead returns every online+enabled instance
        // exposing that capability (e.g. docs_pack discovery by ai) — this
        // is the sanctioned replacement for direct public.service_registry
        // reads, which no US may perform under schema sovereignty.
        subject: SERVICE_REGISTRY_GET_SUBJECT,
        permissions: [],
        verify,
        handler: async ({ request }): Promise<ServiceRegistryEntry | ServiceRegistryEntry[] | null> => {
          const { code, capability } = (request ?? {}) as { code?: string; capability?: string };
          if (capability && typeof capability === "string") {
            const rows = await serviceSvc.findAll();
            return rows.filter(
              (r) =>
                r.status === "online" &&
                r.is_enabled !== false &&
                Array.isArray(r.capabilities) &&
                r.capabilities.includes(capability),
            );
          }
          if (!code || typeof code !== "string") return null;
          return serviceSvc.findByCode(code);
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
            const mfaService = new MfaService(new CasdoorService());
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
    `Subscribed to ${AUTH_APIKEY_BY_HASH_SUBJECT}, ${CLIENT_SHIELD_REGISTRY_SUBJECTS.GET}, ${SERVICE_REGISTRY_GET_SUBJECT} (governed correlation-reply)`,
    { tags: ["nats"] },
  );
}
