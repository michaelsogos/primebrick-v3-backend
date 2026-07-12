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

export class ServiceLifecycleSubscriber {
  private repo: ServiceRegistryRepo;

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
}
