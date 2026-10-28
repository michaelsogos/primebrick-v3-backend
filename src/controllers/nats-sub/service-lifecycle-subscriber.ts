/**
 * BE-side NATS subscriber for microservice lifecycle events.
 *
 * Subscribes to service.register, service.heartbeat, service.unregister
 * and persists state changes to the service_registry table via
 * ServiceRegistryService (the domain owner — no Repository here).
 *
 * Status derivation:
 *   http_healthy && nats_connected → 'online'
 *   !http_healthy && !nats_connected → 'offline'
 *   one true, one false → 'going_live'
 */

import { assertDbEnv, logger } from "@primebrick/sdk";
import { NatsClient, SERVICE_SUBJECTS, CLIENT_SHIELD_REGISTRY_SUBJECTS, makeNatsRequestRoute, setNatsShieldRegistry, type ServiceRegisterPayload, type ServiceHeartbeatPayload, type ServiceUnregisterPayload, type ServiceStalePayload } from "@primebrick/sdk";
import { createPublisherVerifier } from "./publisher-identity.js";
import { ServiceRegistryService } from "../../modules/system/service-registry.service.js";
import { validateNavDeclaration } from "../../modules/module-nav-meta.js";
import { validateEventsDeclaration } from "@primebrick/sdk";
import { ClientShieldRegistryService } from "../../modules/system/client-shield-registry.service.js";
import { entityRegistry } from "../../modules/mcp/tools/entity-registry.js";
import { discoverEntitiesFromService } from "../../modules/mcp/tools/openapi-discovery.js";
import { serviceEventsBus } from "../../modules/proxy/service-events-bus.js";

/**
 * Callback type for MCP entity registration when a service comes online.
 * The lifecycle subscriber calls this after a service registers so the MCP
 * module can dynamically register the service's entities.
 */
export type McpEntityRegistrationCallback = (serviceCode: string, baseUrl: string) => Promise<void>;

export class ServiceLifecycleSubscriber {
  private repo: ServiceRegistryService;
  /** Tracks which services have already had their entities registered (avoids re-fetching on every heartbeat). */
  private registeredServices: Set<string> = new Set();
  /** Shield-identity verifier for service publishers (60s row cache + `changed` invalidation). */
  private readonly verifier = createPublisherVerifier();

  constructor() {
    this.repo = new ServiceRegistryService();
    // Layer-1 shield for governed NATS routes in this process (same as US).
    setNatsShieldRegistry(this.verifier.shieldRegistry);
  }

  async start(): Promise<void> {
    // Registration is a governed correlation-reply handshake (B16): the
    // service publishes with a private reply inbox and retries every 5s
    // until this ack lands — no ack, no heartbeats. Callers authenticate
    // via client-shield identity (`verify`), not AuthUser headers.
    await makeNatsRequestRoute<ServiceRegisterPayload, { registered: boolean; error?: string; key_generation?: number }>(
      [
        {
          subject: SERVICE_SUBJECTS.REGISTER,
          queue: "primebrick-api",
          permissions: [],
          // service.register IS the enrollment channel — a first-time
          // registration can't prove a key the registry doesn't know yet.
          // `enrollment` skips the global L1 (snapshot) check so the
          // route's own verify — which does the equivalent check with
          // allowNewPrefix — decides. Enrolled prefixes must present the
          // matching key (no squatting).
          enrollment: true,
          verify: this.verifier.asRouteVerify(undefined, { allowNewPrefix: true }),
          handler: async ({ request: payload }) => {
            if (!payload?.code || !payload?.base_url || !payload?.part_of) {
              logger.warn(`service.register rejected for the brick '${payload?.code ?? "unknown"}' — missing required field(s): ${[!payload?.code && "code", !payload?.base_url && "base_url", !payload?.part_of && "part_of"].filter(Boolean).join(", ")}`, {
                tags: ["nats", ...(payload?.code ? [`brick:${payload.code}`] : [])],
                received_base_url: payload?.base_url ?? null,
              });
              return { registered: false, error: "service.register requires non-empty code, base_url and part_of" };
            }
            // Static service identity: `code` must derive from `pkg_name`
            // (primebrick-<code>) unless the payload declares an explicit
            // package.json `service_code` override. A drifting code
            // re-identifies the service — different /svc proxy path, i18n
            // namespace and schema claim — rejected at enrollment.
            const codeError = this.checkServiceCodeIntegrity(payload);
            if (codeError) {
              logger.warn(`service.register rejected for the brick '${payload.code}' — ${codeError}`, {
                tags: ["nats", `brick:${payload.code}`],
                received_pkg_name: payload.pkg_name ?? null,
                received_code_source: payload.code_source ?? null,
              });
              return { registered: false, error: codeError };
            }
            const ownershipError = await this.checkSchemaOwnership(payload);
            if (ownershipError) {
              logger.warn(`service.register rejected for the brick '${payload.code}' — ${ownershipError}`, {
                tags: ["nats", `brick:${payload.code}`],
                received_schemas: payload.schemas ?? [],
              });
              return { registered: false, error: ownershipError };
            }
            // A malformed endpoints.nav declaration is rejected at
            // enrollment — it must never reach service_registry and poison
            // /modules or the routes census downstream.
            if (payload.endpoints?.["nav"] !== undefined) {
              const navError = validateNavDeclaration(payload.code, payload.endpoints["nav"], payload.part_of);
              if (navError) {
                logger.warn(`service.register rejected for the brick '${payload.code}' — ${navError}`, {
                  tags: ["nats", `brick:${payload.code}`],
                });
                return { registered: false, error: navError };
              }
            }
            // Same enrollment gate for endpoints.events — a malformed
            // emits declaration must never reach service_registry.
            const eventsError = validateEventsDeclaration(payload.code, payload.endpoints?.["events"]);
            if (eventsError) {
              logger.warn(`service.register rejected for the brick '${payload.code}' — ${eventsError}`, {
                tags: ["nats", `brick:${payload.code}`],
              });
              return { registered: false, error: eventsError };
            }
            return this.handleRegister(payload);
          },
        },
      ],
      { serviceCode: "primebrick-api" },
    );
    await NatsClient.subscribe<ServiceHeartbeatPayload>(
      SERVICE_SUBJECTS.HEARTBEAT,
      async (payload, msg) => {
        if (!(await this.verifier.verify(msg, payload))) return;
        return this.handleHeartbeat(payload);
      },
      { queue: "primebrick-api" },
    );
    await NatsClient.subscribe<ServiceUnregisterPayload>(
      SERVICE_SUBJECTS.UNREGISTER,
      async (payload, msg) => {
        if (!(await this.verifier.verify(msg, payload))) return;
        return this.handleUnregister(payload);
      },
      { queue: "primebrick-api" },
    );
    await NatsClient.subscribe<ServiceStalePayload>(
      SERVICE_SUBJECTS.STALE,
      async (payload, msg) => {
        if (!(await this.verifier.verify(msg, payload))) return;
        return this.handleStale(payload);
      },
      { queue: "primebrick-api" },
    );
    // Keep the publisher-identity cache fresh when clients enroll/rotate.
    // Shield-verified too: a rogue publisher must not be able to force
    // allowlist refetches.
    await NatsClient.subscribe(CLIENT_SHIELD_REGISTRY_SUBJECTS.CHANGED, async (_payload, msg) => {
      if (!(await this.verifier.verify(msg))) return;
      this.verifier.invalidate();
    });
    logger.done("Subscribed to service.register, service.heartbeat, service.unregister, service.stale", { tags: ["nats"] });

    // Announce the gateway is (back) online: every service already up
    // re-sends service.register, so a BE restart visibly re-ingests
    // identity/endpoints/capabilities and re-discovers OpenAPI — no polling.
    await NatsClient.publish(SERVICE_SUBJECTS.GATEWAY_ONLINE, { at: new Date().toISOString() });

    // Discover entities for services that are already online at startup.
    // This handles the case where the BE restarts while microservices are running.
    void this.discoverExistingServices();
  }

  /**
   * Discover entities for all services already marked as 'online' in the registry.
   * Called once at startup to populate the MCP entity registry for services that
   * registered before the BE was available.
   */
  private async discoverExistingServices(): Promise<void> {
    try {
      // Get all services from the registry
      const allServices = await this.repo.findAll();
      // Module inventory — the BE is never proactive, but it KNOWS every
      // registered service and its current state; make that visible.
      if (allServices.length === 0) {
        logger.info("No microservices discovered in registry", { tags: ["nats"] });
      } else {
        logger.done(`There are ${allServices.length} microservices discovered in registry:`, { tags: ["nats"] });
        for (const svc of allServices) {
          const ref = this.serviceRef(svc, svc.code);
          logger.info(`  ${ref} (${svc.code}) — ${svc.status.toUpperCase()}${svc.is_enabled ? "" : " DISABLED"}`, { tags: ["nats", svc.base_url] });
        }
      }
      for (const service of allServices) {
        if (service.status === "online" && !this.registeredServices.has(service.code)) {
          void this.registerMcpEntities(service.code, service.base_url);
        }
      }
    } catch (err) {
      logger.warn("Failed to discover existing services:", { tags: ["core"], error: err instanceof Error ? err.message : String(err) });
    }
  }

  /**
   * Canonical service identity for logs: `{pkg_name}/{version}` — the same
   * value as `system.client_shield_registry.ua_prefix`. Falls back to the service
   * code when the package name isn't known (pre-identity rows).
   */
  private serviceRef(svc: { pkg_name?: string; service_version?: string }, code: string): string {
    return svc.pkg_name
      ? `${svc.pkg_name}${svc.service_version ? `/${svc.service_version}` : ""}`
      : code;
  }

  private deriveStatus(
    http_healthy: boolean,
    nats_connected: boolean,
    checks?: Record<string, { ok: boolean }>,
  ): string {
    // A service whose db migration failed must never serve domain traffic —
    // the dedicated status wins over the generic health derivation.
    if (checks?.db_migration && checks.db_migration.ok === false) return "migration_failed";
    if (http_healthy && nats_connected) return "online";
    if (!http_healthy && !nats_connected) return "offline";
    return "going_live";
  }

  /**
   * Service-code integrity gate for `service.register`.
   *
   * `code` is static identity resolved by the service from its shipped
   * artifact — either derived (`pkg_name` minus the `primebrick-` prefix)
   * or an explicit package.json `service_code` override declared via
   * `code_source='override'`. A payload where `code` does not match the
   * derivation is a service presenting a mutated identity (e.g. a
   * hand-edited `service_code` config row): refused outright — the BE
   * never persists an identity the artifact cannot prove.
   */
  private checkServiceCodeIntegrity(payload: ServiceRegisterPayload): string | null {
    const code = payload.code;
    if (!/^[a-z][a-z0-9_]*$/.test(code)) {
      return `service code "${code}" is invalid — must match ^[a-z][a-z0-9_]*$`;
    }
    if (payload.code_source === "override") return null;
    const pkg = payload.pkg_name;
    if (!pkg) return null; // legacy payload without pkg_name — nothing to derive against
    const derived = pkg.replace(/^primebrick-/, "");
    if (code !== derived) {
      return (
        `service code "${code}" does not match pkg_name "${pkg}" (expected "${derived}") — ` +
        `an explicit service_code must be declared in package.json, not runtime config`
      );
    }
    return null;
  }

  /**
   * Schema ownership gate for `service.register`.
   *
   * A service claims the PG schemas of its DATABASE_SCHEMA env contract.
   * The claim is refused (`SCHEMA_OWNERSHIP_CONFLICT`) when:
   *   1. it covers a platform schema — the BE's own DATABASE_SCHEMA list
   *      (public/system/custom) is owned by the platform, never claimable
   *      by a microservice;
   *   2. it overlaps the `schemas` of any registry row whose `code` differs
   *      — claim persists while the row exists (offline/stale included), so
   *      a down service never loses ownership; only the same `code` may
   *      re-claim (restarts, multi-instance).
   *
   * Released only by explicit `service.unregister` (schemas cleared) or
   * admin purge of the row — never by status transitions.
   */
  private async checkSchemaOwnership(payload: ServiceRegisterPayload): Promise<string | null> {
    const claimed = (payload.schemas ?? []).filter((s) => typeof s === "string" && s.length > 0);
    if (claimed.length === 0) {
      logger.warn(`The service ${this.serviceRef(payload, payload.code)} registered with no schema claim — it owns no PG schema`, {
        tags: ["nats", payload.base_url],
      });
      return null;
    }

    const claimedSet = new Set(claimed);

    // Platform schemas are reserved: the BE's own DATABASE_SCHEMA declares
    // them (public/system/custom); a microservice claiming one is refused.
    const platformHit = assertDbEnv().schemas.find((s) => claimedSet.has(s));
    if (platformHit) {
      return `SCHEMA_OWNERSHIP_CONFLICT: schema '${platformHit}' is platform-owned and cannot be claimed by service '${payload.code}'`;
    }

    const rows = await this.repo.findAll();
    for (const row of rows) {
      if (row.code === payload.code) continue;
      const hit = (row.schemas ?? []).find((s) => claimedSet.has(s));
      if (hit) {
        return `SCHEMA_OWNERSHIP_CONFLICT: schema '${hit}' is already claimed by service '${row.code}' (${row.base_url}, status=${row.status})`;
      }
    }
    return null;
  }

  /**
   * `is_enabled` is a per-CODE operational decision (admin toggle), not a
   * per-row property — a service re-registering at a new base_url or
   * rising from a tombstone must never silently re-enable itself.
   * Decision rule: no prior rows → enabled (new service); any prior row
   * enabled → enabled; every prior row disabled → disabled.
   */
  private async enabledForNewRegistration(code: string): Promise<boolean> {
    const siblings = await this.repo.findAllByCode(code, "INCLUDED");
    if (siblings.length === 0) return true;
    return siblings.some((s) => s.is_enabled);
  }

  private async handleRegister(payload: ServiceRegisterPayload): Promise<{ registered: boolean; error?: string; key_generation?: number }> {
    const { code, base_url, is_behind_scaler } = payload;
    const status = this.deriveStatus(payload.http_healthy, payload.nats_connected, payload.checks);
    const now = new Date();
    const ref = this.serviceRef(payload, code);
    logger.info(`The service ${ref} is registering`, { tags: ["nats", base_url] });

    // Auto-enroll the caller identity: a service that registers with a
    // client_key_hash gets a `source='registry'` row keyed by
    // `{pkg_name}/{service_version}` — the UA prefix it will send.
    // Raw keys never travel; only the sha256 hash is stored.
    if (payload.pkg_name && payload.client_key_hash) {
      const uaPrefix = `${payload.pkg_name}/${payload.service_version ?? ""}`;
      // Derived-mode claims are cryptographically verified against the
      // service's HMAC chain (master → service secret → generation key):
      // the BE can check the material without ever seeing the secret.
      if (payload.key_mode === "derived" && payload.key_generation !== undefined) {
        const svc = new ClientShieldRegistryService();
        const valid = await svc.verifyDerivedClaim(uaPrefix, payload.key_generation, payload.client_key_hash);
        if (!valid) {
          logger.warn(`service.register rejected for the brick '${code}' — derived key material does not verify for ${uaPrefix} (generation ${payload.key_generation})`, {
            tags: ["nats", `brick:${code}`],
          });
          return { registered: false, error: "derived key material does not verify" };
        }
      }
      const outcome = await this.upsertClientShieldRegistry(
        uaPrefix,
        payload.client_key_hash,
        { keyMode: payload.key_mode, keyGeneration: payload.key_generation },
      );
      // Stale-generation (B14): the service derived for an older generation
      // — send back the issued one; its registrar self-heals and retries.
      if (outcome.outcome === "stale_generation") {
        return {
          registered: false,
          error: "stale key generation",
          key_generation: outcome.key_generation,
        };
      }
    }

    // `is_default` is a CLAIM, not a snapshot: `is_default: true` upgrades
    // the row, `false`/absent never downgrades — an admin-set default must
    // survive a service reboot. A claim colliding with a DIFFERENT holder
    // is demoted (keep-winner) and warned, never rejected — a display
    // preference must not gate a service boot.
    let claimDefault: boolean | undefined;
    if (payload.is_default === true) {
      const holder = await this.repo.findDefaultHolder(payload.part_of, code);
      if (holder) {
        claimDefault = false;
        logger.warn(
          `service.register: '${code}' claimed is_default for root '${payload.part_of}' but '${holder.code}' holds it — claim ignored (keep-winner)`,
          { tags: ["nats"] },
        );
      } else {
        claimDefault = true;
      }
    }

    // Shared per-register field set — identical across insert/update and
    // scaler/non-scaler paths (DRY: one payload→row projection). When the
    // claim is absent the column key is omitted so update paths preserve
    // the stored flag.
    const registerFields = {
      ...(claimDefault !== undefined ? { is_default: claimDefault } : {}),
      service_version: payload.service_version,
      pkg_name: payload.pkg_name,
      capabilities: payload.capabilities ?? [],
      schemas: payload.schemas ?? [],
      name: payload.name,
      description: payload.description,
      author: payload.author,
      github_repo_url: payload.github_repo_url,
      part_of: payload.part_of,
      endpoints: payload.endpoints,
      icon: payload.icon,
      icon_type: payload.icon_type,
      label_key: payload.label_key,
      status,
      last_health_check_at: now,
    };

    if (is_behind_scaler) {
      const existing = await this.repo.findByCode(code);
      if (existing) {
        const oldStatus = existing.status;
        // code is unique for scaler rows — a redeploy at a new base_url
        // moves the row; base_url belongs in the update set.
        await this.repo.updateByCode(code, { ...registerFields, base_url });
        this.logStatusChange(this.serviceRef(payload, code), base_url, oldStatus, status);
        const updated = await this.repo.findByCode(code);
        if (updated) this.emitServiceEvent("service.register", updated);
      } else {
        // Re-registration after a soft-delete: restore the tombstone row —
        // uuid, is_enabled and history survive the remove→re-add cycle.
        const tombstone = await this.repo.findDeletedByCode(code);
        if (tombstone?.uuid) {
          await this.repo.restoreByUuid(tombstone.uuid, tombstone.version);
          await this.repo.updateByCode(code, { ...registerFields, base_url });
          this.logStatusChange(ref, base_url, "restored", status);
          const restored = await this.repo.findByCode(code);
          if (restored) this.emitServiceEvent("service.register", restored);
        } else {
          await this.repo.insert({
            code,
            base_url,
            ...registerFields,
            icon_type: payload.icon_type || "icon",
            is_behind_scaler: true,
            is_enabled: await this.enabledForNewRegistration(code),
          });
          this.logStatusChange(ref, base_url, "unregistered", status);
          const inserted = await this.repo.findByCode(code);
          if (inserted) this.emitServiceEvent("service.register", inserted);
        }
      }
    } else {
      const existing = await this.repo.findByCodeAndBaseUrl(code, base_url);
      if (existing) {
        const oldStatus = existing.status;
        await this.repo.updateByCodeAndBaseUrl(code, base_url, registerFields);
        this.logStatusChange(this.serviceRef(payload, code), base_url, oldStatus, status);
        const updated = await this.repo.findByCodeAndBaseUrl(code, base_url);
        if (updated) this.emitServiceEvent("service.register", updated);
      } else {
        const tombstone = await this.repo.findDeletedByCodeAndBaseUrl(code, base_url);
        if (tombstone?.uuid) {
          await this.repo.restoreByUuid(tombstone.uuid, tombstone.version);
          await this.repo.updateByCodeAndBaseUrl(code, base_url, registerFields);
          this.logStatusChange(ref, base_url, "restored", status);
          const restored = await this.repo.findByCodeAndBaseUrl(code, base_url);
          if (restored) this.emitServiceEvent("service.register", restored);
        } else {
          await this.repo.insert({
            code,
            base_url,
            ...registerFields,
            icon_type: payload.icon_type || "icon",
            is_behind_scaler: false,
            is_enabled: await this.enabledForNewRegistration(code),
          });
          this.logStatusChange(ref, base_url, "unregistered", status);
          const inserted = await this.repo.findByCodeAndBaseUrl(code, base_url);
          if (inserted) this.emitServiceEvent("service.register", inserted);
        }
      }
    }

    // The row is persisted — only now is the service "registered".
    const caps = payload.capabilities ?? [];
    logger.done(
      `The service ${ref} has been registered${caps.length ? ` with the following capabilities: ${caps.join(", ")}` : " with no declared capabilities"}`,
      { tags: ["nats", base_url] },
    );

    // service.register ALWAYS re-discovers: a restarted service may carry
    // new endpoints/capabilities — registration is the moment that
    // sanitizes service continuity. Only heartbeats keep the dedup guard.
    if (status === "online") {
      void this.registerMcpEntities(code, base_url);
    }
    return { registered: true };
  }

  /**
   * Enroll/refresh a `source='registry'` row in system.client_shield_registry.
   * Registry rows are system-owned — find→add|update keeps them fresh on
   * re-registration; admins can only touch `source='manual'` rows.
   */
  private async upsertClientShieldRegistry(
    uaPrefix: string,
    clientKeyHash: string,
    opts: { keyMode?: "static" | "derived"; keyGeneration?: number } = {},
  ): Promise<{ outcome: "enrolled" | "stale_generation"; key_generation?: number }> {
    const outcome = await new ClientShieldRegistryService().enrollRegistryRow(uaPrefix, clientKeyHash, "service-registry", opts);
    if (outcome.outcome === "enrolled") {
      logger.done(`The service ${uaPrefix} has been enrolled and its protection shield key registered`, { tags: ["nats"] });
      // Invalidate consumer-side allowlist caches.
      await NatsClient.publish(CLIENT_SHIELD_REGISTRY_SUBJECTS.CHANGED, { ua_prefix: uaPrefix });
    } else {
      logger.warn(`The service ${uaPrefix} registered with a stale key generation — issued generation ${outcome.key_generation} returned`, { tags: ["nats"] });
    }
    return outcome;
  }

  private async handleHeartbeat(payload: ServiceHeartbeatPayload): Promise<void> {
    const { code, base_url, is_behind_scaler } = payload;
    const status = this.deriveStatus(payload.http_healthy, payload.nats_connected, payload.checks);
    const now = new Date();

    // If the service transitioned to online, discover and register its MCP entities.
    if (status === "online" && !this.registeredServices.has(code)) {
      void this.registerMcpEntities(code, base_url);
    }

    if (is_behind_scaler) {
      const existing = await this.repo.findByCode(code);
      if (existing) {
        const oldStatus = existing.status;
        await this.repo.updateByCode(code, {
          service_version: payload.service_version,
          pkg_name: payload.pkg_name,
          status,
          last_health_check_at: now,
        });
        this.logStatusChange(this.serviceRef(payload, code), base_url, oldStatus, status);
        const updated = await this.repo.findByCode(code);
        if (updated) this.emitServiceEvent("service.heartbeat", updated);
      } else {
        this.warnUnregistered(payload, code);
      }
    } else {
      const existing = await this.repo.findByCodeAndBaseUrl(code, base_url);
      if (existing) {
        const oldStatus = existing.status;
        await this.repo.updateByCodeAndBaseUrl(code, base_url, {
          service_version: payload.service_version,
          pkg_name: payload.pkg_name,
          status,
          last_health_check_at: now,
        });
        this.logStatusChange(this.serviceRef(payload, code), base_url, oldStatus, status);
        const updated = await this.repo.findByCodeAndBaseUrl(code, base_url);
        if (updated) this.emitServiceEvent("service.heartbeat", updated);
      } else {
        this.warnUnregistered(payload, code);
      }
    }
  }

  /** Warn once per service when a heartbeat arrives with no registry row —
   *  the service must (re-)send service.register; heartbeats don't create rows. */
  private warnedUnregistered = new Set<string>();
  private warnUnregistered(payload: ServiceHeartbeatPayload, code: string): void {
    if (this.warnedUnregistered.has(code)) return;
    this.warnedUnregistered.add(code);
    logger.warn(`The service ${this.serviceRef(payload, code)} sent a heartbeat but is not registered — waiting for service.register`, {
      tags: ["nats", payload.base_url],
    });
  }

  private async handleUnregister(payload: ServiceUnregisterPayload): Promise<void> {
    const { code, base_url, is_behind_scaler } = payload;
    const now = new Date();

    // Unregister MCP entities for this service
    if (this.registeredServices.has(code)) {
      entityRegistry.unregisterModule(code);
      this.registeredServices.delete(code);
      logger.info(`Unregistered entities for service ${code}`, { tags: ["nats"] });
    }

    // Explicit unregister releases the schema claim — only an admin purge
    // or a deliberate shutdown frees ownership; offline/stale rows keep it.
    if (is_behind_scaler) {
      await this.repo.updateByCode(code, {
        status: "offline",
        last_health_check_at: now,
        schemas: [],
      });
    } else {
      await this.repo.updateByCodeAndBaseUrl(code, base_url, {
        status: "offline",
        last_health_check_at: now,
        schemas: [],
      });
    }
    logger.warn(`The service ${this.serviceRef(payload, code)} is down (unregistered)`, { tags: ["nats", base_url] });
    this.emitServiceEvent("service.unregister", {
      code,
      base_url,
      is_behind_scaler,
    });
  }

  /**
   * Handle service.stale events published by the stale-detection job.
   * Fetches the updated service from the DB and emits it on the SSE bus.
   */
  private async handleStale(payload: ServiceStalePayload): Promise<void> {
    const { code, is_behind_scaler, base_url } = payload;
    const updated = is_behind_scaler
      ? await this.repo.findByCode(code)
      : await this.repo.findByCodeAndBaseUrl(code, base_url);
    if (updated) {
      this.emitServiceEvent("service.stale", updated);
    }
  }

  /**
   * Emit a service event on the SSE event bus.
   * The event id is deterministic per service code + timestamp to allow
   * FE-side deduplication.
   */
  private emitServiceEvent(eventType: string, data: unknown): void {
    const code = (data as { code?: string })?.code ?? "unknown";
    serviceEventsBus.emit({
      id: `${eventType}:${code}:${Date.now()}`,
      event: eventType,
      data,
    });
  }

  /**
   * Log only real persisted status transitions:
   *   → online      success (service became reachable)
   *   → going_live  warn    (degraded — one leg down, or heartbeat lost)
   *   → offline     warn    (unreachable)
   * Heartbeats that don't change the status produce no log.
   */
  private logStatusChange(ref: string, baseUrl: string, oldStatus: string, newStatus: string): void {
    if (oldStatus === newStatus) return;
    if (newStatus === "online") {
      logger.done(`The service ${ref} is live!`, { tags: ["nats", baseUrl] });
    } else {
      logger.warn(`The service ${ref} is ${newStatus}`, { tags: ["nats", baseUrl] });
    }
  }

  /**
   * Discover entities from a microservice's OpenAPI spec and register them
   * in the MCP entity registry. This enables dynamic MCP tool dispatch for
   * microservice entities without manual configuration.
   */
  private async registerMcpEntities(code: string, baseUrl: string): Promise<void> {
    try {
      // Owning package identity for the MCP startup log ({pkg}/{version}).
      const svc = (await this.repo.findAllByCode(code))[0];
      const sourceRef = svc ? this.serviceRef(svc, code) : code;

      const entities = await discoverEntitiesFromService(baseUrl, sourceRef);
      if (entities.length === 0) {
        // Spec fetched (or absent) but no /api/v1/entities/* CRUD routes —
        // mark as registered to avoid retrying on every heartbeat.
        this.registeredServices.add(code);
        logger.info(`No entity CRUD routes found for ${sourceRef}`, { tags: ["nats"] });
        return;
      }

      // Clear any existing entries for this module first (in case of re-registration)
      entityRegistry.unregisterModule(code);

      for (const entity of entities) {
        entityRegistry.registerProxyEntity(code, {
          entity: entity.entity,
          label: entity.label,
          supported_operations: entity.supported_operations,
        }, sourceRef);
      }

      this.registeredServices.add(code);
      logger.done(`Fetched ${entities.length} paths for Entity CRUD operations for ${sourceRef}: ${entities.map((e) => e.entity).join(", ")}`, { tags: ["nats"] });
    } catch (err) {
      logger.warn(`Failed to register entities for service ${code}`, { tags: ["nats"], error: err instanceof Error ? err.message : String(err) });
    }
  }
}
