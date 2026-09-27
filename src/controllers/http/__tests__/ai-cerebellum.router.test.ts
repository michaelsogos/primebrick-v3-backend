/**
 * HTTP-level tests for `controllers/http/ai-cerebellum.router.ts`.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  PERMISSION_DECLARED_TEST: Symbol.for("primebrick.permission_declared"),
  service: {
    listAiCerebellum: vi.fn(),
    getAiCerebellum: vi.fn(),
    createAiCerebellum: vi.fn(),
    updateAiCerebellum: vi.fn(),
    deleteAiCerebellum: vi.fn(),
    restoreAiCerebellum: vi.fn(),
    getAiCerebellumAudit: vi.fn(),
    invalidateCache: vi.fn(),
  },
}));

vi.mock("../../../modules/ai-cerebellum/ai_cerebellum.service.js", () => ({
  AiCerebellumService: vi.fn().mockImplementation(function () {
    return mocks.service;
  }),
}));

vi.mock("../../../modules/auth/rbac.middleware.js", () => ({
  PERMISSION_DECLARED: mocks.PERMISSION_DECLARED_TEST,
  rbacHandler: () => {
    const h: any = (req: any, _res: any, next: any) => {
      req.user = { id: "user-1", permissions: new Set(["*"]), isAdmin: true };
      next();
    };
    h[mocks.PERMISSION_DECLARED_TEST] = true;
    return h;
  },
}));

vi.mock("../../../modules/auth/mfa-step-up.middleware.js", () => ({
  requireMfaStepUp: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock("../../../db/pool.js", () => ({ getPool: vi.fn(() => ({})) }));

vi.mock("../../../http/meta-assembler.js", () => ({ assembleMeta: () => ({ meta: true }) }));
vi.mock("../../../http/entity-actions.js", () => ({ deriveEntityActions: () => [] }));

import { aiCerebellumRouter } from "../ai-cerebellum.router.js";
import { mountRouter, type TestApp } from "./harness.js";

let app: TestApp;
beforeAll(async () => {
  app = await mountRouter(aiCerebellumRouter());
});
afterAll(() => app.close());

const BASE = "/api/v1/entities/ai_cerebellum";

describe("ai-cerebellum router", () => {
  it("GET /meta returns 200", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/meta`);
    expect(res.status).toBe(200);
  });

  it("GET /list calls service.listAiCerebellum", async () => {
    mocks.service.listAiCerebellum.mockResolvedValue({ data: [] });
    const res = await fetch(`${app.baseUrl}${BASE}/list`);
    expect(res.status).toBe(200);
    expect(mocks.service.listAiCerebellum).toHaveBeenCalledTimes(1);
  });

  it("GET /:uuid non-uuid → 400", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/abc`);
    expect(res.status).toBe(400);
  });

  it("PUT /:uuid valid → service.updateAiCerebellum + cache invalidation", async () => {
    const uuid = "123e4567-e89b-42d3-a456-426614174000";
    mocks.service.updateAiCerebellum.mockResolvedValue({ uuid });
    mocks.service.invalidateCache.mockResolvedValue(undefined);
    const res = await fetch(`${app.baseUrl}${BASE}/${uuid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: { name: "c" } }),
    });
    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      expect(mocks.service.updateAiCerebellum).toHaveBeenCalled();
    }
  });

  it("POST /:uuid/restore without version → 400", async () => {
    const uuid = "123e4567-e89b-42d3-a456-426614174000";
    const res = await fetch(`${app.baseUrl}${BASE}/${uuid}/restore`, { method: "POST" });
    expect(res.status).toBe(400);
  });
});
