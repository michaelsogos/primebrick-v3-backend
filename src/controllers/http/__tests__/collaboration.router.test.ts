/**
 * HTTP-level tests for `controllers/http/collaboration.router.ts` —
 * presence POST/GET (SSE stream endpoint excluded: it is long-lived by
 * design). Field-level diffs are served by the OWNING service's paged
 * audit endpoint, not by this gateway router.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  PERMISSION_DECLARED_TEST: Symbol.for("primebrick.permission_declared"),
  service: {
    handleSignal: vi.fn(async () => {}),
    getSnapshot: vi.fn(),
    publishDelta: vi.fn(),
  },
  busRegistry: {
    acquire: vi.fn(async () => ({ subscribe: () => {}, unsubscribe: () => {} })),
    release: vi.fn(),
  },
}));

vi.mock("../../../modules/collaboration/collaboration.service.js", () => ({
  collaborationService: mocks.service,
}));

vi.mock("../../../modules/collaboration/collaboration-bus-registry.js", () => ({
  collaborationBusRegistry: mocks.busRegistry,
}));

vi.mock("../../../modules/auth/rbac.middleware.js", () => ({
  PERMISSION_DECLARED: mocks.PERMISSION_DECLARED_TEST,
  rbacHandler: () => {
    const h: any = (req: any, _res: any, next: any) => {
      req.user = { id: "user-1", name: "U", permissions: new Set(["*"]) };
      next();
    };
    h[mocks.PERMISSION_DECLARED_TEST] = true;
    return h;
  },
}));


import { collaborationRouter } from "../collaboration.router.js";
import { mountRouter, type TestApp } from "./harness.js";

let app: TestApp;
beforeAll(async () => {
  app = await mountRouter(collaborationRouter());
});
afterAll(() => app.close());

const E = "/api/v1/entities/customers/u-1";

describe("collaboration router", () => {
  it("POST presence → handleSignal, 204", async () => {
    const res = await fetch(`${app.baseUrl}${E}/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "READING" }),
    });
    expect(res.status).toBe(204);
    expect(mocks.service.handleSignal).toHaveBeenCalledWith(
      "customers",
      "u-1",
      expect.objectContaining({ id: "user-1" }),
      expect.objectContaining({ action: "READING" }),
    );
  });

  it("POST presence invalid body → 400", async () => {
    const res = await fetch(`${app.baseUrl}${E}/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "NOPE" }),
    });
    expect(res.status).toBe(400);
  });

  it("GET presence → snapshot passthrough", async () => {
    mocks.service.getSnapshot.mockResolvedValue({ readers: [], editors: [], changed: null, current_version: 3 });
    const res = await fetch(`${app.baseUrl}${E}/presence`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.current_version).toBe(3);
  });
});
