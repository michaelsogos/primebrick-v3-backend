/**
 * HTTP boundary tests for `GET /api/v1/system/translations/find` —
 * the one documented cross-domain translation read. Transport concerns
 * only: `matches[]=`/`matches=` query parsing, language passthrough, one
 * service call, route order ('find' must not bind `:module`), RFC7807
 * propagation of service errors.
 */
import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  PERMISSION_DECLARED_TEST: Symbol.for("primebrick.permission_declared"),
  service: {
    findTranslations: vi.fn(),
    getI18nDict: vi.fn(),
    list: vi.fn(),
  },
}));

vi.mock("../../../modules/system/translations.service.js", () => ({
  TranslationsService: vi.fn().mockImplementation(function () {
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
    h[mocks.PERMISSION_DECLARED_TEST] = { declared: ["test.perm"] };
    return h;
  },
}));

import { translationsRouter } from "../translations.router.js";
import { mountRouter, type TestApp } from "./harness.js";

import { extJsonParse } from '@primebrick/sdk';
let app: TestApp;
beforeAll(async () => {
  app = await mountRouter(translationsRouter());
});
afterAll(() => app.close());
beforeEach(() => vi.clearAllMocks());

const BASE = "/api/v1/system/translations";
const RESULT = {
  rows: [{ uuid: "u1", module: "job", key: "job.a.b", language: "en-GB", value: "x" }],
  page: 1,
  page_size: 1,
  total: "1",
};

describe("GET /system/translations/find", () => {
  it("'find' is matched as its own route — not swallowed by /:module/:language", async () => {
    mocks.service.findTranslations.mockResolvedValue(RESULT);
    const res = await fetch(`${app.baseUrl}${BASE}/find?matches=job.*`);
    expect(res.status).toBe(200);
    // the dict route would have called getI18nDict — prove it never ran
    expect(mocks.service.getI18nDict).not.toHaveBeenCalled();
    expect(mocks.service.findTranslations).toHaveBeenCalledWith(["job.*"], undefined);
  });

  it("matches[]=a&matches[]=b → string[] passthrough", async () => {
    mocks.service.findTranslations.mockResolvedValue(RESULT);
    const res = await fetch(`${app.baseUrl}${BASE}/find?matches[]=job.*&matches[]=ai.entities.x`);
    expect(res.status).toBe(200);
    expect(mocks.service.findTranslations).toHaveBeenCalledWith(["job.*", "ai.entities.x"], undefined);
  });

  it("matches=a,b csv form is accepted and split", async () => {
    mocks.service.findTranslations.mockResolvedValue(RESULT);
    const res = await fetch(`${app.baseUrl}${BASE}/find?matches=job.*,app.common.ok`);
    expect(res.status).toBe(200);
    expect(mocks.service.findTranslations).toHaveBeenCalledWith(["job.*", "app.common.ok"], undefined);
  });

  it("language is forwarded when present", async () => {
    mocks.service.findTranslations.mockResolvedValue(RESULT);
    const res = await fetch(`${app.baseUrl}${BASE}/find?matches=job.*&language=it-IT`);
    expect(res.status).toBe(200);
    expect(mocks.service.findTranslations).toHaveBeenCalledWith(["job.*"], "it-IT");
  });

  it("missing matches → 400, service never called", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/find?language=en-GB`);
    expect(res.status).toBe(400);
    expect(mocks.service.findTranslations).not.toHaveBeenCalled();
  });

  it("invalid language literal → 400", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/find?matches=job.*&language=klingon`);
    expect(res.status).toBe(400);
    expect(mocks.service.findTranslations).not.toHaveBeenCalled();
  });

  it("service ValidationError propagates as RFC7807 400", async () => {
    const { ValidationError } = await import("../../../http/api-errors.js");
    mocks.service.findTranslations.mockRejectedValue(
      new ValidationError("Invalid match 'x'", { internal_code: "TRANSLATIONS_FIND_MATCHER_GRAMMAR" }),
    );
    const res = await fetch(`${app.baseUrl}${BASE}/find?matches=x`);
    expect(res.status).toBe(400);
    const body = await res.text().then((t) => extJsonParse<any>(t));
    expect(body.internal_code).toBe("TRANSLATIONS_FIND_MATCHER_GRAMMAR");
  });
});
