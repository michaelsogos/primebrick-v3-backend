import { describe, it, expect } from "vitest";
import { Permission } from "@primebrick/sdk";
import { rbacHandler } from "../rbac.middleware.js";

describe("rbacHandler — sentinel sanity check", () => {
  it("accepts AUTHENTICATED_ADMIN alone", () => {
    // Building the handler must NOT throw.
    const handler = rbacHandler([Permission.AUTHENTICATED_ADMIN]);
    expect(typeof handler).toBe("function");
  });

  it("rejects AUTHENTICATED_ADMIN combined with USERS_UPDATE_SINGLE", () => {
    // The sanity check runs at handler-build time. Combining a sentinel with
    // a CRUD perm is a bug — expect a throw.
    expect(() =>
      rbacHandler([Permission.AUTHENTICATED_ADMIN, Permission.USERS_UPDATE_SINGLE]),
    ).toThrow();
  });

  it("rejects AUTHENTICATED_USER combined with USERS_UPDATE_SINGLE (existing invariant)", () => {
    // Regression guard: the existing sentinel must still be enforced.
    expect(() =>
      rbacHandler([Permission.AUTHENTICATED_USER, Permission.USERS_UPDATE_SINGLE]),
    ).toThrow();
  });

  it("rejects PUBLIC combined with USERS_UPDATE_SINGLE (existing invariant)", () => {
    expect(() =>
      rbacHandler([Permission.PUBLIC, Permission.USERS_UPDATE_SINGLE]),
    ).toThrow();
  });

  it("accepts a non-sentinel permission alone", () => {
    const handler = rbacHandler([Permission.USERS_UPDATE_SINGLE]);
    expect(typeof handler).toBe("function");
  });

  it("accepts multiple non-sentinel permissions (OR semantics)", () => {
    const handler = rbacHandler([Permission.USERS_READ_ALL, Permission.USERS_READ_SINGLE]);
    expect(typeof handler).toBe("function");
  });
});
