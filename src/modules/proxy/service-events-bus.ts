/**
 * Singleton SSE event bus for service lifecycle events.
 *
 * One instance per BE process. The service-lifecycle-subscriber emits events
 * here after persisting state changes to the DB. The SSE endpoint at
 * /api/v1/system/services/events subscribes to this bus and forwards events
 * to connected clients.
 *
 * Multi-instance fanout is handled by NATS: every BE instance subscribes to
 * the same NATS subjects and emits to its own local bus.
 */

import { createSseEventBus, type SseEventBus } from "@primebrick/sdk";

export const serviceEventsBus: SseEventBus = createSseEventBus();
