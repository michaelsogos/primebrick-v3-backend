/**
 * HTTP-level tests for `controllers/http/auth/role-mappings.router.ts` —
 * the hard-delete-only entity. Verifies the purge contract: soft DELETE
 * absent (404), DELETE /:uuid/purge wired to the Casdoor-synced service
 * with caller-observed version + actor, and the mandatory chain intact.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  PERMISSION_DECLARED_TEST: Symbol.for("primebrick.permission_declared"),
  service: {
    listRoleMappings: vi.fn(),
    getRoleByUuid: vi.fn(),
    createRole: vi.fn(),
    updateRoleByUuid: vi.fn(),
    deleteRoleByUuid: vi.fn(),
    getRoleAudit: vi.fn(),
    invalidateCache: vi.fn(),
  },
  mfaStepUp: vi.fn((_op: string, _entity: string) => (_req: any, _res: any, next: any) => next()),
}));

vi.mock("../../../modules/auth/services/role.service.js", () => ({
  RoleService: vi.fn().mockImplementation(function () {
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

vi.mock("../../../modules/auth/mfa-step-up.middleware.js", () => ({
  requireMfaStepUp: mocks.mfaStepUp,
}));

vi.mock("../../../db/pool.js", () => ({ getPool: vi.fn(() => ({})) }));

vi.mock("../../../http/meta-assembler.js", () => ({ assembleMeta: () => ({ meta: true }) }));
// entity-actions is REAL: meta.actions must reflect the registered routes.

// Real requireVersionQuery / assertTranslationsPermission; stub the pool tx.
vi.mock("../../../http/entity-write.js", async (importOriginal) => {
  const orig = await importOriginal<typeof import("../../../http/entity-write.js")>();
  return {
    ...orig,
    runEntityWrite: async (
      _pool: unknown,
      _t: unknown,
      fn: (tx: unknown) => Promise<unknown>,
      afterWrite?: () => void | Promise<void>,
    ) => {
      const r = await fn({});
      await afterWrite?.();
      return r;
    },
  };
});

import { roleMappingsRouter } from "../auth/role-mappings.router.js";
import { mountRouter, type TestApp } from "./harness.js";

let app: TestApp;
beforeAll(async () => {
  app = await mountRouter(roleMappingsRouter());
});
afterAll(() => app.close());

const BASE = "/api/v1/entities/role_mapping";
const UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("role-mappings router — hard delete (purge)", () => {
  it("DELETE /:uuid → 404 (no soft-delete route)", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}?version=3`, { method: "DELETE" });
    expect(res.status).toBe(404);
    expect(mocks.service.deleteRoleByUuid).not.toHaveBeenCalled();
  });

  it("DELETE /:uuid/purge without ?version → 400 VERSION_REQUIRED", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}/purge`, { method: "DELETE" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.internal_code).toBe("VERSION_REQUIRED");
    expect(mocks.service.deleteRoleByUuid).not.toHaveBeenCalled();
  });

  it("DELETE /:uuid/purge?version=5 → deleteRoleByUuid(uuid, actor, 5), entity returned", async () => {
    mocks.service.deleteRoleByUuid.mockResolvedValue({ uuid: UUID, idp_role: "sales" });
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}/purge?version=5`, { method: "DELETE" });
    expect(res.status).toBe(200);
    expect(mocks.service.deleteRoleByUuid).toHaveBeenCalledWith(UUID, "user-1", 5);
    const body = await res.json();
    expect(body.idp_role).toBe("sales");
  });

  it("purge is MFA step-up gated (middleware registered)", () => {
    expect(mocks.mfaStepUp).toHaveBeenCalledWith("delete", "role_mapping");
  });

  it("meta.actions advertises purge.single enabled and delete.single disabled", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/meta`);
    const body = await res.json();
    const byOp = Object.fromEntries(
      (body.actions as { op: string; enabled: boolean }[]).map((a) => [a.op, a.enabled]),
    );
    expect(byOp["purge.single"]).toBe(true);
    expect(byOp["delete.single"]).toBe(false);
    expect(byOp["restore.single"]).toBe(false);
  });
});

describe("role-mappings router — overridden write bodies keep the chain", () => {
  it("PUT /:uuid with immutable idp_role → 400 (body schema still enforced)", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: { idp_role: "x", version: 1 } }),
    });
    expect(res.status).toBe(400);
    expect(mocks.service.updateRoleByUuid).not.toHaveBeenCalled();
  });

  it("PUT /:uuid with non-uuid param → 400", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/nope`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: { version: 1 } }),
    });
    expect(res.status).toBe(400);
  });

  it("PUT /:uuid valid → updateRoleByUuid(uuid, entity, actor, tx) + invalidateCache", async () => {
    mocks.service.updateRoleByUuid.mockResolvedValue({ uuid: UUID });
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: { label_key: "l", version: 2 } }),
    });
    expect(res.status).toBe(200);
    expect(mocks.service.updateRoleByUuid).toHaveBeenCalledWith(
      UUID,
      { label_key: "l", version: 2 },
      "user-1",
      {},
    );
    expect(mocks.service.invalidateCache).toHaveBeenCalled();
  });

  it("POST / valid → createRole(entity, actor, tx) → 201 entity", async () => {
    mocks.service.createRole.mockResolvedValue({ uuid: "new-1" });
    const res = await fetch(`${app.baseUrl}${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: { idp_role: "sales", idp_org: "primebrick", permissions: ["auth.user_read_all"] },
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.uuid).toBe("new-1");
    expect(body.success).toBeUndefined();
  });
});
