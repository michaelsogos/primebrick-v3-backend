/**
 * Per-entity SSE event bus registry (refcounted) + bridgeNatsToSse lifecycle.
 *
 * This is the only new SSE plumbing in the BE. It composes the SDK primitives
 * directly:
 * - `createSseEventBus()` — in-process event distribution
 * - `bridgeNatsToSse()` — NATS → bus fanout (multi-instance)
 *
 * Design:
 * - `acquire(entity, uuid)` → creates a bus + NATS bridge on first client,
 *   refcount++ on subsequent clients. Returns the bus.
 * - `release(entity, uuid)` → refcount--; on 0 → cleanupNats() + bus.close()
 *   + delete entry.
 *
 * This keeps NATS subscriptions scoped to entities with local SSE clients
 * (scales horizontally — each BE instance only subscribes to subjects for
 * entities that have local viewers).
 */

import {
  createSseEventBus,
  bridgeNatsToSse,
  NatsClient,
  presenceSubject,
  entityChangedSubject,
  type SseEventBus,
} from "@primebrick/sdk";

interface BusEntry {
  bus: SseEventBus;
  refcount: number;
  cleanupNats: () => void;
}

const registry = new Map<string, BusEntry>();

function entityKey(entityType: string, entityUuid: string): string {
  return `${entityType}:${entityUuid}`;
}

export const collaborationBusRegistry = {
  /**
   * Acquire (or increment refcount on) the per-entity SSE event bus.
   * On first acquire, creates the bus and bridges NATS subjects to it.
   * Returns the bus for the SSE endpoint to subscribe to.
   */
  async acquire(entityType: string, entityUuid: string): Promise<SseEventBus> {
    const key = entityKey(entityType, entityUuid);
    const existing = registry.get(key);
    if (existing) {
      existing.refcount++;
      return existing.bus;
    }

    // First client — create bus + bridge NATS
    const bus = createSseEventBus();
    let cleanupNats: () => void = () => {};

    try {
      if (NatsClient.isConnected()) {
        cleanupNats = await bridgeNatsToSse(NatsClient, bus, [
          {
            subject: presenceSubject(entityType, entityUuid),
            eventType: "presence-update",
            transform: (payload) => ({
              id: `presence:${entityType}:${entityUuid}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
              data: payload,
            }),
          },
          {
            subject: entityChangedSubject(entityType, entityUuid),
            eventType: "entity-changed",
            transform: (payload) => ({
              id: `changed:${entityType}:${entityUuid}:${Date.now()}`,
              data: payload,
            }),
          },
        ]);
      }
    } catch {
      // NATS unavailable — bus still works for same-instance clients
    }

    registry.set(key, { bus, refcount: 1, cleanupNats });
    return bus;
  },

  /**
   * Release a reference to the per-entity bus.
   * On last release (refcount → 0), tears down the NATS bridge and closes
   * the bus.
   */
  release(entityType: string, entityUuid: string): void {
    const key = entityKey(entityType, entityUuid);
    const entry = registry.get(key);
    if (!entry) return;
    entry.refcount--;
    if (entry.refcount <= 0) {
      try {
        entry.cleanupNats();
      } catch {
        // Non-critical — NATS subscription may already be closed
      }
      try {
        entry.bus.close();
      } catch {
        // Non-critical
      }
      registry.delete(key);
    }
  },

  /**
   * Close all buses and NATS bridges (graceful shutdown).
   */
  closeAll(): void {
    for (const entry of registry.values()) {
      try {
        entry.cleanupNats();
      } catch {
        // Non-critical
      }
      try {
        entry.bus.close();
      } catch {
        // Non-critical
      }
    }
    registry.clear();
  },
};
