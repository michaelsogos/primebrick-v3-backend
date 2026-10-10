/**
 * BE-side NATS subscriber for microservice lifecycle events.
 *
 * Subscribes to service.register, service.heartbeat, service.unregister
 * and persists state changes to the service_registry table via
 * ServiceRegistryRepo (DAL Repository — no raw SQL).
 *
 * Status derivation:
 *   http_healthy && nats_connected → 'online'
 *   !http_healthy && !nats_connected → 'offline'
 *   one true, one false → 'going_live'
 */

import { logger } from "@primebrick/sdk";
import { NatsClient, SERVICE_SUBJECTS, CLIENT_REGISTRY_SUBJECTS, verifyClientIdentity, clientKeyHash, CLIENT_SHIELD_KEY_HEADER, msgHeader, type ServiceRegisterPayload, type ServiceHeartbeatPayload, type ServiceUnregisterPayload, type ServiceStalePayload } from "@primebrick/sdk";
import type { Msg } from "nats";
import { getPool } from "../../db/pool.js";
import { ServiceRegistryRepo } from "../../modules/proxy/service-registry-repo.js";
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
  private repo: ServiceRegistryRepo;
  /** Tracks which services have already had their entities registered (avoids re-fetching on every heartbeat). */
  private registeredServices: Set<string> = new Set();
  /** Snapshot of system.client_registry for publisher verification — 60s TTL + invalidated on `changed`. */
  private clientRows: { ua_prefix: string; client_key_hash: string }[] | null = null;
  private clientRowsAt = 0;

  constructor() {
    this.repo = new ServiceRegistryRepo(getPool());
  }

  async start(): Promise<void> {
    // Registration is a request/reply handshake (B16): the service retries
    // every 5s until this ack lands — no ack, no heartbeats.
    await NatsClient.subscribeRequest<ServiceRegisterPayload, { registered: boolean; error?: string }>(
      SERVICE_SUBJECTS.REGISTER,
      async (payload, msg) => {
        // service.register IS the enrollment channel — a first-time
        // registration can't prove a key the registry doesn't know yet.
        // Enrolled prefixes must present the matching key (no squatting).
        if (!(await this.verifyPublisher(msg, SERVICE_SUBJECTS.REGISTER, payload, { allowNewPrefix: true }))) {
          return { registered: false, error: "publisher identity rejected" };
        }
        await this.handleRegister(payload);
        return { registered: true };
      },
    );
    await NatsClient.subscribe<ServiceHeartbeatPayload>(
      SERVICE_SUBJECTS.HEARTBEAT,
      async (payload, msg) => {
        if (!(await this.verifyPublisher(msg, SERVICE_SUBJECTS.HEARTBEAT, payload))) return;
        return this.handleHeartbeat(payload);
      },
    );
    await NatsClient.subscribe<ServiceUnregisterPayload>(
      SERVICE_SUBJECTS.UNREGISTER,
      async (payload, msg) => {
        if (!(await this.verifyPublisher(msg, SERVICE_SUBJECTS.UNREGISTER, payload))) return;
        return this.handleUnregister(payload);
      },
    );
    await NatsClient.subscribe<ServiceStalePayload>(
      SERVICE_SUBJECTS.STALE,
      (payload) => this.handleStale(payload),
    );
    // Keep the publisher-identity cache fresh when clients enroll/rotate.
    await NatsClient.subscribe(CLIENT_REGISTRY_SUBJECTS.CHANGED, async () => {
      this.clientRows = null;
    });
    logger.done("Subscribed to service.register, service.heartbeat, service.unregister, service.stale", { tags: ["nats"] });

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
   * Publisher-identity gate for lifecycle subjects: the same
   * `verifyClientIdentity` rule as the HTTP gate, applied to NATS headers
   * (NatsClient.publish stamps them automatically). Rows are cached 60s and
   * invalidated on `system.client_registry.changed`.
   */
  private async verifyPublisher(
    msg: Msg,
    subject: string,
    claimed?: { code?: string; base_url?: string; pkg_name?: string; service_version?: string; client_key_hash?: string } | null,
    opts: { allowNewPrefix?: boolean } = {},
  ): Promise<boolean> {
    if (!this.clientRows || Date.now() - this.clientRowsAt > 60_000) {
      this.clientRows = await getPool().query<{ ua_prefix: string; client_key_hash: string }>(
        `SELECT ua_prefix, client_key_hash FROM system.client_registry WHERE is_enabled AND deleted_at IS NULL`,
      ).then((r) => r.rows);
      this.clientRowsAt = Date.now();
    }
    const hdrs = msg.headers;
    const getHdr = (name: string): string | null => msgHeader(hdrs, name); // MsgHdrs is case-sensitive
    const rows = this.clientRows ?? [];
    const ua = getHdr("user-agent") ?? "";
    const knownPrefix = rows.find((r) => ua.startsWith(r.ua_prefix))?.ua_prefix;
    if (opts.allowNewPrefix && ua && !knownPrefix && claimed?.client_key_hash) {
      // First enrollment — the payload's client_key_hash becomes the
      // registry row in handleRegister/handleHeartbeat; nothing to verify
      // against yet. Without a hash there is nothing to enroll → reject.
      return true;
    }
    const result = await verifyClientIdentity(
      { headers: { get: getHdr } },
      {
        allowedPrefixes: rows.map((r) => r.ua_prefix),
        verifyKey: (prefix, key) =>
          rows.find((r) => r.ua_prefix === prefix)?.client_key_hash === clientKeyHash(key),
      },
    );
    if (!result.ok) {
      const claimedRef = claimed
        ? this.serviceRef(claimed, claimed.code ?? "unknown")
        : "unknown";
      logger.error(`${claimedRef} "${subject}" rejected — ${result.error}`, {
        tags: ["nats", `${result.status}`, claimed?.base_url ?? "no-base-url"],
        presented_ua: ua || null,
        shield_key_present: Boolean(getHdr(CLIENT_SHIELD_KEY_HEADER)),
      });
    }
    return result.ok;
  }

  /**
   * Canonical service identity for logs: `{pkg_name}/{version}` — the same
   * value as `system.client_registry.ua_prefix`. Falls back to the service
   * code when the package name isn't known (pre-identity rows).
   */
  private serviceRef(svc: { pkg_name?: string; service_version?: string }, code: string): string {
    return svc.pkg_name
      ? `${svc.pkg_name}${svc.service_version ? `/${svc.service_version}` : ""}`
      : code;
  }

  private deriveStatus(http_healthy: boolean, nats_connected: boolean): string {
    if (http_healthy && nats_connected) return "online";
    if (!http_healthy && !nats_connected) return "offline";
    return "going_live";
  }

  private async handleRegister(payload: ServiceRegisterPayload): Promise<void> {
    const { code, base_url, is_behind_scaler } = payload;
    const status = this.deriveStatus(payload.http_healthy, payload.nats_connected);
    const now = new Date();
    const ref = this.serviceRef(payload, code);
    logger.info(`The service ${ref} is registering`, { tags: ["nats", base_url] });

    // Auto-enroll the caller identity: a service that registers with a
    // client_key_hash gets a `source='registry'` row keyed by
    // `{pkg_name}/{service_version}` — the UA prefix it will send.
    // Raw keys never travel; only the sha256 hash is stored.
    if (payload.pkg_name && payload.client_key_hash) {
      await this.upsertClientRegistry(
        `${payload.pkg_name}/${payload.service_version ?? ""}`,
        payload.client_key_hash,
      );
    }

    logger.done(`The service ${ref} has been registered`, {
      tags: ["nats", base_url],
      capabilities: payload.capabilities ?? [],
    });

    // service.register ALWAYS re-discovers: a restarted service may carry
    // new endpoints/capabilities — registration is the moment that
    // sanitizes service continuity. Only heartbeats keep the dedup guard.
    if (status === "online") {
      void this.registerMcpEntities(code, base_url);
    }

    if (is_behind_scaler) {
      const existing = await this.repo.findByCode(code);
      if (existing) {
        const oldStatus = existing.status;
        await this.repo.updateByCode(code, {
          service_version: payload.service_version,
          pkg_name: payload.pkg_name,
          capabilities: payload.capabilities ?? [],
          name: payload.name,
          description: payload.description,
          author: payload.author,
          github_repo_url: payload.github_repo_url,
          endpoints: payload.endpoints,
          icon: payload.icon,
          icon_type: payload.icon_type,
          status,
          last_health_check_at: now,
        });
        this.logStatusChange(this.serviceRef(payload, code), base_url, oldStatus, status);
        const updated = await this.repo.findByCode(code);
        if (updated) this.emitServiceEvent("service.register", updated);
      } else {
        await this.repo.insert({
          code,
          base_url,
          endpoints: payload.endpoints,
          service_version: payload.service_version,
          pkg_name: payload.pkg_name,
          capabilities: payload.capabilities ?? [],
          name: payload.name,
          description: payload.description,
          author: payload.author,
          github_repo_url: payload.github_repo_url,
          icon: payload.icon,
          icon_type: payload.icon_type || "icon",
          is_behind_scaler: true,
          is_enabled: true,
          status,
          last_health_check_at: now,
        });
        this.logStatusChange(ref, base_url, "unregistered", status);
        const inserted = await this.repo.findByCode(code);
        if (inserted) this.emitServiceEvent("service.register", inserted);
      }
    } else {
      const existing = await this.repo.findByCodeAndBaseUrl(code, base_url);
      if (existing) {
        const oldStatus = existing.status;
        await this.repo.updateByCodeAndBaseUrl(code, base_url, {
          service_version: payload.service_version,
          pkg_name: payload.pkg_name,
          capabilities: payload.capabilities ?? [],
          name: payload.name,
          description: payload.description,
          author: payload.author,
          github_repo_url: payload.github_repo_url,
          endpoints: payload.endpoints,
          icon: payload.icon,
          icon_type: payload.icon_type,
          status,
          last_health_check_at: now,
        });
        this.logStatusChange(this.serviceRef(payload, code), base_url, oldStatus, status);
        const updated = await this.repo.findByCodeAndBaseUrl(code, base_url);
        if (updated) this.emitServiceEvent("service.register", updated);
      } else {
        await this.repo.insert({
          code,
          base_url,
          endpoints: payload.endpoints,
          service_version: payload.service_version,
          pkg_name: payload.pkg_name,
          capabilities: payload.capabilities ?? [],
          name: payload.name,
          description: payload.description,
          author: payload.author,
          github_repo_url: payload.github_repo_url,
          icon: payload.icon,
          icon_type: payload.icon_type || "icon",
          is_behind_scaler: false,
          is_enabled: true,
          status,
          last_health_check_at: now,
        });
        this.logStatusChange(ref, base_url, "unregistered", status);
        const inserted = await this.repo.findByCodeAndBaseUrl(code, base_url);
        if (inserted) this.emitServiceEvent("service.register", inserted);
      }
    }
  }

  /**
   * Upsert a `source='registry'` row in system.client_registry.
   * Registry rows are system-owned — ON CONFLICT keeps them fresh on
   * re-registration; admins can only touch `source='manual'` rows.
   */
  private async upsertClientRegistry(uaPrefix: string, clientKeyHash: string): Promise<void> {
    const pool = getPool();
    await pool.query(
      `INSERT INTO system.client_registry (ua_prefix, client_key_hash, source, is_enabled, created_by, updated_by)
       VALUES ($1, $2, 'registry', true, 'service-registry', 'service-registry')
       ON CONFLICT (ua_prefix) DO UPDATE
         SET client_key_hash = EXCLUDED.client_key_hash,
             updated_at = now(), updated_by = 'service-registry',
             deleted_at = NULL, deleted_by = NULL
         WHERE system.client_registry.source = 'registry'`,
      [uaPrefix, clientKeyHash],
    );
    logger.done(`The service ${uaPrefix} has been enrolled and its protection shield key registered`, { tags: ["nats"] });
    // Invalidate consumer-side allowlist caches.
    await NatsClient.publish(CLIENT_REGISTRY_SUBJECTS.CHANGED, { ua_prefix: uaPrefix });
  }

  private async handleHeartbeat(payload: ServiceHeartbeatPayload): Promise<void> {
    const { code, base_url, is_behind_scaler } = payload;
    const status = this.deriveStatus(payload.http_healthy, payload.nats_connected);
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

    if (is_behind_scaler) {
      await this.repo.updateByCode(code, {
        status: "offline",
        last_health_check_at: now,
      });
    } else {
      await this.repo.updateByCodeAndBaseUrl(code, base_url, {
        status: "offline",
        last_health_check_at: now,
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
