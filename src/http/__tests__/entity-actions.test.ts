/**
 * entity-actions — routeToOp mapping + STANDARD_OPS vocabulary tests.
 * Uses a real Express router so `router.stack` scanning is exercised for
 * real, with a stubbed PERMISSION_DECLARED marker like production
 * `rbacHandler` injects.
 */
import { describe, it, expect } from "vitest";
import express from "express";

import { deriveEntityActions, STANDARD_OPS } from "../entity-actions.js";
import { PERMISSION_DECLARED } from "../../modules/auth/rbac.middleware.js";

const ENTITY = "test_entity";
const PREFIX = `/api/v1/entities/${ENTITY}`;

function declared(perms: string[]) {
  const h: any = (_req: any, _res: any, next: any) => next();
  h[PERMISSION_DECLARED] = { declared: perms };
  return h;
}

function routerWith(registrations: (r: ReturnType<typeof express.Router>) => void) {
  const r = express.Router();
  registrations(r);
  return r;
}

describe("deriveEntityActions — op mapping", () => {
  it("DELETE /:uuid → delete.single, DELETE /:uuid/purge → purge.single", () => {
    const router = routerWith((r) => {
      r.delete(`${PREFIX}/:uuid`, declared(["x.delete_single"]));
      r.delete(`${PREFIX}/:uuid/purge`, declared(["x.hard_delete"]));
    });
    const actions = deriveEntityActions(router, ENTITY);
    const byOp = Object.fromEntries(actions.map((a) => [a.op, a]));

    expect(byOp["delete.single"].enabled).toBe(true);
    expect(byOp["delete.single"].permissions).toEqual(["x.delete_single"]);
    expect(byOp["purge.single"].enabled).toBe(true);
    expect(byOp["purge.single"].permissions).toEqual(["x.hard_delete"]);
  });

  it("hard-delete-only entity: purge.single enabled, delete.single disabled", () => {
    const router = routerWith((r) => {
      r.delete(`${PREFIX}/:uuid/purge`, declared(["x.delete_single"]));
    });
    const actions = deriveEntityActions(router, ENTITY);
    const byOp = Object.fromEntries(actions.map((a) => [a.op, a]));

    expect(byOp["purge.single"]).toMatchObject({ enabled: true, permissions: ["x.delete_single"] });
    expect(byOp["delete.single"]).toMatchObject({ enabled: false, permissions: [] });
  });

  it("every standard op is emitted even when no route exists", () => {
    const router = routerWith(() => {});
    const actions = deriveEntityActions(router, ENTITY);
    const ops = new Set(actions.map((a) => a.op));
    for (const op of STANDARD_OPS) {
      expect(ops.has(op)).toBe(true);
    }
    expect(actions.every((a) => a.enabled === false)).toBe(true);
  });

  it("actions_overrides can only disable, never invent", () => {
    const router = routerWith((r) => {
      r.delete(`${PREFIX}/:uuid`, declared(["x.delete_single"]));
    });
    const actions = deriveEntityActions(router, ENTITY, { "delete.single": { enabled: false } });
    const byOp = Object.fromEntries(actions.map((a) => [a.op, a]));
    expect(byOp["delete.single"].enabled).toBe(false);
  });
});

describe("deriveEntityActions — endpoint emission", () => {
  it("every enabled op carries {method, path} of its backing route", () => {
    const router = routerWith((r) => {
      r.delete(`${PREFIX}/:uuid`, declared(["x.delete_single"]));
      r.post(`${PREFIX}/:uuid/restore`, declared(["x.restore_single"]));
      r.get(`${PREFIX}/list`, declared(["x.read_all"]));
    });
    const byOp = Object.fromEntries(deriveEntityActions(router, ENTITY).map((a) => [a.op, a]));

    expect(byOp["delete.single"].endpoint).toEqual({ method: "DELETE", path: `${PREFIX}/:uuid` });
    expect(byOp["restore.single"].endpoint).toEqual({ method: "POST", path: `${PREFIX}/:uuid/restore` });
    expect(byOp["list"].endpoint).toEqual({ method: "GET", path: `${PREFIX}/list` });
  });

  it("disabled ops (no route) have no endpoint", () => {
    const router = routerWith(() => {});
    for (const a of deriveEntityActions(router, ENTITY)) {
      expect(a.endpoint).toBeUndefined();
    }
  });

  it("extraScans: non-standard prefix routes emit their real path (user_profile case)", () => {
    const EPREFIX = "/api/v1/entities/user_profile";
    const entityRouter = routerWith((r) => {
      r.get(`${EPREFIX}/meta`, declared(["x.read_all"]));
      r.get(`${EPREFIX}/list`, declared(["x.read_all"]));
      r.get(`${EPREFIX}/:uuid`, declared(["x.read_single"]));
      r.get(`${EPREFIX}/:uuid/audit`, declared(["x.read_audit"]));
    });
    const usersRouter = routerWith((r) => {
      r.post("/api/v1/auth/users", declared(["x.create_single"]));
      r.put("/api/v1/auth/users/:uuid", declared(["x.update_single"]));
      r.delete("/api/v1/auth/users/:uuid", declared(["x.delete_single"]));
      r.post("/api/v1/auth/users/:uuid/restore", declared(["x.restore_single"]));
    });
    const byOp = Object.fromEntries(
      deriveEntityActions(entityRouter, "user_profile", undefined, [
        { router: usersRouter, prefix: "/api/v1/auth/users" },
      ]).map((a) => [a.op, a]),
    );

    // The write ops must point at the auth prefix — NOT /api/v1/entities/...
    expect(byOp["create.single"].endpoint).toEqual({ method: "POST", path: "/api/v1/auth/users" });
    expect(byOp["update.single"].endpoint).toEqual({ method: "PUT", path: "/api/v1/auth/users/:uuid" });
    expect(byOp["delete.single"].endpoint).toEqual({ method: "DELETE", path: "/api/v1/auth/users/:uuid" });
    expect(byOp["restore.single"].endpoint).toEqual({ method: "POST", path: "/api/v1/auth/users/:uuid/restore" });
    expect(byOp["list"].endpoint).toEqual({ method: "GET", path: `${EPREFIX}/list` });
  });
});
