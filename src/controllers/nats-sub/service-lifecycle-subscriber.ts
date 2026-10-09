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
import { NatsClient, SERVICE_SUBJECTS, CLIENT_REGISTRY_SUBJECTS, type ServiceRegisterPayload, type ServiceHeartbeatPayload, type ServiceUnregisterPayload, type ServiceStalePayload } from "@primebrick/sdk";
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

  constructor() {
    this.repo = new ServiceRegistryRepo(getPool());
  }

  async start(): Promise<void> {
    await NatsClient.subscribe<ServiceRegisterPayload>(
      SERVICE_SUBJECTS.REGISTER,
      (payload) => this.handleRegister(payload),
    );
    await NatsClient.subscribe<ServiceHeartbeatPayload>(
      SERVICE_SUBJECTS.HEARTBEAT,
      (payload) => this.handleHeartbeat(payload),
    );
    await NatsClient.subscribe<ServiceUnregisterPayload>(
      SERVICE_SUBJECTS.UNREGISTER,
      (payload) => this.handleUnregister(payload),
    );
    await NatsClient.subscribe<ServiceStalePayload>(
      SERVICE_SUBJECTS.STALE,
      (payload) => this.handleStale(payload),
    );
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
      for (const service of allServices) {
        if (service.status === "online" && !this.registeredServices.has(service.code)) {
          void this.registerMcpEntities(service.code, service.base_url);
        }
      }
    } catch (err) {
      logger.warn("Failed to discover existing services:", { tags: ["core"], error: err instanceof Error ? err.message : String(err) });
    }
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

    // If the service is online, discover and register its MCP entities.
    // Skip if already registered (heartbeats re-trigger handleRegister).
    if (status === "online" && !this.registeredServices.has(code)) {
      void this.registerMcpEntities(code, base_url);
    }

    if (is_behind_scaler) {
      const existing = await this.repo.findByCode(code);
      if (existing) {
        const oldStatus = existing.status;
        await this.repo.updateByCode(code, {
          service_version: payload.service_version,
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
        this.logStatusChange(code, base_url, oldStatus, status);
        const updated = await this.repo.findByCode(code);
        if (updated) this.emitServiceEvent("service.register", updated);
      } else {
        await this.repo.insert({
          code,
          base_url,
          endpoints: payload.endpoints,
          service_version: payload.service_version,
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
        logger.done(`${code} registered (scaler mode) at ${base_url}`, { tags: ["nats"] });
        const inserted = await this.repo.findByCode(code);
        if (inserted) this.emitServiceEvent("service.register", inserted);
      }
    } else {
      const existing = await this.repo.findByCodeAndBaseUrl(code, base_url);
      if (existing) {
        const oldStatus = existing.status;
        await this.repo.updateByCodeAndBaseUrl(code, base_url, {
          service_version: payload.service_version,
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
        this.logStatusChange(code, base_url, oldStatus, status);
        const updated = await this.repo.findByCodeAndBaseUrl(code, base_url);
        if (updated) this.emitServiceEvent("service.register", updated);
      } else {
        await this.repo.insert({
          code,
          base_url,
          endpoints: payload.endpoints,
          service_version: payload.service_version,
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
        logger.done(`${code} registered (direct mode) at ${base_url}`, { tags: ["nats"] });
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
          status,
          last_health_check_at: now,
        });
        this.logStatusChange(code, base_url, oldStatus, status);
        const updated = await this.repo.findByCode(code);
        if (updated) this.emitServiceEvent("service.heartbeat", updated);
      }
    } else {
      const existing = await this.repo.findByCodeAndBaseUrl(code, base_url);
      if (existing) {
        const oldStatus = existing.status;
        await this.repo.updateByCodeAndBaseUrl(code, base_url, {
          service_version: payload.service_version,
          status,
          last_health_check_at: now,
        });
        this.logStatusChange(code, base_url, oldStatus, status);
        const updated = await this.repo.findByCodeAndBaseUrl(code, base_url);
        if (updated) this.emitServiceEvent("service.heartbeat", updated);
      }
    }
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
    logger.warn(`${code} at ${base_url} unregistered → offline`, { tags: ["nats"] });
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
  private logStatusChange(code: string, baseUrl: string, oldStatus: string, newStatus: string): void {
    if (oldStatus === newStatus) return;
    const msg = `${code} ${baseUrl} changed: ${oldStatus} → ${newStatus}`;
    if (newStatus === "online") {
      logger.done(msg, { tags: ["nats"] });
    } else {
      logger.warn(msg, { tags: ["nats"] });
    }
  }

  /**
   * Discover entities from a microservice's OpenAPI spec and register them
   * in the MCP entity registry. This enables dynamic MCP tool dispatch for
   * microservice entities without manual configuration.
   */
  private async registerMcpEntities(code: string, baseUrl: string): Promise<void> {
    try {
      const entities = await discoverEntitiesFromService(baseUrl);
      if (entities.length === 0) {
        // No entities discovered — mark as registered to avoid retrying on every heartbeat
        this.registeredServices.add(code);
        return;
      }

      // Clear any existing entries for this module first (in case of re-registration)
      entityRegistry.unregisterModule(code);

      // Owning package identity for the MCP startup log ({pkg}/{version}).
      const svc = (await this.repo.findAllByCode(code))[0];
      const sourceRef = svc?.name
        ? `${svc.name}${svc.service_version ? `/${svc.service_version}` : ""}`
        : undefined;

      for (const entity of entities) {
        entityRegistry.registerProxyEntity(code, {
          entity: entity.entity,
          label: entity.label,
          supported_operations: entity.supported_operations,
        }, sourceRef);
      }

      this.registeredServices.add(code);
      logger.info(`Registered ${entities.length} entities for service ${code}: ${entities.map((e) => e.entity).join(", ")}`, { tags: ["nats"] });
    } catch (err) {
      logger.warn(`Failed to register entities for service ${code}`, { tags: ["nats"], error: err instanceof Error ? err.message : String(err) });
    }
  }
}
