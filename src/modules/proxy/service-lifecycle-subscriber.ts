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

import { NatsClient, SERVICE_SUBJECTS, type ServiceRegisterPayload, type ServiceHeartbeatPayload, type ServiceUnregisterPayload } from "@primebrick/sdk";
import { getPool } from "../../db/pool.js";
import { ServiceRegistryRepo } from "./service-registry-repo.js";
import { entityRegistry } from "../mcp/tools/entity-registry.js";
import { discoverEntitiesFromService } from "../mcp/tools/openapi-discovery.js";

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
    console.log("[service-lifecycle] Subscribed to service.register, service.heartbeat, service.unregister");

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
      console.warn("[mcp-discovery] Failed to discover existing services:", err instanceof Error ? err.message : String(err));
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
        console.log(`[service] ${code} registered (scaler mode) at ${base_url}`);
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
        console.log(`[service] ${code} registered (direct mode) at ${base_url}`);
      }
    }
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
      console.log(`[mcp-discovery] Unregistered entities for service ${code}`);
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
    console.log(`[service] ${code} at ${base_url} unregistered → offline`);
  }

  private logStatusChange(code: string, baseUrl: string, oldStatus: string, newStatus: string): void {
    if (oldStatus !== newStatus) {
      console.log(`[health] ${code} ${baseUrl} changed: ${oldStatus} → ${newStatus}`);
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

      for (const entity of entities) {
        entityRegistry.registerProxyEntity(code, {
          entity: entity.entity,
          label: entity.label,
          supported_operations: entity.supported_operations,
        });
      }

      this.registeredServices.add(code);
      console.log(`[mcp-discovery] Registered ${entities.length} entities for service ${code}: ${entities.map((e) => e.entity).join(", ")}`);
    } catch (err) {
      console.warn(`[mcp-discovery] Failed to register entities for service ${code}:`, err instanceof Error ? err.message : String(err));
    }
  }
}
