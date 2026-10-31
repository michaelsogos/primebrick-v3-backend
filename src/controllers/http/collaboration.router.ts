/**
 * Collaboration router — presence endpoints (POST/GET) + SSE events.
 *
 * Endpoints:
 * - `POST /api/v1/entities/:entity/:uuid/presence` — send a presence signal.
 * - `GET  /api/v1/entities/:entity/:uuid/presence` — get the presence snapshot.
 * - `GET  /api/v1/entities/:entity/:uuid/presence/events` — SSE stream.
 *
 * Field-level diffs come from the OWNING service's paged audit endpoint
 * (`GET {svc}/api/v1/entities/:entity/:uuid/audit?page=1&limit=1`) — this
 * gateway never queries another service's audit tables.
 *
 * Auth via `rbacHandler([Permission.AUTHENTICATED_USER])` (cookie-based;
 * `createSseConnection` sends `credentials:'include'`).
 *
 * The SSE endpoint mirrors `src/controllers/http/services-events.router.ts`:
 * - `createSseWriter(res)` (SDK primitive — headers + wire format + BigInt-safe)
 * - Initial snapshot on connect
 * - Subscribe to per-entity bus (refcounted NATS bridge via
 *   `collaborationBusRegistry`)
 * - Keep-alive 15s
 * - Cleanup on `req.on("close")`
 */

import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../../modules/auth/rbac.middleware.js";
import { Permission, createSseWriter } from "@primebrick/sdk";
import { asyncHandler } from "../../http/async-handler.js";
import { validateBody } from "../../http/validation.js";
import { PresenceSignalSchema } from "../../modules/collaboration/dto.js";
import { collaborationService } from "../../modules/collaboration/collaboration.service.js";
import { collaborationBusRegistry } from "../../modules/collaboration/collaboration-bus-registry.js";


const KEEPALIVE_MS = 15_000;

export function collaborationRouter() {
  const router = makeProtectedRouter();

  // POST /api/v1/entities/:entity/:uuid/presence — send a presence signal
  router.post(
    "/api/v1/entities/:entity/:uuid/presence",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    validateBody(PresenceSignalSchema),
    asyncHandler(async (req, res) => {
      const entity = String(req.params.entity);
      const uuid = String(req.params.uuid);
      const user = req.user!;
      await collaborationService.handleSignal(entity, uuid, user, req.body);
      res.status(204).end();
    }),
  );

  // GET /api/v1/entities/:entity/:uuid/presence — get the presence snapshot
  router.get(
    "/api/v1/entities/:entity/:uuid/presence",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (req, res) => {
      const entity = String(req.params.entity);
      const uuid = String(req.params.uuid);
      const snapshot = await collaborationService.getSnapshot(entity, uuid);
      res.json(snapshot);
    }),
  );

  // GET /api/v1/entities/:entity/:uuid/presence/events — SSE stream
  router.get(
    "/api/v1/entities/:entity/:uuid/presence/events",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (req, res) => {
      const entity = String(req.params.entity);
      const uuid = String(req.params.uuid);
      const writer = createSseWriter(res);

      // 1. Acquire per-entity bus (creates + bridges NATS on first client)
      const bus = await collaborationBusRegistry.acquire(entity, uuid);

      // 2. Send initial snapshot with current state
      try {
        const snapshot = await collaborationService.getSnapshot(entity, uuid);
        writer.send({
          id: `snapshot:${entity}:${uuid}:${Date.now()}`,
          event: "snapshot",
          data: snapshot,
        });
      } catch {
        // DB/Redis might be unavailable — send error event but keep stream open
        writer.send({
          id: `error:${Date.now()}`,
          event: "error",
          data: { type: "internal", message: "Failed to load initial snapshot" },
        });
      }

      // 3. Subscribe to the per-entity bus — exclude echoes of THIS TAB's
      //    session only. Another tab of the same user is a different session
      //    and MUST be echoed (same-user multi-tab awareness).
      const connSession = typeof req.query.session_id === "string" ? req.query.session_id : undefined;
      const sub = bus.subscribe((ev) => {
        const data = ev.data as Record<string, unknown> | null;
        if (ev.event === "presence-update" && connSession && data?.session_id === connSession) return;
        writer.send(ev);
      });

      // 4. Keep-alive every 15s (comment line, not an event)
      const keepAlive = setInterval(() => writer.comment("keep-alive"), KEEPALIVE_MS);

      // 5. Cleanup on client disconnect
      req.on("close", () => {
        sub.unsubscribe();
        clearInterval(keepAlive);
        writer.close();
        collaborationBusRegistry.release(entity, uuid);
      });
    }),
  );

  return router;
}
