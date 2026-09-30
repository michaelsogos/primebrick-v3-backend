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
