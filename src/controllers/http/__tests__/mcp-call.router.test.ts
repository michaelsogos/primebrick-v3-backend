/**
 * HTTP-level tests for `controllers/http/mcp-call.router.ts` — the REST shim
 * the Guide's action CTA uses to invoke the generic MCP tools. Verifies the
 * transport contract: zod body validation, authenticated-user gate, single
 * service delegation with (user, token, tool, args), and status passthrough
 * of the service result (RBAC denial → 403, unknown tool → 404).
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  PERMISSION_DECLARED_TEST: Symbol.for("primebrick.permission_declared"),
  service: { call: vi.fn() },
  toolDefs: [{ name: "list_entities" }, { name: "create_entity" }],
}));

vi.mock("../../../modules/mcp/mcp-call.service.js", () => ({
  McpCallService: vi.fn().mockImplementation(function () {
    return mocks.service;
  }),
}));

vi.mock("../../../modules/mcp/tools/generic-tools.js", () => ({
  listGenericToolDefs: () => mocks.toolDefs,
}));

vi.mock("../../../modules/auth/rbac.middleware.js", () => ({
  PERMISSION_DECLARED: mocks.PERMISSION_DECLARED_TEST,
  rbacHandler: () => {
    const h: any = (req: any, _res: any, next: any) => {
      req.user = { id: "user-1", permissions: new Set(["*"]), isAdmin: true };
      req.rawAccessToken = "tok-1";
      next();
    };
    h[mocks.PERMISSION_DECLARED_TEST] = { declared: ["test.perm"] };
    return h;
  },
}));

import { mcpCallRouter } from "../mcp-call.router.js";
import { mountRouter, type TestApp } from "./harness.js";

let app: TestApp;
beforeAll(async () => {
  app = await mountRouter(mcpCallRouter());
});
afterAll(() => app.close());

const BASE = "/api/v1/system/mcp";

describe("mcp-call router — tools catalog", () => {
  it("GET /tools returns the generic tool defs", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/tools`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tools).toEqual(mocks.toolDefs);
  });
});

describe("mcp-call router — POST /call", () => {
  it("missing tool → 400 (zod body schema)", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ args: {} }),
    });
    expect(res.status).toBe(400);
    expect(mocks.service.call).not.toHaveBeenCalled();
  });

  it("empty tool string → 400", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: "" }),
    });
    expect(res.status).toBe(400);
    expect(mocks.service.call).not.toHaveBeenCalled();
  });

  it("valid call → service(user, token, tool, args), ok result → 200", async () => {
    mocks.service.call.mockResolvedValue({ ok: true, result: { uuid: "e-1" }, status: 200 });
    const res = await fetch(`${app.baseUrl}${BASE}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: "list_entities", args: { module: "auth", entity: "user" } }),
    });
    expect(res.status).toBe(200);
    expect(mocks.service.call).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      "tok-1",
      "list_entities",
      { module: "auth", entity: "user" },
    );
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.result).toEqual({ uuid: "e-1" });
  });

  it("args omitted → service receives {}", async () => {
    mocks.service.call.mockResolvedValue({ ok: true, result: "done", status: 200 });
    await fetch(`${app.baseUrl}${BASE}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: "list_available_entities" }),
    });
    expect(mocks.service.call).toHaveBeenCalledWith(
      expect.anything(),
      "tok-1",
      "list_available_entities",
      {},
    );
  });

  it("RBAC denial from the tool → status passthrough (403)", async () => {
    mocks.service.call.mockResolvedValue({ ok: false, error: "Permission denied", status: 403 });
    const res = await fetch(`${app.baseUrl}${BASE}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: "delete_entity", args: { module: "auth", entity: "user", uuid: "u" } }),
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Permission denied");
  });

  it("unknown tool → status passthrough (404)", async () => {
    mocks.service.call.mockResolvedValue({ ok: false, error: "Unknown tool", status: 404 });
    const res = await fetch(`${app.baseUrl}${BASE}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: "not_a_tool" }),
    });
    expect(res.status).toBe(404);
  });
});
