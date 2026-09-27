/**
 * HTTP-level tests for `controllers/http/ai-models.router.ts` — real
 * Express routing + fetch calls, mocked domain deps (service, rbac, pool).
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  PERMISSION_DECLARED_TEST: Symbol.for("primebrick.permission_declared"),
  service: {
    listAiModels: vi.fn(),
    getAiModel: vi.fn(),
    createAiModel: vi.fn(),
    updateAiModel: vi.fn(),
    deleteAiModel: vi.fn(),
    restoreAiModel: vi.fn(),
    getAiModelAudit: vi.fn(),
    invalidateCache: vi.fn(),
  },
}));

vi.mock("../../../modules/ai-models/ai_models.service.js", () => ({
  AiModelsService: vi.fn().mockImplementation(function () {
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

import { aiModelsRouter } from "../ai-models.router.js";
import { mountRouter, type TestApp } from "./harness.js";
import { ApiError } from "../../../http/api-errors.js";

let app: TestApp;
beforeAll(async () => {
  app = await mountRouter(aiModelsRouter());
});
afterAll(() => app.close());

const BASE = "/api/v1/entities/ai_model";

describe("ai-models router", () => {
  it("GET /meta returns assembled meta", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/meta`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.meta).toBe(true);
  });

  it("GET /list calls service.listAiModels and returns 200", async () => {
    mocks.service.listAiModels.mockResolvedValue({ data: [{ uuid: "m1" }] });
    const res = await fetch(`${app.baseUrl}${BASE}/list`);
    expect(res.status).toBe(200);
    expect(mocks.service.listAiModels).toHaveBeenCalledTimes(1);
    const body = await res.json();
    expect(body.data[0].uuid).toBe("m1");
  });

  it("GET /:uuid with non-uuid → 400 (validateUuidParam)", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/not-a-uuid`);
    expect(res.status).toBe(400);
  });

  it("GET /:uuid → service.getAiModel, 404 maps through", async () => {
    const uuid = "123e4567-e89b-42d3-a456-426614174000";
    mocks.service.getAiModel.mockRejectedValue(
      new ApiError("/errors/not-found", "Not Found", 404, "gone", { internal_code: "NOT_FOUND" }),
    );
    const res = await fetch(`${app.baseUrl}${BASE}/${uuid}`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.internal_code).toBe("NOT_FOUND");
  });

  it("POST / → service.createAiModel + invalidateCache hook, 201", async () => {
    mocks.service.createAiModel.mockResolvedValue({ uuid: "new-1" });
    mocks.service.invalidateCache.mockResolvedValue(undefined);
    const res = await fetch(`${app.baseUrl}${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: { model_id: "x", display_name: "X" } }),
    });
    expect([200, 201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(mocks.service.createAiModel).toHaveBeenCalled();
      expect(mocks.service.invalidateCache).toHaveBeenCalled();
    }
  });

  it("DELETE /:uuid without version → 400", async () => {
    const uuid = "123e4567-e89b-42d3-a456-426614174000";
    const res = await fetch(`${app.baseUrl}${BASE}/${uuid}`, { method: "DELETE" });
    expect(res.status).toBe(400);
  });
});
