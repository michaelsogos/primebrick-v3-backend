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
import { getUserService } from "../auth/services/user.service.js";

/**
 * Resolve the presence identity from `user_profiles` — the canonical,
 * live display source (same as `/auth/me` and the audit
 * `changed_by_display_name` join). The token claim (`user.name`) is only
 * a login-time snapshot and goes stale when the user edits their
 * profile; it stays as the fallback when the lookup fails — presence is
 * best-effort and must never break on a profile read error.
 */
async function resolveIdentity(user: { id: string; name: string | null }): Promise<{
  name: string;
  avatar_color: string | null;
  avatar_initials: string | null;
}> {
  try {
    const profile = await getUserService().getByUuid(user.id);
    if (profile) {
      return {
        name: profile.display_name ?? user.name ?? user.id,
        avatar_color: profile.avatar_color ?? null,
        avatar_initials: profile.avatar_initials ?? null,
      };
    }
  } catch {
    // best-effort: fall back to the token claim
  }
  return { name: user.name ?? user.id, avatar_color: null, avatar_initials: null };
}

/**
 * Build a `PresenceEntry` from the resolved identity + signal.
 * The entry is what gets stored in Redis and sent to other clients.
 */
function buildEntry(
  identity: { name: string; avatar_color: string | null; avatar_initials: string | null },
  userId: string,
  signal: PresenceSignal,
  status: "READING" | "EDITING",
  tabCount: number,
): PresenceEntry {
  return {
    user_uuid: userId,
    user_name: identity.name,
    avatar_color: identity.avatar_color,
    avatar_initials: identity.avatar_initials,
    status,
    field: signal.field,
    value: signal.value,
    last_seen_at: Date.now(),
    tab_count: tabCount,
    session_id: signal.session_id,
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
    const identity = await resolveIdentity(user);

    switch (signal.action) {
      case "READING": {
        const entry = buildEntry(identity, user.id, signal, "READING", 1);
        await store.upsertReading(entityType, entityUuid, entry);
        await this.publishDelta(entityType, entityUuid, {
          user_uuid: user.id,
          session_id: signal.session_id,
          action: "READING",
          entry,
          emitted_at: Date.now(),
        });
        break;
      }
      case "EDITING": {
        const entry = buildEntry(identity, user.id, signal, "EDITING", 1);
        await store.upsertEditing(entityType, entityUuid, entry);
        await this.publishDelta(entityType, entityUuid, {
          user_uuid: user.id,
          session_id: signal.session_id,
          action: "EDITING",
          entry,
          emitted_at: Date.now(),
        });
        break;
      }
      case "LEAVE": {
        await store.remove(entityType, entityUuid, user.id, signal.session_id);
        await this.publishDelta(entityType, entityUuid, {
          user_uuid: user.id,
          session_id: signal.session_id,
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
      session_id?: string;
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
