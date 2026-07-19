import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// Mock @primebrick/sdk — getAuthConfig returns STANDALONE mode (no gateway check)
vi.mock("@primebrick/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@primebrick/sdk")>();
  return {
    ...actual,
    getAuthConfig: vi.fn().mockResolvedValue({
      ...actual.AuthMode,
      mode: "STANDALONE",
      roles_path: "roles",
      oidc: {},
      gateway: {},
      enable_webauthn: true,
      enable_formauth: true,
      enable_email_verification_check: false,
      passkey_required: false,
    }),
  };
});

// Mock authMiddleware — we control req.user directly in each test
vi.mock("../auth.middleware.js", () => ({
  authMiddleware: () => (req: any, _res: any, next: any) => next(),
  initAuthPorts: vi.fn(),
  loadRoleMappings: vi.fn().mockResolvedValue(undefined),
  clearRoleMappingCache: vi.fn(),
  getAuthPorts: vi.fn().mockReturnValue(null),
}));

// Import after mocks
import { Permission } from "@primebrick/sdk";
import { rbacHandler } from "../rbac.middleware.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeReq(user: any): Request {
  return { user, headers: {}, cookies: {} } as unknown as Request;
}

function makeRes(): Response & { statusCode: number; body: any } {
  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) { this.statusCode = code; return this; },
    json(data: any) { this.body = data; return this; },
  };
  return res;
}

function invoke(handler: any, req: Request, res: Response): Promise<{ status: number; body: any; nextError: any }> {
  return new Promise((resolve) => {
    const next: NextFunction = ((err?: any) => {
      resolve({ status: res.statusCode, body: (res as any).body, nextError: err });
    }) as any;
    handler(req, res, next);
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("rbacHandler([AUTHENTICATED_ADMIN]) — admin-only gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const handler = rbacHandler([Permission.AUTHENTICATED_ADMIN]);

  it("allows an admin user (isAdmin: true)", async () => {
    const req = makeReq({ id: "u1", isAdmin: true, isSystem: false, roles: ["administrators"], permissions: new Set() });
    const res = makeRes();
    const result = await invoke(handler, req, res);
    expect(result.nextError).toBeUndefined();
    expect(result.status).toBe(200);
  });

  it("denies a non-admin user (isAdmin: false) with 401", async () => {
    const req = makeReq({ id: "u2", isAdmin: false, isSystem: false, roles: ["collaborator"], permissions: new Set(["users.update.single"]) });
    const res = makeRes();
    const result = await invoke(handler, req, res);
    expect(result.nextError).toBeDefined();
    // The error is an UnauthorizedError (403 in HTTP, but passed via next(err))
    expect(result.nextError.message).toContain("Admin privileges required");
  });

  it("denies a non-admin user who holds USERS_UPDATE_SINGLE (the old permission)", async () => {
    // This is the key security test: a non-admin with the OLD CRUD permission
    // must NOT pass the admin-only gate.
    const req = makeReq({ id: "u3", isAdmin: false, isSystem: false, roles: ["custom"], permissions: new Set(["users.update.single"]) });
    const res = makeRes();
    const result = await invoke(handler, req, res);
    expect(result.nextError).toBeDefined();
  });

  it("allows a system API key (isSystem: true)", async () => {
    const req = makeReq({ id: "system", isAdmin: false, isSystem: true, roles: [], permissions: new Set() });
    const res = makeRes();
    const result = await invoke(handler, req, res);
    expect(result.nextError).toBeUndefined();
  });
});
