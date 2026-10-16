/**
 * Stale detection job — runs every 30s, transitions service_registry rows
 * through a two-phase decay based on the last heartbeat received:
 *
 * - >90s without heartbeat  → 'stale'    (3x heartbeat interval)
 * - >1h  without heartbeat  → 'offline'  (instance presumed dead)
 *
 * Rows with no heartbeat ever age from `created_at`, so instances that
 * registered once and vanished still decay instead of staying 'unknown'
 * forever. Rows are never deleted — an explicit admin purge (DELETE on the
 * registry API) is required to release the schema claim.
 *
 * `is_reserved` platform rows (e.g. `settings`) are heartbeat-free by
 * design and are excluded from both transitions and outage detection.
 *
 * - If ALL managed rows are stale simultaneously → CRITICAL error logged
 *   (NATS outage suspected).
 *
 * DB-only — no HTTP probing.
 */

import { logger } from "@primebrick/sdk";
import { NatsClient, SERVICE_SUBJECTS, type ServiceStalePayload } from "@primebrick/sdk";
import {
  ServiceRegistryService,
  type ServiceRegistryEntry,
} from "../../modules/system/service-registry.service.js";

const STALE_THRESHOLD_MS = 90_000;
const OFFLINE_THRESHOLD_MS = 3_600_000;
const POLL_INTERVAL_MS = 30_000;

export class StaleDetectionJob {
  private repo: ServiceRegistryService;
  private timer: ReturnType<typeof setInterval> | null = null;
  /** Fires the "all services stale" alarm once per outage, not every poll. */
  private allStaleAlerted = false;

  constructor() {
    this.repo = new ServiceRegistryService();
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.run(), POLL_INTERVAL_MS);
    logger.info("Service heartbeats watchdog started", { tags: ["nats"] });
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Age of the row's most recent proof-of-life: heartbeat, else registration. */
  private ageMs(s: ServiceRegistryEntry, now: number): number {
    const ref = s.last_health_check_at ?? s.created_at;
    return ref ? now - new Date(ref).getTime() : 0;
  }

  private async run(): Promise<void> {
    // Reserved platform rows are not heartbeat-managed — exclude them.
    const managed = (await this.repo.findAll()).filter((s) => !s.is_reserved);
    if (managed.length === 0) return;

    const now = Date.now();
    const aged = managed.filter((s) => this.ageMs(s, now) > STALE_THRESHOLD_MS);

    if (aged.length === 0) {
      this.allStaleAlerted = false;
      return;
    }

    // If ALL managed services are stale → NATS outage suspected (alarm once per outage)
    if (aged.length === managed.length && !this.allStaleAlerted) {
      this.allStaleAlerted = true;
      logger.error(
        `All ${managed.length} registered services are stale — last heartbeat received >${STALE_THRESHOLD_MS / 1000}s ago. NATS outage suspected. Service routing will return 503 for degraded services.`,
      { tags: ["nats"] });
    } else if (aged.length !== managed.length) {
      this.allStaleAlerted = false;
    }

    // Transition aged rows: >OFFLINE_THRESHOLD → 'offline', else → 'stale'.
    // Decay is monotonic — a row already 'offline' is never demoted back to
    // 'stale' (only an explicit heartbeat/register can revive it). Rows
    // already at their target status are skipped so logs/events fire only
    // on the actual transition, not every poll.
    for (const s of aged) {
      const age = this.ageMs(s, now);
      const target = age > OFFLINE_THRESHOLD_MS || s.status === "offline" ? "offline" : "stale";
      if (s.status === target) continue;
      const oldStatus = s.status;
      if (s.is_behind_scaler) {
        await this.repo.updateByCode(s.code, { status: target });
      } else {
        await this.repo.updateByCodeAndBaseUrl(s.code, s.base_url, { status: target });
      }
      const ref = s.pkg_name
        ? `${s.pkg_name}${s.service_version ? `/${s.service_version}` : ""}`
        : s.code;
      logger.warn(
        `The service ${ref} is ${target} — no heartbeat for ${Math.round(age / 1000)}s`,
        { tags: ["nats", s.base_url], was: oldStatus },
      );

      // Publish service.stale on NATS so all BE instances (and their SSE clients)
      // learn about the status transition in real time.
      const stalePayload: ServiceStalePayload = {
        code: s.code,
        base_url: s.base_url,
        is_behind_scaler: s.is_behind_scaler,
        status: target,
        last_health_check_at: s.last_health_check_at
          ? new Date(s.last_health_check_at).toISOString()
          : new Date().toISOString(),
      };
      try {
        await NatsClient.publish(SERVICE_SUBJECTS.STALE, stalePayload);
      } catch (err) {
        // NATS publish failure is non-critical — the DB is already updated.
        logger.warn(`Failed to publish service.stale for ${s.code}:`, { tags: ["core"], error: err });
      }
    }
  }
}
