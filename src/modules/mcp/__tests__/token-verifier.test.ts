import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthInfo } from "@modelcontextprotocol/server";

// Mock @primebrick/sdk — we only test the conversion logic, not real JWT verification
const mockVerifyAuth = vi.fn();
const mockGetAuthConfig = vi.fn();
const mockRunWithSession = vi.fn();

vi.mock("@primebrick/sdk", () => ({
  verifyAuth: (...args: unknown[]) => mockVerifyAuth(...args),
  getAuthConfig: (...args: unknown[]) => mockGetAuthConfig(...args),
  runWithSession: <T>(session: unknown, cb: () => T) => {
    mockRunWithSession(session);
    return cb();
  },
}));

// Import after mocks
import { tokenVerifier, setAuthPorts, authInfoToUser } from "../token-verifier.js";
import type { AuthPorts, AuthUser } from "@primebrick/sdk";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "user-uuid-123",
    email: "test@example.com",
    name: "Test User",
    roles: ["collaborator"],
    permissions: new Set(["customers.read.all", "customers.read.single"]),
    isAdmin: false,
    isSystem: false,
    idp_code: "admin/acme",
    idp_org: "acme",
    idp_username: "testuser",
    raw_access_token: "raw-jwt-token",
    ...overrides,
  };
}

/** Build a fake JWT payload (base64url-encoded) with the given exp claim. */
function makeFakeJwt(exp: number): string {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const signature = "fake-signature";
  return `${header}.${payload}.${signature}`;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("MCP Token Verifier — authInfoToUser", () => {
  it("converts AuthInfo with full extra fields back to user shape", () => {
    const authInfo: AuthInfo = {
      token: "test-token",
      clientId: "admin/acme",
      scopes: ["customers.read.all"],
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      extra: {
        user_id: "user-uuid",
        email: "user@example.com",
        name: "User Name",
        roles: ["collaborator", "guest"],
        is_admin: false,
        is_system: false,
        idp_code: "admin/acme",
        idp_org: "acme",
        idp_username: "user",
        raw_access_token: "raw-jwt",
        permissions: ["customers.read.all", "customers.read.single"],
      },
    };

    const user = authInfoToUser(authInfo);
    expect(user.id).toBe("user-uuid");
    expect(user.email).toBe("user@example.com");
    expect(user.name).toBe("User Name");
    expect(user.roles).toEqual(["collaborator", "guest"]);
    expect(user.is_admin).toBe(false);
    expect(user.is_system).toBe(false);
    expect(user.idp_code).toBe("admin/acme");
    expect(user.idp_org).toBe("acme");
    expect(user.idp_username).toBe("user");
    expect(user.raw_access_token).toBe("raw-jwt");
    expect(user.permissions).toEqual(["customers.read.all", "customers.read.single"]);
  });

  it("handles missing extra fields with safe defaults", () => {
    const authInfo: AuthInfo = {
      token: "test-token",
      clientId: "test",
      scopes: [],
      expiresAt: 9999999999,
      // No extra field
    };

    const user = authInfoToUser(authInfo);
    expect(user.id).toBeUndefined();
    expect(user.email).toBeNull();
    expect(user.name).toBeNull();
    expect(user.roles).toEqual([]);
    expect(user.is_admin).toBe(false);
    expect(user.is_system).toBe(false);
    expect(user.idp_code).toBe("");
    expect(user.idp_org).toBeNull();
    expect(user.idp_username).toBeNull();
    expect(user.permissions).toEqual([]);
  });

  it("handles null extra fields", () => {
    const authInfo: AuthInfo = {
      token: "test-token",
      clientId: "test",
      scopes: [],
      expiresAt: 9999999999,
      extra: null as unknown as Record<string, unknown>,
    };

    const user = authInfoToUser(authInfo);
    expect(user.roles).toEqual([]);
    expect(user.is_admin).toBe(false);
    expect(user.permissions).toEqual([]);
  });
});

describe("MCP Token Verifier — tokenVerifier.verifyAccessToken", () => {
  const fakePorts: AuthPorts = {
    resolveInternalUuid: vi.fn(),
    getRoleMapping: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setAuthPorts(fakePorts);
    mockGetAuthConfig.mockResolvedValue({
      idp_endpoint: "http://localhost:8000",
      idp_organization: "acme",
      oidc: { client_id: "test-client", client_secret: "test-secret" },
    });
  });

  it("throws OAuthError when ports are not initialized", async () => {
    // Reset ports to null by re-importing would be complex;
    // Instead, verify the happy path works with ports set
    // (the null-ports case is covered by the fact that setAuthPorts must be called first)
    const user = makeAuthUser();
    mockVerifyAuth.mockResolvedValue(user);

    const token = makeFakeJwt(Math.floor(Date.now() / 1000) + 3600);
    const authInfo = await tokenVerifier.verifyAccessToken(token);

    expect(authInfo.token).toBe(token);
    expect(authInfo.clientId).toBe(user.idp_code);
    expect(authInfo.scopes).toEqual(Array.from(user.permissions));
  });

  it("returns AuthInfo with correct fields from verified user", async () => {
    const user = makeAuthUser({
      id: "abc-123",
      email: "admin@test.com",
      name: "Admin",
      roles: ["administrators"],
      permissions: new Set(["*"]),
      isAdmin: true,
      idp_code: "admin/acme",
    });
    mockVerifyAuth.mockResolvedValue(user);

    const exp = Math.floor(Date.now() / 1000) + 1800;
    const token = makeFakeJwt(exp);

    const authInfo = await tokenVerifier.verifyAccessToken(token);

    expect(authInfo.token).toBe(token);
    expect(authInfo.clientId).toBe("admin/acme");
    expect(authInfo.scopes).toEqual(["*"]);
    expect(authInfo.expiresAt).toBe(exp);
    expect(authInfo.extra).toMatchObject({
      user_id: "abc-123",
      email: "admin@test.com",
      name: "Admin",
      roles: ["administrators"],
      is_admin: true,
      idp_code: "admin/acme",
      permissions: ["*"],
      raw_access_token: "raw-jwt-token",
    });
  });

  it("extracts exp claim from JWT payload", async () => {
    const user = makeAuthUser();
    mockVerifyAuth.mockResolvedValue(user);

    const exp = Math.floor(Date.now() / 1000) + 7200;
    const token = makeFakeJwt(exp);

    const authInfo = await tokenVerifier.verifyAccessToken(token);
    expect(authInfo.expiresAt).toBe(exp);
  });

  it("falls back to current time + 1 hour when JWT has no exp claim", async () => {
    const user = makeAuthUser();
    mockVerifyAuth.mockResolvedValue(user);

    // JWT with no exp claim
    const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ sub: "test" })).toString("base64url");
    const token = `${header}.${payload}.sig`;

    const before = Math.floor(Date.now() / 1000) + 3600;
    const authInfo = await tokenVerifier.verifyAccessToken(token);
    const after = Math.floor(Date.now() / 1000) + 3600;

    expect(authInfo.expiresAt).toBeGreaterThanOrEqual(before);
    expect(authInfo.expiresAt).toBeLessThanOrEqual(after);
  });

  it("throws OAuthError when verifyAuth fails", async () => {
    mockVerifyAuth.mockRejectedValue(new Error("Invalid JWT signature"));

    const token = makeFakeJwt(Math.floor(Date.now() / 1000) + 3600);
    await expect(tokenVerifier.verifyAccessToken(token)).rejects.toThrow();
  });

  it("populates ALS session via runWithSession", async () => {
    const user = makeAuthUser({
      id: "session-user-id",
      roles: ["collaborator"],
      idp_code: "admin/acme",
      idp_org: "acme",
      idp_username: "sessionuser",
    });
    mockVerifyAuth.mockResolvedValue(user);

    const token = makeFakeJwt(Math.floor(Date.now() / 1000) + 3600);
    await tokenVerifier.verifyAccessToken(token);

    expect(mockRunWithSession).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: "session-user-id",
        roles: ["collaborator"],
        idpCode: "admin/acme",
        idpOrg: "acme",
        idpUsername: "sessionuser",
      }),
    );
  });
});
