/**
 * marker-persister — persists `EntityChangedMarker`s arriving on NATS into
 * the Redis presence store.
 *
 * Service-owned entities (job-handler `job_rule`, crm `customer`, …) publish
 * markers via the SDK's `makeMarkerAuditPort` — services have no Redis
 * client, so the gateway owns ALL Redis writes: this unqueued subscriber on
 * `entity.*.*.changed` applies `setChanged` (5-min stale marker for late
 * joiners) and `markEdited` (the saver's `edited_at` presence stamp) for
 * every marker, regardless of which service published it.
 *
 * BE-owned entities publish through `EntityAuditPort`, which writes Redis
 * directly AND publishes NATS — those markers land here too; the writes are
 * idempotent (same values), so the double application is harmless.
 *
 * Best-effort like everything presence: no store → no-op. NATS availability
 * races boot (services register before the gateway's NATS is up), so a
 * not-connected check schedules a self-retry every 5s — same idiom as
 * `initPresenceStoreFromConfig` — instead of silently never starting. A
 * rejected subscribe resets `started` and retries too.
 */

import { NatsClient } from "@primebrick/sdk";
import type { EntityChangedMarker } from "@primebrick/sdk";
import { getPresenceStore } from "./presence-store-holder.js";

const MARKER_SUBJECT = "entity.*.*.changed";
const CHANGED_TTL_MS = 300_000; // 5 min — matches EntityAuditPort/RedisPresencePort
const RETRY_MS = 5_000;

let started = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

export function startMarkerPersister(
  logger: Pick<typeof import("@primebrick/sdk").logger, "warn" | "info" | "done">,
): void {
  if (started) return;
  if (!NatsClient.isConnected()) {
    logger.warn("marker persister — NATS not connected yet, retrying in 5s", {
      tags: ["collaborativity-feature"],
    });
    retryTimer ??= setTimeout(() => {
      retryTimer = null;
      startMarkerPersister(logger);
    }, RETRY_MS);
    return;
  }
  // `started` guards concurrent subscribe attempts — the rejection path
  // resets it so a failed subscribe is retried, not latched dead.
  started = true;
  void NatsClient.subscribe<EntityChangedMarker>(MARKER_SUBJECT, async (marker) => {
    const store = getPresenceStore();
    if (!store) return;
    try {
      await store.setChanged(marker, CHANGED_TTL_MS);
      await store.markEdited(
        marker.entity_type,
        marker.entity_uuid,
        marker.changed_by,
        marker.changed_at,
      );
    } catch {
      // best-effort: Redis hiccup loses one marker persist — live SSE
      // delivery through the bus registry is unaffected.
    }
  }).then(
    () =>
      logger.done(`marker persister subscribed on '${MARKER_SUBJECT}'`, {
        tags: ["collaborativity-feature"],
      }),
    (err) => {
      started = false;
      logger.warn(`marker persister subscribe failed, retrying in 5s: ${err}`, {
        tags: ["collaborativity-feature"],
      });
      retryTimer ??= setTimeout(() => {
        retryTimer = null;
        startMarkerPersister(logger);
      }, RETRY_MS);
    },
  );
}
