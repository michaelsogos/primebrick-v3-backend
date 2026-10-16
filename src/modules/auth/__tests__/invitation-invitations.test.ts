import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @primebrick/sdk — requireActor returns a fixed actor for audit fields.
// Spread actual: the service import chain pulls UserProfileEntity whose
// @Cached decorator is re-exported through the sdk barrel.
vi.mock("@primebrick/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@primebrick/sdk")>();
  return {
    ...actual,
    requireActor: () => "test-actor-uuid",
  };
});

// Mock @primebrick/dal-pg — preserve decorators via importOriginal, mock Repository
const mockRepo = {
  add: vi.fn(),
  find: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// The service reaches the DB through the inherited lazy `_dal` field
// (DomainService.dal). Inject the seam directly in beforeEach.

// Import after mocks
import { InvitationService } from "../services/invitation.service.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeInvitationRow(overrides: Partial<{
  id: bigint;
  uuid: string;
  user_profile_id: bigint;
  token_hash: string;
  status: string;
  email: string;
  expires_at: Date;
  completed_at: Date | null;
  otp_hash: string | null;
  otp_expires_at: Date | null;
  otp_attempts: number;
  otp_verified_at: Date | null;
  version: number;
}> = {}) {
  return {
    id: 1n,
    uuid: "inv-uuid-123",
    version: 1,
    user_profile_id: 10n,
    token_hash: "abc123hash",
    status: "PENDING",
    email: "user@example.com",
    expires_at: new Date("2026-07-24T00:00:00Z"),
    completed_at: null,
    otp_hash: null,
    otp_expires_at: null,
    otp_attempts: 0,
    otp_verified_at: null,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("InvitationService — user_invitations ops", () => {
  let svc: InvitationService;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new InvitationService({} as any);
    (svc as any)._dal = mockRepo;
  });

  describe("create", () => {
    it("should insert a new invitation with PENDING status and return uuid", async () => {
      mockRepo.add.mockResolvedValue({ uuid: "new-inv-uuid" });

      const result = await (svc as any).insertInvitation({
        user_profile_id: 10n,
        token_hash: "sha256hash",
        email: "user@example.com",
        expires_at: new Date("2026-07-24T00:00:00Z"),
      });

      expect(result).toBe("new-inv-uuid");
      expect(mockRepo.add).toHaveBeenCalledTimes(1);
      const [entity, data, options] = mockRepo.add.mock.calls[0];
      expect(entity.name).toBe("UserInvitationEntity");
      expect(data.token_hash).toBe("sha256hash");
      expect(data.status).toBe("PENDING");
      expect(data.email).toBe("user@example.com");
      expect(data.otp_attempts).toBe(0);
      expect(data.created_by).toBe("test-actor-uuid");
      expect(options.actor).toBe("test-actor-uuid");
    });
  });

  describe("findByTokenHash", () => {
    it("should find an invitation by token hash", async () => {
      const row = makeInvitationRow({ token_hash: "myhash" });
      mockRepo.find.mockResolvedValue(row);

      const result = await (svc as any).findInvitationByTokenHash("myhash");

      expect(result).not.toBeNull();
      expect(result!.token_hash).toBe("myhash");
      expect(mockRepo.find).toHaveBeenCalledTimes(1);
    });

    it("should return null when token hash not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      const result = await (svc as any).findInvitationByTokenHash("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findByUuid", () => {
    it("should find an invitation by uuid", async () => {
      const row = makeInvitationRow({ uuid: "test-uuid" });
      mockRepo.find.mockResolvedValue(row);

      const result = await (svc as any).findInvitationByUuid("test-uuid");

      expect(result).not.toBeNull();
      expect(result!.uuid).toBe("test-uuid");
    });

    it("should return null when uuid not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      const result = await (svc as any).findInvitationByUuid("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findByUserProfileId", () => {
    it("should return all invitations for a user profile", async () => {
      const rows = [
        makeInvitationRow({ uuid: "inv-1" }),
        makeInvitationRow({ uuid: "inv-2", status: "COMPLETED" }),
      ];
      mockRepo.findAll.mockResolvedValue(rows);

      const result = await (svc as any).findInvitationsByUserProfileId(10n);

      expect(result).toHaveLength(2);
      expect(result[0].uuid).toBe("inv-1");
      expect(result[1].uuid).toBe("inv-2");
    });

    it("should return empty array when no invitations exist", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await (svc as any).findInvitationsByUserProfileId(999n);

      expect(result).toHaveLength(0);
    });
  });

  describe("updateStatus", () => {
    it("should update status with completed_at", async () => {
      mockRepo.find.mockResolvedValue(makeInvitationRow());
      const completedAt = new Date("2026-07-18T00:00:00Z");
      await (svc as any).updateInvitationStatus("inv-uuid", "COMPLETED", { completed_at: completedAt });

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [entity, data, options] = mockRepo.update.mock.calls[0];
      expect(data.uuid).toBe("inv-uuid");
      expect(data.status).toBe("COMPLETED");
      expect(data.completed_at).toBe(completedAt);
      // updated_by is NOT set in the body — the `{ actor }` option writes it
      // (setting both yields PG 42601 "multiple assignments to same column").
      expect(data.updated_by).toBeUndefined();
      expect(options.actor).toBe("test-actor-uuid");
    });

    it("should update status without extra fields", async () => {
      mockRepo.find.mockResolvedValue(makeInvitationRow());
      await (svc as any).updateInvitationStatus("inv-uuid", "REVOKED");

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data] = mockRepo.update.mock.calls[0];
      expect(data.uuid).toBe("inv-uuid");
      expect(data.status).toBe("REVOKED");
    });
  });

  describe("incrementOtpAttempts", () => {
    it("should increment otp_attempts by 1", async () => {
      mockRepo.find.mockResolvedValue(makeInvitationRow({ otp_attempts: 3 }));

      await (svc as any).incrementInvitationOtpAttempts("inv-uuid");

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data] = mockRepo.update.mock.calls[0];
      expect(data.otp_attempts).toBe(4);
    });

    it("should do nothing if invitation not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      await (svc as any).incrementInvitationOtpAttempts("nonexistent");

      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("setOtp", () => {
    it("should set otp_hash, otp_expires_at, reset attempts, and set status to OTP_SENT", async () => {
      mockRepo.find.mockResolvedValue(makeInvitationRow());
      const expiresAt = new Date("2026-07-17T12:05:00Z");
      await (svc as any).setInvitationOtp("inv-uuid", "otphash", expiresAt);

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data] = mockRepo.update.mock.calls[0];
      expect(data.uuid).toBe("inv-uuid");
      expect(data.otp_hash).toBe("otphash");
      expect(data.otp_expires_at).toBe(expiresAt);
      expect(data.otp_attempts).toBe(0);
      expect(data.status).toBe("OTP_SENT");
    });
  });

  describe("markOtpVerified", () => {
    it("should set otp_verified_at to current time", async () => {
      mockRepo.find.mockResolvedValue(makeInvitationRow());
      const before = new Date();
      await (svc as any).markInvitationOtpVerified("inv-uuid");
      const after = new Date();

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data] = mockRepo.update.mock.calls[0];
      expect(data.uuid).toBe("inv-uuid");
      expect(data.otp_verified_at).toBeInstanceOf(Date);
      expect(data.otp_verified_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(data.otp_verified_at.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("markCompleted", () => {
    it("should set status to COMPLETED and completed_at to current time", async () => {
      mockRepo.find.mockResolvedValue(makeInvitationRow());
      const before = new Date();
      await (svc as any).markInvitationCompleted("inv-uuid");
      const after = new Date();

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data] = mockRepo.update.mock.calls[0];
      expect(data.uuid).toBe("inv-uuid");
      expect(data.status).toBe("COMPLETED");
      expect(data.completed_at).toBeInstanceOf(Date);
      expect(data.completed_at!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(data.completed_at!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
