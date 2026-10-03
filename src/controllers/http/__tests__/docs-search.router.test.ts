/**
 * HTTP-level tests for `controllers/http/docs-search.router.ts` — real
 * Express routing + fetch calls, mocked domain deps (service, rbac).
 *
 * CRITICAL: mounts the real `extJsonBodyParser` (not express.json) so the
 * test reproduces production behavior — EVERY JSON integer arrives as
 * bigint, and floats must parse without throwing. Regression coverage for:
 *   - json-bigint useNativeBigInt crash on float payloads (was: 400
 *     "Invalid JSON body" on any float)
 *   - zod schema rejecting bigint `limit` (now zBoundedInt)
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import express, { type Express } from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { extJsonBodyParser } from "@primebrick/sdk";

const mocks = vi.hoisted(() => ({
  PERMISSION_DECLARED_TEST: Symbol.for("primebrick.permission_declared"),
  service: { search: vi.fn() },
}));

vi.mock("../../../modules/system/docs-search.service.js", () => ({
  DocsSearchService: vi.fn().mockImplementation(function () {
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

import { docsSearchRouter } from "../docs-search.router.js";
import { errorHandler } from "../../../http/error-handler.js";

let server: Server;
let baseUrl: string;
beforeAll(async () => {
  const app: Express = express();
  app.use(extJsonBodyParser());
  app.use(docsSearchRouter());
  app.use(errorHandler);
  server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((r) => server.close(() => r())));

const BASE = "/api/v1/system/docs/search";

describe("docs-search router", () => {
  it("accepts float embedding + integer limit (ext-json body)", async () => {
    mocks.service.search.mockResolvedValueOnce([
      { id: 1, title: "t", path: "p", similarity: 0.5 },
    ]);
    const res = await fetch(`${baseUrl}${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embedding: [-0.0029447146225720644, -0.05281605198979378, 0.0064],
        keywords: ["admin", "user"],
        limit: 4,
      }),
    });
    expect(res.status).toBe(200);
    // Numbers must be plain `number` when reaching the service (bigint
    // normalized away by the schema transforms).
    const arg = mocks.service.search.mock.calls[0][0];
    expect(typeof arg.limit).toBe("number");
    expect(arg.limit).toBe(4);
    expect(arg.embedding.every((v: unknown) => typeof v === "number")).toBe(
      true,
    );
  });

  it("accepts an embedding element serialized without decimals", async () => {
    mocks.service.search.mockResolvedValueOnce([]);
    const res = await fetch(`${baseUrl}${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"embedding":[0,1,-0.5]}',
    });
    expect(res.status).toBe(200);
    const arg = mocks.service.search.mock.calls.at(-1)![0];
    expect(arg.embedding).toEqual([0, 1, -0.5]);
  });

  it("400s on a non-integer out-of-range limit", async () => {
    const res = await fetch(`${baseUrl}${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"embedding":[0.1],"limit":999}',
    });
    expect(res.status).toBe(400);
  });

  it("400s on a malformed body", async () => {
    const res = await fetch(`${baseUrl}${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad json",
    });
    expect(res.status).toBe(400);
  });
});
