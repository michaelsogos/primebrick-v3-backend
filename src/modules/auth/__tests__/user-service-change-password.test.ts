import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted for mocks that need to be referenced in vi.mock factories
const { mockSendEmail, mockGenerateAlertLink, mockGenerateAdminMailto, mockRepo } = vi.hoisted(() => ({
  mockSendEmail: vi.fn(),
  mockGenerateAlertLink: vi.fn(),
  mockGenerateAdminMailto: vi.fn(),
  mockRepo: {
    add: vi.fn(),
    find: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock @primebrick/sdk
vi.mock("@primebrick/sdk", () => ({
  requireActor: () => "test-actor-uuid",
}));

// Mock @primebrick/dal-pg
vi.mock("@primebrick/dal-pg", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@primebrick/dal-pg")>();
  return {
    ...actual,
    Repository: vi.fn().mockImplementation(function () { return mockRepo; }),
  };
});

// Mock email-sender
vi.mock("../services/email-sender.js", () => ({
  sendEmail: mockSendEmail,
}));

// Mock invitation.service — use a class-like mock that works with `new`
vi.mock("../services/invitation.service.js", () => ({
  InvitationService: class {
    generateAlertLink = mockGenerateAlertLink;
    generateAdminMailto = mockGenerateAdminMailto;
  },
}));

// Mock config — getAuthConfig returns a minimal valid config
vi.mock("../config.js", () => ({
  getAuthConfig: vi.fn().mockResolvedValue({
    mode: "casdoor",
    roles_path: "roles",
    oidc: {},
    gateway: {},
    enable_webauthn: true,
    enable_email_verification_check: false,
  }),
}));

// Import after mocks
import { UserService } from "../services/user.service.js";
import { CasdoorService } from "../services/casdoor.service.js";
import type { Pool } from "pg";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockPool = {} as Pool;

function makeMockCasdoorService(checkResult: any, changeResult: any) {
  const mockClient = {
    checkUserPassword: vi.fn().mockResolvedValue(checkResult),
    changePassword: vi.fn().mockResolvedValue(changeResult),
  };
  const mockCasdoor = {
    getClient: vi.fn().mockResolvedValue(mockClient),
  };
  return { mockCasdoor, mockClient };
}

function makeUserService(mockCasdoor: any): UserService {
  const dal = {
    getByUuid: vi.fn().mockResolvedValue({
      uuid: "user-uuid-1",
      idp_code: "ACME/admin",
      idp_org: "ACME",
      idp_username: "admin",
      display_name: "Admin User",
      email: "admin@example.com",
    }),
  };
  return new UserService(mockPool, dal as any, mockCasdoor as any);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("UserService — changeOwnPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateAlertLink.mockResolvedValue("https://app/login?alert=xxx");
    mockGenerateAdminMailto.mockResolvedValue("mailto:admin@example.com");
  });

  it("changes password when current password is correct", async () => {
    const { mockCasdoor, mockClient } = makeMockCasdoorService(
      { status: "ok" },
      { status: "ok" },
    );
    const service = makeUserService(mockCasdoor);

    const result = await service.changeOwnPassword("user-uuid-1", "correct-pw", "new-pw-123");

    expect(result.status).toBe("ok");
    expect(mockClient.checkUserPassword).toHaveBeenCalledWith(
      { id: "ACME/admin", owner: "ACME", name: "admin" },
      "correct-pw",
    );
    expect(mockClient.changePassword).toHaveBeenCalledWith(
      { id: "ACME/admin", owner: "ACME", name: "admin" },
      "new-pw-123",
    );
  });

  it("throws WRONG_PASSWORD when current password is incorrect", async () => {
    const { mockCasdoor, mockClient } = makeMockCasdoorService(
      { status: "error", msg: "wrong password" },
      { status: "ok" },
    );
    const service = makeUserService(mockCasdoor);

    await expect(
      service.changeOwnPassword("user-uuid-1", "wrong-pw", "new-pw-123"),
    ).rejects.toThrow();

    // changePassword should NOT be called
    expect(mockClient.changePassword).not.toHaveBeenCalled();
  });

  it("sends password_changed notification email on success", async () => {
    const { mockCasdoor } = makeMockCasdoorService(
      { status: "ok" },
      { status: "ok" },
    );
    const service = makeUserService(mockCasdoor);

    await service.changeOwnPassword("user-uuid-1", "correct-pw", "new-pw-123");

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        template_code: "password_changed",
        to: ["admin@example.com"],
      }),
    );
  });

  it("does not send email when Casdoor change fails", async () => {
    const { mockCasdoor } = makeMockCasdoorService(
      { status: "ok" },
      { status: "error", msg: "casdoor error" },
    );
    const service = makeUserService(mockCasdoor);

    await expect(
      service.changeOwnPassword("user-uuid-1", "correct-pw", "new-pw-123"),
    ).rejects.toThrow();

    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("throws when user is not found", async () => {
    const { mockCasdoor } = makeMockCasdoorService({ status: "ok" }, { status: "ok" });
    const service = makeUserService(mockCasdoor);
    // Override getByUuid to return null
    (service as any).dal.getByUuid = vi.fn().mockResolvedValue(null);

    await expect(
      service.changeOwnPassword("nonexistent-uuid", "pw", "new-pw"),
    ).rejects.toThrow();
  });

  it("throws when Casdoor client is unavailable", async () => {
    const mockCasdoor = {
      getClient: vi.fn().mockResolvedValue(null),
    };
    const service = makeUserService(mockCasdoor);

    await expect(
      service.changeOwnPassword("user-uuid-1", "pw", "new-pw"),
    ).rejects.toThrow();
  });
});

describe("UserService — changePassword (admin) sends notification email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateAlertLink.mockResolvedValue("https://app/login?alert=xxx");
    mockGenerateAdminMailto.mockResolvedValue("mailto:admin@example.com");
  });

  it("sends password_changed email after admin password change", async () => {
    const mockClient = {
      changePassword: vi.fn().mockResolvedValue({ status: "ok" }),
    };
    const mockCasdoor = {
      getClient: vi.fn().mockResolvedValue(mockClient),
    };
    const service = makeUserService(mockCasdoor);

    await service.changePassword("user-uuid-1", "admin-set-pw-123");

    expect(mockClient.changePassword).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        template_code: "password_changed",
        to: ["admin@example.com"],
      }),
    );
  });

  it("does not send email when Casdoor change fails", async () => {
    const mockClient = {
      changePassword: vi.fn().mockResolvedValue({ status: "error", msg: "failed" }),
    };
    const mockCasdoor = {
      getClient: vi.fn().mockResolvedValue(mockClient),
    };
    const service = makeUserService(mockCasdoor);

    await expect(
      service.changePassword("user-uuid-1", "admin-set-pw-123"),
    ).rejects.toThrow();

    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
