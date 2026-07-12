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

import { getPool } from "../../db/pool.js";
import { ServiceRegistryRepo } from "./service-registry-repo.js";

const STALE_THRESHOLD_MS = 90_000;
const POLL_INTERVAL_MS = 30_000;

export class StaleDetectionJob {
  private repo: ServiceRegistryRepo;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.repo = new ServiceRegistryRepo(getPool());
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.run(), POLL_INTERVAL_MS);
    console.log(`[stale-detection] Started — checking every ${POLL_INTERVAL_MS / 1000}s, stale threshold ${STALE_THRESHOLD_MS / 1000}s`);
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

    if (stale.length === 0) return;

    // If ALL services are stale → NATS outage suspected
    if (stale.length === services.length) {
      console.error(
        `[CRITICAL] All ${services.length} registered services are stale — last heartbeat received >${STALE_THRESHOLD_MS / 1000}s ago. NATS outage suspected. Service routing will return 503 for degraded services.`,
      );
    }

    // Mark stale rows as going_live (not offline — they might be alive on HTTP)
    // Rows already offline stay offline
    for (const s of stale) {
      if (s.status === "offline") continue;
      const oldStatus = s.status;
      if (s.is_behind_scaler) {
        await this.repo.updateByCode(s.code, { status: "going_live" });
      } else {
        await this.repo.updateByCodeAndBaseUrl(s.code, s.base_url, { status: "going_live" });
      }
      console.log(`[health] ${s.code} ${s.base_url} changed: ${oldStatus} → going_live (stale)`);
    }
  }
}
