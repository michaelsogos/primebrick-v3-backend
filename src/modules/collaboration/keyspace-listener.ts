/**
 * Redis keyspace notifications listener — detects presence key expiry and
 * publishes LEAVE events on NATS.
 *
 * When a presence hash (`presence:{entityType}:{entityUuid}:users`) expires
 * (TTL 30s, no heartbeat), the user has gone away. This listener detects
 * that expiry via Redis keyspace notifications and publishes a LEAVE delta
 * on NATS so connected SSE clients on all BE instances remove the user from
 * their presence UI.
 *
 * Requirements:
 * - Redis must be configured with `notify-keyspace-events Exg` (expired +
 *   generic events). If not enabled, the listener silently no-ops and the
 *   fallback sweep handles cleanup.
 *
 * Design:
 * - Subscribes to `__keyevent@0__:expired` channel.
 * - Parses the expired key to extract entityType + entityUuid.
 * - Only processes keys matching `presence:*:users` or `:editors`.
 * - Publishes a LEAVE delta on NATS `presence.{entityType}.{entityUuid}`.
 * - Best-effort: if NATS is unavailable, the local SSE bus still works
 *   (the next snapshot fetch will show the user is gone).
 */

import { createClient, type RedisClientType } from "redis";
import { NatsClient, publishPresence } from "@primebrick/sdk";

/**
 * Parse a presence key to extract entity type and UUID.
 * Key format: `presence:{entityType}:{entityUuid}:users` or `:editors` or `:tabs:{userUuid}` or `:changed`
 * Returns `null` if the key is not a presence users/editors key.
 */
function parsePresenceKey(
  key: string,
): { entityType: string; entityUuid: string; suffix: string } | null {
  if (!key.startsWith("presence:")) return null;
  const parts = key.split(":");
  // presence:{entityType}:{entityUuid}:users  → 4 parts
  // presence:{entityType}:{entityUuid}:editors → 4 parts
  // presence:{entityType}:{entityUuid}:tabs:{userUuid} → 5 parts
  // presence:{entityType}:{entityUuid}:changed → 4 parts
  if (parts.length < 4) return null;
  const entityType = parts[1];
  const entityUuid = parts[2];
  const suffix = parts[3];
  if (!entityType || !entityUuid || !suffix) return null;
  return { entityType, entityUuid, suffix };
}

/**
 * Start listening for Redis keyspace expiry events on presence keys.
 * Returns a cleanup function that unsubscribes and closes the dedicated client.
 *
 * Uses a SEPARATE Redis client for subscription (Redis requires a dedicated
 * connection for pub/sub — the main client cannot be used for both commands
 * and subscriptions).
 */
export async function startKeyspaceListener(
  redisUrl: string,
  logger: { warn: (msg: string) => void; info: (msg: string) => void },
): Promise<() => Promise<void>> {
  const subscriber: RedisClientType = createClient({ url: redisUrl }) as RedisClientType;

  await subscriber.connect();

  // Subscribe to keyspace expiry events on db 0
  const channel = "__keyevent@0__:expired";

  await subscriber.subscribe(channel, (message: string) => {
    // `message` is the expired key name
    const parsed = parsePresenceKey(message);
    if (!parsed) return; // not a presence key

    // Only process users/editors expiry — when the users hash expires,
    // all users on that entity are gone. When editors expires, editors are gone.
    if (parsed.suffix !== "users" && parsed.suffix !== "editors") return;

    // Publish a LEAVE delta on NATS
    // Note: we don't know which specific user expired (the whole hash expired),
    // so we publish a "snapshot-refresh" signal. Connected clients will
    // re-fetch the snapshot on the next heartbeat cycle.
    try {
      if (NatsClient.isConnected()) {
        publishPresence(NatsClient, parsed.entityType, parsed.entityUuid, {
          user_uuid: "__expired__",
          action: "LEAVE",
          entry: null,
          emitted_at: Date.now(),
        }).catch(() => {
          // best-effort
        });
      }
    } catch {
      // best-effort
    }
  });

  logger.info(`[presence] keyspace listener started on channel ${channel}`);

  return async () => {
    try {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
    } catch {
      // Non-critical
    }
  };
}
