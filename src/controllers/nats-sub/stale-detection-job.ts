/**
 * Stale detection job — runs every 30s, checks for service_registry rows
 * whose last_health_check_at is older than the stale threshold (90s = 3x
 * heartbeat interval).
 *
 * - Stale rows are marked as 'going_live' (not 'offline' — they might be
 *   alive on HTTP even if NATS heartbeats stopped).
 * - Rows already 'offline' stay 'offline'.
 * - If ALL rows are stale simultaneously → CRITICAL error logged (NATS
 *   outage suspected).
 *
 * DB-only — no HTTP probing.
 */

import { logger } from "@primebrick/sdk";
import { NatsClient, SERVICE_SUBJECTS, type ServiceStalePayload } from "@primebrick/sdk";
import { getPool } from "../../db/pool.js";
import { ServiceRegistryRepo } from "../../modules/proxy/service-registry-repo.js";

const STALE_THRESHOLD_MS = 90_000;
const POLL_INTERVAL_MS = 30_000;

export class StaleDetectionJob {
  private repo: ServiceRegistryRepo;
  private timer: ReturnType<typeof setInterval> | null = null;
  /** Fires the "all services stale" alarm once per outage, not every poll. */
  private allStaleAlerted = false;

  constructor() {
    this.repo = new ServiceRegistryRepo(getPool());
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

  private async run(): Promise<void> {
    const services = await this.repo.findAll();
    if (services.length === 0) return;

    const now = Date.now();
    const stale = services.filter(
      (s) =>
        s.last_health_check_at &&
        now - new Date(s.last_health_check_at).getTime() > STALE_THRESHOLD_MS,
    );

    if (stale.length === 0) {
      this.allStaleAlerted = false;
      return;
    }

    // If ALL services are stale → NATS outage suspected (alarm once per outage)
    if (stale.length === services.length && !this.allStaleAlerted) {
      this.allStaleAlerted = true;
      logger.error(
        `All ${services.length} registered services are stale — last heartbeat received >${STALE_THRESHOLD_MS / 1000}s ago. NATS outage suspected. Service routing will return 503 for degraded services.`,
      { tags: ["nats"] });
    } else if (stale.length !== services.length) {
      this.allStaleAlerted = false;
    }

    // Mark stale rows as going_live (not offline — they might be alive on HTTP)
    // Rows already offline stay offline; rows already going_live are skipped
    // so logs/events fire only on the actual status transition, not every poll.
    for (const s of stale) {
      if (s.status === "offline" || s.status === "going_live") continue;
      const oldStatus = s.status;
      if (s.is_behind_scaler) {
        await this.repo.updateByCode(s.code, { status: "going_live" });
      } else {
        await this.repo.updateByCodeAndBaseUrl(s.code, s.base_url, { status: "going_live" });
      }
      const ref = s.pkg_name
        ? `${s.pkg_name}${s.service_version ? `/${s.service_version}` : ""}`
        : s.code;
      logger.warn(
        `The service ${ref} is going_live — no heartbeat for >${STALE_THRESHOLD_MS / 1000}s`,
        { tags: ["nats", s.base_url], was: oldStatus },
      );

      // Publish service.stale on NATS so all BE instances (and their SSE clients)
      // learn about the stale service in real time.
      const stalePayload: ServiceStalePayload = {
        code: s.code,
        base_url: s.base_url,
        is_behind_scaler: s.is_behind_scaler,
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
