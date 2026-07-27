import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @primebrick/sdk — requireActor returns a fixed actor for audit fields
vi.mock("@primebrick/sdk", () => ({
  requireActor: () => "test-actor-uuid",
}));

// Mock @primebrick/dal-pg — preserve decorators via importOriginal, mock Repository
const mockRepo = {
  add: vi.fn(),
  find: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@primebrick/dal-pg", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@primebrick/dal-pg")>();
  return {
    ...actual,
    Repository: vi.fn().mockImplementation(function () { return mockRepo; }),
  };
});

// Import after mocks
import { UserInvitationsDal } from "../user-invitations-dal.js";

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
}> = {}) {
  return {
    id: 1n,
    uuid: "inv-uuid-123",
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

describe("UserInvitationsDal", () => {
  let dal: UserInvitationsDal;

  beforeEach(() => {
    vi.clearAllMocks();
    dal = new UserInvitationsDal({} as any);
  });

  describe("create", () => {
    it("should insert a new invitation with PENDING status and return uuid", async () => {
      mockRepo.add.mockResolvedValue({ uuid: "new-inv-uuid" });

      const result = await dal.create({
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

      const result = await dal.findByTokenHash("myhash");

      expect(result).not.toBeNull();
      expect(result!.token_hash).toBe("myhash");
      expect(mockRepo.find).toHaveBeenCalledTimes(1);
    });

    it("should return null when token hash not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      const result = await dal.findByTokenHash("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findByUuid", () => {
    it("should find an invitation by uuid", async () => {
      const row = makeInvitationRow({ uuid: "test-uuid" });
      mockRepo.find.mockResolvedValue(row);

      const result = await dal.findByUuid("test-uuid");

      expect(result).not.toBeNull();
      expect(result!.uuid).toBe("test-uuid");
    });

    it("should return null when uuid not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      const result = await dal.findByUuid("nonexistent");

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

      const result = await dal.findByUserProfileId(10n);

      expect(result).toHaveLength(2);
      expect(result[0].uuid).toBe("inv-1");
      expect(result[1].uuid).toBe("inv-2");
    });

    it("should return empty array when no invitations exist", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await dal.findByUserProfileId(999n);

      expect(result).toHaveLength(0);
    });
  });

  describe("updateStatus", () => {
    it("should update status with completed_at", async () => {
      const completedAt = new Date("2026-07-18T00:00:00Z");
      await dal.updateStatus("inv-uuid", "COMPLETED", { completed_at: completedAt });

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [entity, data, options] = mockRepo.update.mock.calls[0];
      expect(data.uuid).toBe("inv-uuid");
      expect(data.status).toBe("COMPLETED");
      expect(data.completed_at).toBe(completedAt);
      expect(data.updated_by).toBe("test-actor-uuid");
    });

    it("should update status without extra fields", async () => {
      await dal.updateStatus("inv-uuid", "REVOKED");

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data] = mockRepo.update.mock.calls[0];
      expect(data.uuid).toBe("inv-uuid");
      expect(data.status).toBe("REVOKED");
    });
  });

  describe("incrementOtpAttempts", () => {
    it("should increment otp_attempts by 1", async () => {
      mockRepo.find.mockResolvedValue(makeInvitationRow({ otp_attempts: 3 }));

      await dal.incrementOtpAttempts("inv-uuid");

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data] = mockRepo.update.mock.calls[0];
      expect(data.otp_attempts).toBe(4);
    });

    it("should do nothing if invitation not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      await dal.incrementOtpAttempts("nonexistent");

      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("setOtp", () => {
    it("should set otp_hash, otp_expires_at, reset attempts, and set status to OTP_SENT", async () => {
      const expiresAt = new Date("2026-07-17T12:05:00Z");
      await dal.setOtp("inv-uuid", "otphash", expiresAt);

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
      const before = new Date();
      await dal.markOtpVerified("inv-uuid");
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
      const before = new Date();
      await dal.markCompleted("inv-uuid");
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
