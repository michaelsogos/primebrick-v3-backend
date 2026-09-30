/**
 * entity-router factory contract tests — a synthetic entity mounted three
 * ways (soft-only / hard-only / both) on a real Express app with real
 * routing, real `requireVersionQuery` and real `deriveEntityActions`.
 * Domain deps (rbac, pool, meta assembly, service) are mocked — nothing
 * touches a real database.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import type { IRouter } from "express";

const mocks = vi.hoisted(() => ({
  PERMISSION_DECLARED_TEST: Symbol.for("primebrick.permission_declared"),
}));

vi.mock("../../modules/auth/rbac.middleware.js", () => ({
  PERMISSION_DECLARED: mocks.PERMISSION_DECLARED_TEST,
  rbacHandler: (perms: unknown[]) => {
    const declared = Array.isArray(perms) ? (perms as string[]) : [];
    const h: any = (req: any, _res: any, next: any) => {
      req.user = { id: "user-1", permissions: new Set(["*"]), isAdmin: true };
      next();
    };
    h[mocks.PERMISSION_DECLARED_TEST] = { declared };
    return h;
  },
}));

vi.mock("../../modules/auth/mfa-step-up.middleware.js", () => ({
  requireMfaStepUp: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock("../../db/pool.js", () => ({ getPool: vi.fn(() => ({})) }));

vi.mock("../meta-assembler.js", () => ({ assembleMeta: () => ({ meta: true }) }));

// Keep requireVersionQuery / assertTranslationsPermission REAL — they are the
// contract under test. Only runEntityWrite is stubbed (no real pool).
vi.mock("../entity-write.js", async (importOriginal) => {
  const orig = await importOriginal<typeof import("../entity-write.js")>();
  return {
    ...orig,
    runEntityWrite: async (
      _pool: unknown,
      _translations: unknown,
      fn: (tx: unknown) => Promise<unknown>,
      afterWrite?: () => void | Promise<void>,
    ) => {
      const result = await fn({});
      await afterWrite?.();
      return result;
    },
  };
});

import { makeEntityRouter } from "../entity-router.js";
import { mountRouter, type TestApp } from "../../controllers/http/__tests__/harness.js";
import { Permission } from "@primebrick/sdk";

class TestEntity {}
const testMeta = { columns: [] } as never;

const UUID = "123e4567-e89b-42d3-a456-426614174000";

function makeService() {
  return {
    list: vi.fn().mockResolvedValue({ rows: [] }),
    get: vi.fn().mockResolvedValue({ uuid: UUID, version: 3 }),
    create: vi.fn().mockResolvedValue({ uuid: "new-uuid", version: 1 }),
    update: vi.fn().mockResolvedValue({ uuid: UUID, version: 4 }),
    delete: vi.fn().mockResolvedValue({ uuid: UUID, deleted: true }),
    purge: vi.fn().mockResolvedValue({ uuid: UUID, purged: true }),
    restore: vi.fn().mockResolvedValue({ uuid: UUID, restored: true }),
    audit: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
  };
}
type Service = ReturnType<typeof makeService>;

function buildRouter<S extends object>(service: S, over?: {
  permissions?: Parameters<typeof makeEntityRouter>[0]["permissions"];
  methods?: Partial<Record<import("../entity-router.js").EntityAction, keyof S & string>>;
  handlers?: Parameters<typeof makeEntityRouter>[0]["handlers"];
}): IRouter {
  return makeEntityRouter({
    entityName: "test_entity",
    entity: TestEntity,
    meta: testMeta,
    service,
    permissions: {
      meta: [Permission.ROLE_MAPPING_READ_ALL],
      list: [Permission.ROLE_MAPPING_READ_ALL],
      get: [Permission.ROLE_MAPPING_READ_SINGLE],
      create: [Permission.ROLE_MAPPING_CREATE_SINGLE],
      update: [Permission.ROLE_MAPPING_UPDATE_SINGLE],
      audit: [Permission.ROLE_MAPPING_READ_AUDIT],
      ...over?.permissions,
    },
    schemas: {
      createBody: undefined,
      updateBody: undefined,
    },
    methods: over?.methods,
    handlers: over?.handlers,
  });
}

const BASE = "/api/v1/entities/test_entity";

describe("makeEntityRouter — soft-delete-only entity", () => {
  const service = makeService();
  let app: TestApp;
  beforeAll(async () => {
    app = await mountRouter(
      buildRouter(service, {
        permissions: {
          delete: [Permission.ROLE_MAPPING_DELETE_SINGLE],
          restore: [Permission.ROLE_MAPPING_UPDATE_SINGLE],
        },
      }),
    );
  });
  afterAll(() => app.close());

  it("DELETE /:uuid without ?version → 400 VERSION_REQUIRED", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}`, { method: "DELETE" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.internal_code).toBe("VERSION_REQUIRED");
    expect(service.delete).not.toHaveBeenCalled();
  });

  it("DELETE /:uuid?version=abc → 400", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}?version=abc`, { method: "DELETE" });
    expect(res.status).toBe(400);
  });

  it("DELETE /:uuid?version=3 → service.delete(uuid, 3), entity returned", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}?version=3`, { method: "DELETE" });
    expect(res.status).toBe(200);
    expect(service.delete).toHaveBeenCalledWith(UUID, 3);
    const body = await res.json();
    expect(body.deleted).toBe(true);
  });

  it("DELETE /:uuid/purge → 404 (hard delete not declared)", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}/purge`, { method: "DELETE" });
    expect(res.status).toBe(404);
  });

  it("POST /:uuid/restore without ?version → 400", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}/restore`, { method: "POST" });
    expect(res.status).toBe(400);
    expect(service.restore).not.toHaveBeenCalled();
  });

  it("POST /:uuid/restore?version=3 → service.restore(uuid, 3)", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}/restore?version=3`, { method: "POST" });
    expect(res.status).toBe(200);
    expect(service.restore).toHaveBeenCalledWith(UUID, 3);
  });

  it("meta.actions exposes delete.single enabled, purge.single disabled", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/meta`);
    const body = await res.json();
    const byOp = Object.fromEntries(
      (body.actions as { op: string; enabled: boolean }[]).map((a) => [a.op, a.enabled]),
    );
    expect(byOp["delete.single"]).toBe(true);
    expect(byOp["purge.single"]).toBe(false);
    expect(byOp["restore.single"]).toBe(true);
  });
});

describe("makeEntityRouter — hard-delete-only entity", () => {
  const service = makeService();
  let app: TestApp;
  beforeAll(async () => {
    app = await mountRouter(
      buildRouter(service, {
        permissions: { purge: [Permission.ROLE_MAPPING_DELETE_SINGLE] },
      }),
    );
  });
  afterAll(() => app.close());

  it("DELETE /:uuid → 404 (soft route never registered)", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}?version=3`, { method: "DELETE" });
    expect(res.status).toBe(404);
    expect(service.delete).not.toHaveBeenCalled();
  });

  it("DELETE /:uuid/purge without ?version → 400 VERSION_REQUIRED", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}/purge`, { method: "DELETE" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.internal_code).toBe("VERSION_REQUIRED");
    expect(service.purge).not.toHaveBeenCalled();
  });

  it("DELETE /:uuid/purge?version=3 → service.purge(uuid, 3), entity returned", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}/purge?version=3`, { method: "DELETE" });
    expect(res.status).toBe(200);
    expect(service.purge).toHaveBeenCalledWith(UUID, 3);
    const body = await res.json();
    expect(body.purged).toBe(true);
  });

  it("POST /:uuid/restore → 404 (no soft lifecycle)", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}/restore?version=3`, { method: "POST" });
    expect(res.status).toBe(404);
  });

  it("meta.actions: purge.single enabled, delete.single + restore.single disabled", async () => {
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

describe("makeEntityRouter — both delete modes", () => {
  const service = makeService();
  let app: TestApp;
  beforeAll(async () => {
    app = await mountRouter(
      buildRouter(service, {
        permissions: {
          delete: [Permission.ROLE_MAPPING_DELETE_SINGLE],
          purge: [Permission.ROLE_MAPPING_DELETE_SINGLE],
        },
      }),
    );
  });
  afterAll(() => app.close());

  it("both DELETE /:uuid and DELETE /:uuid/purge are live", async () => {
    const soft = await fetch(`${app.baseUrl}${BASE}/${UUID}?version=1`, { method: "DELETE" });
    const hard = await fetch(`${app.baseUrl}${BASE}/${UUID}/purge?version=1`, { method: "DELETE" });
    expect(soft.status).toBe(200);
    expect(hard.status).toBe(200);
    expect(service.delete).toHaveBeenCalledTimes(1);
    expect(service.purge).toHaveBeenCalledTimes(1);
  });
});

describe("makeEntityRouter — mandatory chain + overrides", () => {
  const service = makeService();
  const customDelete = vi.fn((_req: any, res: any) => {
    res.json({ custom: true });
  });
  const customPurge = vi.fn((_req: any, res: any) => {
    res.json({ customPurge: true });
  });
  let app: TestApp;
  beforeAll(async () => {
    app = await mountRouter(
      buildRouter(service, {
        permissions: {
          delete: [Permission.ROLE_MAPPING_DELETE_SINGLE],
          purge: [Permission.ROLE_MAPPING_DELETE_SINGLE],
        },
        handlers: { delete: customDelete, purge: customPurge },
      }),
    );
  });
  afterAll(() => app.close());

  it("handler override replaces the body, chain still applies (bad uuid → 400)", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/not-a-uuid/purge?version=1`, { method: "DELETE" });
    expect(res.status).toBe(400);
    expect(customPurge).not.toHaveBeenCalled();
  });

  it("handler override is invoked for a valid request", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}/purge?version=9`, { method: "DELETE" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.customPurge).toBe(true);
    expect(service.purge).not.toHaveBeenCalled();
  });

  it("methods map: service method name override is honored", async () => {
    const svc = { ...service, customGet: vi.fn().mockResolvedValue({ uuid: UUID }) };
    const app2 = await mountRouter(
      buildRouter(svc, { methods: { get: "customGet" } }),
    );
    try {
      const res = await fetch(`${app2.baseUrl}${BASE}/${UUID}`);
      expect(res.status).toBe(200);
      expect(svc.customGet).toHaveBeenCalledWith(UUID);
    } finally {
      await app2.close();
    }
  });
});

describe("makeEntityRouter — write contract", () => {
  const service = makeService();
  const afterWrite = vi.fn();
  let app: TestApp;
  beforeAll(async () => {
    const router = makeEntityRouter({
      entityName: "test_entity",
      entity: TestEntity,
      meta: testMeta,
      service,
      permissions: {
        meta: [Permission.ROLE_MAPPING_READ_ALL],
        list: [Permission.ROLE_MAPPING_READ_ALL],
        get: [Permission.ROLE_MAPPING_READ_SINGLE],
        create: [Permission.ROLE_MAPPING_CREATE_SINGLE],
        update: [Permission.ROLE_MAPPING_UPDATE_SINGLE],
      },
      schemas: {},
      hooks: { afterWrite },
    });
    app = await mountRouter(router);
  });
  afterAll(() => app.close());

  it("POST / → 201 + entity body + afterWrite hook", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: { name: "x" } }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.uuid).toBe("new-uuid");
    expect(body.success).toBeUndefined(); // no success:true wrapper
    expect(service.create).toHaveBeenCalledWith({ name: "x" }, {});
    expect(afterWrite).toHaveBeenCalled();
  });

  it("PUT /:uuid → 200 + entity body (RETURNING), no wrapper", async () => {
    const res = await fetch(`${app.baseUrl}${BASE}/${UUID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: { name: "y" } }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.version).toBe(4);
    expect(service.update).toHaveBeenCalledWith(UUID, { name: "y" }, {});
  });
});
