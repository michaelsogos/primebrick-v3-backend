/**
 * Collaboration service — orchestration layer between the HTTP router and the
 * presence store + NATS publish.
 *
 * All methods are best-effort: if the presence store is unavailable (Redis
 * down), presence operations are no-ops. NATS publish is also best-effort
 * (if NATS is down, the local SSE bus still works for same-instance clients).
 */

import { NatsClient } from "@primebrick/sdk";
import type { PresencePort, PresenceEntry, PresenceSignal, PresenceSnapshot } from "@primebrick/sdk";
import { publishPresence } from "@primebrick/sdk";
import { getPresenceStore } from "./presence-store-holder.js";

/**
 * Build a `PresenceEntry` from the authenticated user + signal.
 * The entry is what gets stored in Redis and sent to other clients.
 */
function buildEntry(
  user: { id: string; name: string | null },
  signal: PresenceSignal,
  status: "READING" | "EDITING",
  tabCount: number,
): PresenceEntry {
  return {
    user_uuid: user.id,
    user_name: user.name ?? user.id,
    avatar_color: null,
    avatar_initials: null,
    status,
    field: signal.field,
    value: signal.value,
    last_seen_at: Date.now(),
    tab_count: tabCount,
  };
}

export const collaborationService = {
  /**
   * Process a presence signal from a client.
   * Updates Redis via PresencePort and publishes a NATS delta.
   * No-op if presence store is unavailable.
   */
  async handleSignal(
    entityType: string,
    entityUuid: string,
    user: { id: string; name: string | null },
    signal: PresenceSignal,
  ): Promise<void> {
    const store = getPresenceStore();
    if (!store) return; // best-effort: presence disabled

    const sessionId = signal.session_id ?? "default";

    switch (signal.action) {
      case "READING": {
        const entry = buildEntry(user, signal, "READING", 1);
        await store.upsertReading(entityType, entityUuid, entry);
        await this.publishDelta(entityType, entityUuid, {
          user_uuid: user.id,
          action: "READING",
          entry,
          emitted_at: Date.now(),
        });
        break;
      }
      case "EDITING": {
        const entry = buildEntry(user, signal, "EDITING", 1);
        await store.upsertEditing(entityType, entityUuid, entry);
        await this.publishDelta(entityType, entityUuid, {
          user_uuid: user.id,
          action: "EDITING",
          entry,
          emitted_at: Date.now(),
        });
        break;
      }
      case "LEAVE": {
        await store.remove(entityType, entityUuid, user.id);
        await this.publishDelta(entityType, entityUuid, {
          user_uuid: user.id,
          action: "LEAVE",
          entry: null,
          emitted_at: Date.now(),
        });
        break;
      }
      case "HEARTBEAT": {
        await store.heartbeat(entityType, entityUuid, user.id, sessionId);
        // Heartbeats don't publish a NATS delta (no state change for other clients)
        break;
      }
    }
  },

  /**
   * Get the presence snapshot for an entity.
   * Returns an empty snapshot if presence store is unavailable.
   */
  async getSnapshot(entityType: string, entityUuid: string): Promise<PresenceSnapshot> {
    const store = getPresenceStore();
    if (!store) {
      return { readers: [], editors: [], changed: null, current_version: 0 };
    }
    return store.getSnapshot(entityType, entityUuid);
  },

  /**
   * Publish a presence delta on NATS.
   * Best-effort: if NATS is unavailable, the local SSE bus still works.
   */
  async publishDelta(
    entityType: string,
    entityUuid: string,
    delta: {
      user_uuid: string;
      action: string;
      entry: PresenceEntry | null;
      emitted_at: number;
    },
  ): Promise<void> {
    try {
      if (NatsClient.isConnected()) {
        await publishPresence(NatsClient, entityType, entityUuid, delta as any);
      }
    } catch {
      // best-effort: NATS publish failure is non-fatal
    }
  },
};
