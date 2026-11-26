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

import { logger, makeNatsRequestRoute, serviceLaneVerify, AUTH_MFA_CONSUME_SUBJECT, CachingApiKeyPort, buildAuthUser, expandPermissions, type MfaConsumeResult } from "@primebrick/sdk";
import type { Msg } from "@nats-io/transport-node";
import { ApiError } from "../../http/api-errors.js";
import { DomainApiKeyPort, DomainRoleMappingPort } from "../../modules/auth/sdk-auth-ports.js";
import { CasdoorService } from "../../modules/auth/services/casdoor.service.js";
import { MfaService } from "../../modules/auth/services/mfa.service.js";
import { ServiceRegistryService } from "../../modules/system/service-registry.service.js";
import { TranslationsService } from "../../modules/system/translations.service.js";
import { getCachePort } from "../../cache/cache-port-holder.js";

export const AUTH_APIKEY_BY_HASH_SUBJECT = "auth.apikey.byHash";
export const AUTH_RESOLVE_USER_SUBJECT = "auth.ctl.resolve_user";
export const SERVICE_REGISTRY_GET_SUBJECT = "service.registry.get";
export const SYSTEM_DICT_GET_SUBJECT = "system.dict.get";
export const SYSTEM_TRANSLATIONS_FIND_SUBJECT = "system.translations.find";

export async function startInternalRequestRoutes(): Promise<void> {
  // Cached composition: CachingApiKeyPort (SDK, shared `be:api_keys` Redis
  // key) wrapping the DB resolver — same cache behavior as before the
  // unification, now through the single SDK implementation.
  const apiKeyPort = new CachingApiKeyPort(
    new DomainApiKeyPort(),
    () => getCachePort(),
  );
  const serviceSvc = new ServiceRegistryService();
  const translationsSvc = new TranslationsService();

  await makeNatsRequestRoute<unknown, unknown>(
    [
      {
        // API-key lookup for services without a database (webhook precheck).
        subject: AUTH_APIKEY_BY_HASH_SUBJECT,
        permissions: [],
        verify: serviceLaneVerify,
        handler: async ({ request }) => {
          const { hash } = (request ?? {}) as { hash?: string };
          if (!hash || typeof hash !== "string") return null;
          return apiKeyPort.findByHash(hash);
        },
      },
      {
        // Registry row by service code — fallback for services that missed
        // the `service.*` lifecycle events (e.g. webhook cold start).
        // `{ capability }` instead returns every online+enabled instance
        // exposing that capability (e.g. docs_pack discovery by ai) — this
        // is the sanctioned replacement for direct public.service_registry
        // reads, which no US may perform under schema sovereignty.
        // `{ census: "callables" }` returns the flattened callable catalog
        // (each service's endpoints.callables + its code) for services that
        // validate work destinations — e.g. job-handler checking a rule's
        // target_subject against census.callables at write time.
        // `{ census: "events" }` returns the flattened emits catalog — the
        // SOURCE side a `payload_map` `kind:"path"` reads at fire time.
        subject: SERVICE_REGISTRY_GET_SUBJECT,
        permissions: [],
        verify: serviceLaneVerify,
        handler: async ({ request }): Promise<unknown> => {
          const { code, capability, census } = (request ?? {}) as { code?: string; capability?: string; census?: string };
          if (census === "callables") {
            const rows = await serviceSvc.findAll();
            return rows
              .filter((r) => r.status === "online" && r.is_enabled !== false)
              .map((r) => ({
                service_code: r.code,
                callables: (r.endpoints?.["callables"] as { callables?: unknown[] } | undefined)?.callables ?? [],
              }));
          }
          if (census === "events") {
            const rows = await serviceSvc.findAll();
            return rows
              .filter((r) => r.status === "online" && r.is_enabled !== false)
              .map((r) => ({
                service_code: r.code,
                emits: (r.endpoints?.["events"] as { emits?: unknown[] } | undefined)?.emits ?? [],
              }));
          }
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
        verify: serviceLaneVerify,
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
      {
        // Flat i18n dict for a module (system.* labels are the sanctioned
        // replacement for direct `<schema>.translations` reads, which no US
        // may perform under schema sovereignty — e.g. export resolvers
        // needing `system.common.*` labels their own dict can't serve).
        subject: SYSTEM_DICT_GET_SUBJECT,
        permissions: [],
        verify: serviceLaneVerify,
        handler: async ({ request }) => {
          const { module, language } = (request ?? {}) as { module?: string; language?: string };
          if (!module || typeof module !== "string" || !language || typeof language !== "string") return null;
          const entry = await translationsSvc.getI18nDict(module, language);
          return entry.data;
        },
      },
      {
        // findTranslations — the one governed cross-domain translation read:
        // `matches` (required prefix/exact matchers like 'job.*' or
        // 'app.common.ok') names the keys to return — the wired filter is
        // service-owned so a caller can never dump a whole table. Successor
        // to dict.get for multi-key / foreign-ns label resolution.
        subject: SYSTEM_TRANSLATIONS_FIND_SUBJECT,
        permissions: [],
        verify: serviceLaneVerify,
        handler: async ({ request }) => {
          const { matches, language } = (request ?? {}) as { matches?: string[]; language?: string };
          if (!Array.isArray(matches) || !matches.every((m) => typeof m === "string")) return null;
          return translationsSvc.findTranslations(matches, language);
        },
      },
      {
        // Resolve a FRESH AuthUser by internal uuid for scheduled/triggered
        // dispatch — job-handler calls this at arm time (`me` lane, author
        // identity) and at fire time when the Redis auth checkpoint misses
        // or is epoch-stale. `null` is data, not an error: a deleted or
        // disabled user must fail the fire closed.
        subject: AUTH_RESOLVE_USER_SUBJECT,
        permissions: [],
        verify: serviceLaneVerify,
        handler: async ({ request }): Promise<unknown> => {
          const { user_uuid } = (request ?? {}) as { user_uuid?: string };
          if (!user_uuid || typeof user_uuid !== "string") return null;
          const { getUserService } = await import("../../modules/auth/services/user.service.js");
          const user = await getUserService().getByUuid(user_uuid);
          // Suspended identities fail closed like deleted ones (deleted rows
          // already null via EXCLUDED) — suspension is a live-record lockout
          // that survives retention purge, per the lifecycle contract.
          if (!user || user.suspended_at) return null;
          const rolePort = new DomainRoleMappingPort();
          const { patterns, isAdmin } = await expandPermissions(
            user.roles ?? [],
            (role) => rolePort.getRoleMapping(role),
          );
          return buildAuthUser(
            user.uuid,
            {
              idp_code: user.idp_code,
              email: user.email ?? null,
              name: user.display_name ?? null,
              roles: user.roles ?? [],
              idp_org: user.idp_org ?? null,
              idp_username: user.idp_username ?? null,
            },
            new Set(patterns),
            isAdmin,
          );
        },
      },
    ],
    { serviceCode: "primebrick-api" },
  );
  logger.done(
    `Subscribed to ${AUTH_APIKEY_BY_HASH_SUBJECT}, ${AUTH_RESOLVE_USER_SUBJECT}, ${SERVICE_REGISTRY_GET_SUBJECT}, ${SYSTEM_DICT_GET_SUBJECT}, ${SYSTEM_TRANSLATIONS_FIND_SUBJECT} (governed correlation-reply)`,
    { tags: ["nats"] },
  );
}
