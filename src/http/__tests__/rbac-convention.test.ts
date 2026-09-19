/**
 * RBAC convention audit tests.
 *
 * Enforces the entity-permission contract:
 *
 *  1. Catalog grammar — every non-sentinel `Permission` value matches the
 *     closed grammar `{scope}.{action}.{qualifier}` where the qualifier set
 *     depends on the operation class:
 *       ROPs: read.{single|all|audit}, export (qualifier-free)
 *       WOPs: {create|update|delete|restore|duplicate}.{single|bulk}
 *
 *  2. Singular scopes — scopes name the entity OBJECT, never the collection.
 *     Plural/legacy scopes are rejected.
 *
 *  3. Const naming — `CONST = string.toUpperCase().replaceAll('.', '_')`.
 *
 *  4. `deriveEntityActions` — route table → `actions` capability map:
 *     canonical ops, verbatim permission OR-groups, sentinel separation,
 *     `actions_overrides` may only toggle `enabled`.
 */

import { describe, it, expect } from "vitest";
import { Router } from "express";
import { Permission, isPermissionSentinel } from "@primebrick/sdk";
import { PERMISSION_DECLARED } from "../../modules/auth/rbac.middleware.js";
import { deriveEntityActions } from "../entity-actions.js";

// ─── Grammar tables ─────────────────────────────────────────────────────────

const ROP_SUFFIXES = new Set(["read.single", "read.all", "read.audit", "export"]);
const WOP_ACTIONS = new Set(["create", "update", "delete", "restore", "duplicate"]);
const WOP_QUALIFIERS = new Set(["single", "bulk"]);

/** Plural / legacy scopes that must never reappear in the catalog. */
const BANNED_SCOPES = new Set([
  "users",
  "userprofile",
  "customers",
  "organizations",
  "role_mappings",
  "auth_events",
  "emailsender.providers",
  "profile",
  "translations",
]);

function catalogEntries(): [string, string][] {
  return Object.entries(Permission) as [string, string][];
}

// ─── 1–3. Catalog grammar ───────────────────────────────────────────────────

describe("permission catalog grammar", () => {
  it("every non-sentinel permission matches the closed ROP/WOP grammar", () => {
    for (const [name, value] of catalogEntries()) {
      if (isPermissionSentinel(value)) continue;

      // `export` is a single-segment suffix; all other entity ops are two
      // (`{action}.{qualifier}`). Scopes may be multi-segment.
      const segs = value.split(".");
      const last = segs[segs.length - 1];
      const RESERVED = new Set(["read", "create", "update", "delete", "restore", "duplicate", "export"]);
      if (segs.length === 2 && !RESERVED.has(last)) {
        // Service-action permission `{scope}.{verb}` (e.g. emailsender.send) —
        // legal only because the verb is not a reserved entity op.
        const actionScope = segs[0];
        expect(actionScope, `${name}: empty scope`).toMatch(
          /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/
        );
        continue;
      }
      const isExport = last === "export";
      const scope = segs.slice(0, isExport ? -1 : -2).join(".");
      const tail = segs.slice(isExport ? -1 : -2).join(".");

      expect(scope, `${name}: empty scope`).toBeTruthy();
      // Scope may be multi-segment (modules.config, emailsender.provider) —
      // each segment lowercase snake_case.
      expect(scope, `${name}: scope must be lowercase snake_case`).toMatch(
        /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/
      );

      if (tail === "export") continue; // qualifier-free ROP
      const [action, qualifier] = tail.split(".");
      if (action === "read") {
        expect(
          ROP_SUFFIXES.has(tail),
          `${name} (${value}): invalid ROP suffix — allowed: read.single, read.all, read.audit, export`
        ).toBe(true);
      } else {
        expect(
          WOP_ACTIONS.has(action) && WOP_QUALIFIERS.has(qualifier),
          `${name} (${value}): invalid WOP — allowed: {create|update|delete|restore|duplicate}.{single|bulk}`
        ).toBe(true);
      }
    }
  });

  it("scope is the singular entity object — banned plural/legacy scopes absent", () => {
    for (const [name, value] of catalogEntries()) {
      if (isPermissionSentinel(value)) continue;
      const scope = value.split(".").slice(0, -2).join(".");
      expect(
        BANNED_SCOPES.has(scope),
        `${name} (${value}): scope "${scope}" is a banned plural/legacy form`
      ).toBe(false);
    }
  });

  it("const name is the mechanical upper-snake of the permission string", () => {
    for (const [name, value] of catalogEntries()) {
      if (isPermissionSentinel(value)) continue;
      expect(name, `${name} ≠ ${value}`).toBe(
        value.toUpperCase().replaceAll(".", "_")
      );
    }
  });

  it("no structurally well-formed but grammatically invalid combos exist", () => {
    const values = new Set(catalogEntries().map(([, v]) => v));
    for (const v of values) {
      expect(v.endsWith(".read.bulk"), v).toBe(false);
      expect(v.endsWith(".create.all"), v).toBe(false);
      expect(v.endsWith(".export.single"), v).toBe(false);
      expect(v.endsWith(".export.bulk"), v).toBe(false);
    }
  });
});

// ─── 4. deriveEntityActions ─────────────────────────────────────────────────

function declaredHandler(declared: string[]) {
  const h = (_req: unknown, _res: unknown, next: () => void) => next();
  Object.defineProperty(h, PERMISSION_DECLARED, { value: { declared } });
  return h;
}

describe("deriveEntityActions", () => {
  it("maps canonical routes to canonical ops with verbatim OR-groups", () => {
    const router = Router();
    const E = "/api/v1/entities/customer";
    router.get(`${E}/list`, declaredHandler([Permission.CUSTOMER_READ_ALL]));
    router.get(`${E}/meta`, declaredHandler([Permission.CUSTOMER_READ_ALL]));
    router.get(`${E}/:uuid`, declaredHandler([Permission.CUSTOMER_READ_SINGLE, Permission.CUSTOMER_READ_ALL]));
    router.post(E, declaredHandler([Permission.CUSTOMER_CREATE_SINGLE]));
    router.put(`${E}/:uuid`, declaredHandler([Permission.CUSTOMER_UPDATE_SINGLE]));
    router.delete(`${E}/:uuid`, declaredHandler([Permission.CUSTOMER_DELETE_SINGLE]));
    router.post(`${E}/:uuid/restore`, declaredHandler([Permission.CUSTOMER_RESTORE_SINGLE]));
    router.get(`${E}/:uuid/audit`, declaredHandler([Permission.CUSTOMER_READ_AUDIT]));
    router.get(`${E}/export`, declaredHandler([Permission.CUSTOMER_EXPORT]));
    router.post(`${E}/bulk-delete`, declaredHandler([Permission.CUSTOMER_DELETE_BULK]));
    router.post(`${E}/bulk-restore`, declaredHandler([Permission.CUSTOMER_RESTORE_BULK]));
    router.post(`${E}/duplicate`, declaredHandler([Permission.CUSTOMER_DUPLICATE_BULK]));

    const actions = deriveEntityActions(router, "customer");
    const byOp = new Map(actions.map((a) => [a.op, a]));

    expect(byOp.get("list")?.permissions).toEqual([Permission.CUSTOMER_READ_ALL]);
    expect(byOp.get("get")?.permissions).toEqual([
      Permission.CUSTOMER_READ_SINGLE,
      Permission.CUSTOMER_READ_ALL,
    ]);
    expect(byOp.get("create.single")?.permissions).toEqual([Permission.CUSTOMER_CREATE_SINGLE]);
    expect(byOp.get("update.single")?.permissions).toEqual([Permission.CUSTOMER_UPDATE_SINGLE]);
    expect(byOp.get("delete.single")?.permissions).toEqual([Permission.CUSTOMER_DELETE_SINGLE]);
    expect(byOp.get("restore.single")?.permissions).toEqual([Permission.CUSTOMER_RESTORE_SINGLE]);
    expect(byOp.get("read.audit")?.permissions).toEqual([Permission.CUSTOMER_READ_AUDIT]);
    expect(byOp.get("export")?.permissions).toEqual([Permission.CUSTOMER_EXPORT]);
    expect(byOp.get("delete.bulk")?.permissions).toEqual([Permission.CUSTOMER_DELETE_BULK]);
    expect(byOp.get("restore.bulk")?.permissions).toEqual([Permission.CUSTOMER_RESTORE_BULK]);
    expect(byOp.get("duplicate.bulk")?.permissions).toEqual([Permission.CUSTOMER_DUPLICATE_BULK]);
    for (const a of actions) expect(a.enabled).toBe(true);
  });

  it("op absent when the route is not registered (capability axis)", () => {
    const router = Router();
    router.get("/api/v1/entities/organization/list", declaredHandler([Permission.ORGANIZATION_READ_ALL]));
    const actions = deriveEntityActions(router, "organization");
    expect(actions.find((a) => a.op === "delete.bulk")).toBeUndefined();
  });

  it("routes without PERMISSION_DECLARED are not actions (default-deny)", () => {
    const router = Router();
    router.get("/api/v1/entities/customer/secret", (_req, _res, next) => (next as () => void)());
    const actions = deriveEntityActions(router, "customer");
    expect(actions).toEqual([]);
  });

  it("sentinels are separated from concrete permissions", () => {
    const router = Router();
    router.get(
      "/api/v1/entities/customer/list",
      declaredHandler([Permission.AUTHENTICATED_USER, Permission.CUSTOMER_READ_ALL])
    );
    const [action] = deriveEntityActions(router, "customer");
    expect(action.sentinel).toBe(Permission.AUTHENTICATED_USER);
    expect(action.permissions).toEqual([Permission.CUSTOMER_READ_ALL]);
  });

  it("actions_overrides can only toggle enabled — never invent ops", () => {
    const router = Router();
    router.get("/api/v1/entities/customer/list", declaredHandler([Permission.CUSTOMER_READ_ALL]));
    const actions = deriveEntityActions(router, "customer", {
      list: { enabled: false },
      "delete.bulk": { enabled: false }, // non-existent op → no effect
    });
    expect(actions).toHaveLength(1);
    expect(actions[0].enabled).toBe(false);
  });

  it("non-standard routes surface their last segment as the op", () => {
    const router = Router();
    router.post(
      "/api/v1/entities/organization/check-availability",
      declaredHandler([Permission.AUTHENTICATED_USER])
    );
    const actions = deriveEntityActions(router, "organization");
    expect(actions[0].op).toBe("check-availability");
  });

  it("only routes under the given entity prefix are collected", () => {
    const router = Router();
    router.get("/api/v1/entities/customer/list", declaredHandler([Permission.CUSTOMER_READ_ALL]));
    router.get("/api/v1/entities/organization/list", declaredHandler([Permission.ORGANIZATION_READ_ALL]));
    const actions = deriveEntityActions(router, "customer");
    expect(actions).toHaveLength(1);
    expect(actions[0].op).toBe("list");
  });
});
