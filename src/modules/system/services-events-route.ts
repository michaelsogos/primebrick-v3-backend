/**
 * SSE endpoint for service registry events.
 *
 * GET /api/v1/system/services/events
 *
 * Pushes real-time service lifecycle events to connected FE clients,
 * replacing the 30s polling loop. Events:
 * - snapshot: initial full state on connect
 * - service.register: microservice registered
 * - service.heartbeat: microservice heartbeat (status update)
 * - service.unregister: microservice unregistered → offline
 * - service.stale: stale-detection job marked service as going_live
 * - error: server shutdown or auth expired
 *
 * @see @primebrick/sdk docs/user-guide/sse-standard.mdx for the full standard.
 */

import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission, createSseWriter } from "@primebrick/sdk";
import { asyncHandler } from "../../http/async-handler.js";
import { getPool } from "../../db/pool.js";
import { ServiceRegistryRepo } from "../proxy/service-registry-repo.js";
import { serviceEventsBus } from "../proxy/service-events-bus.js";

const KEEPALIVE_MS = 15_000;

export function servicesEventsRouter() {
  const router = makeProtectedRouter();

  router.get(
    "/api/v1/system/services/events",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (req, res) => {
      const writer = createSseWriter(res);

      // 1. Send initial snapshot with current state
      try {
        const repo = new ServiceRegistryRepo(getPool());
        const services = await repo.findAll();
        writer.send({
          id: `snapshot:${Date.now()}`,
          event: "snapshot",
          data: { services },
        });
      } catch (err) {
        // DB might be unavailable — send error and close
        writer.send({
          id: `error:${Date.now()}`,
          event: "error",
          data: { type: "internal", message: "Failed to load initial snapshot" },
        });
        writer.close();
        return;
      }

      // 2. Subscribe to the service events bus
      const sub = serviceEventsBus.subscribe((event) => {
        writer.send(event);
      });

      // 3. Keep-alive every 15s (comment line, not an event)
      const keepAlive = setInterval(() => writer.comment("keep-alive"), KEEPALIVE_MS);

      // 4. Cleanup on client disconnect
      req.on("close", () => {
        sub.unsubscribe();
        clearInterval(keepAlive);
        writer.close();
      });
    }),
  );

  return router;
}
