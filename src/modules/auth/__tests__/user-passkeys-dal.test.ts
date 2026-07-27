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
import { UserPasskeysDal } from "../user-passkeys-dal.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makePasskeyRow(overrides: Partial<{
  id: bigint;
  uuid: string;
  user_profile_id: bigint;
  credential_id: string;
  aaguid: string | null;
  transports: string[] | null;
  label: string | null;
  version: number;
}> = {}) {
  return {
    id: 1n,
    uuid: "passkey-uuid-123",
    user_profile_id: 10n,
    credential_id: "cred-id-base64url",
    aaguid: "aaguid-uuid",
    transports: ["internal"],
    label: "Windows Hello",
    version: 1,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("UserPasskeysDal", () => {
  let dal: UserPasskeysDal;

  beforeEach(() => {
    vi.clearAllMocks();
    dal = new UserPasskeysDal({} as any);
  });

  describe("create", () => {
    it("should insert a new passkey and return uuid", async () => {
      mockRepo.add.mockResolvedValue({ uuid: "new-passkey-uuid" });

      const result = await dal.create({
        user_profile_id: 10n,
        credential_id: "cred-123",
        aaguid: "aaguid-456",
        transports: ["internal", "hybrid"],
        label: "iPhone",
      });

      expect(result).toBe("new-passkey-uuid");
      expect(mockRepo.add).toHaveBeenCalledTimes(1);
      const [entity, data, options] = mockRepo.add.mock.calls[0];
      expect(entity.name).toBe("UserPasskeyEntity");
      expect(data.credential_id).toBe("cred-123");
      expect(data.aaguid).toBe("aaguid-456");
      expect(data.transports).toEqual(["internal", "hybrid"]);
      expect(data.label).toBe("iPhone");
      expect(data.created_by).toBe("test-actor-uuid");
      expect(options.actor).toBe("test-actor-uuid");
    });

    it("should insert a passkey without optional fields", async () => {
      mockRepo.add.mockResolvedValue({ uuid: "new-passkey-uuid" });

      await dal.create({
        user_profile_id: 10n,
        credential_id: "cred-123",
      });

      const [, data] = mockRepo.add.mock.calls[0];
      expect(data.aaguid).toBeUndefined();
      expect(data.transports).toBeUndefined();
      expect(data.label).toBeUndefined();
    });

    it("should insert a passkey with rich metadata fields", async () => {
      mockRepo.add.mockResolvedValue({ uuid: "new-passkey-uuid" });
      const when = new Date("2026-07-25T10:00:00Z");

      await dal.create({
        user_profile_id: 10n,
        credential_id: "cred-123",
        authenticator_attachment: "platform",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        os: "Windows",
        device_model: "Windows PC",
        last_used_at: when,
      });

      const [, data] = mockRepo.add.mock.calls[0];
      expect(data.authenticator_attachment).toBe("platform");
      expect(data.user_agent).toBe("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
      expect(data.os).toBe("Windows");
      expect(data.device_model).toBe("Windows PC");
      expect(data.last_used_at).toBe(when);
    });
  });

  describe("findByCredentialId", () => {
    it("should find a passkey by credential ID", async () => {
      const row = makePasskeyRow({ credential_id: "my-cred" });
      mockRepo.find.mockResolvedValue(row);

      const result = await dal.findByCredentialId("my-cred");

      expect(result).not.toBeNull();
      expect(result!.credential_id).toBe("my-cred");
    });

    it("should return null when credential ID not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      const result = await dal.findByCredentialId("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findByUserProfileId", () => {
    it("should return all passkeys for a user profile", async () => {
      const rows = [
        makePasskeyRow({ uuid: "pk-1", label: "Windows Hello" }),
        makePasskeyRow({ uuid: "pk-2", label: "iPhone", id: 2n }),
      ];
      mockRepo.findAll.mockResolvedValue(rows);

      const result = await dal.findByUserProfileId(10n);

      expect(result).toHaveLength(2);
      expect(result[0].uuid).toBe("pk-1");
      expect(result[1].uuid).toBe("pk-2");
    });

    it("should return empty array when user has no passkeys", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await dal.findByUserProfileId(999n);

      expect(result).toHaveLength(0);
    });
  });

  describe("countByUserProfileId", () => {
    it("should return the count of passkeys", async () => {
      const rows = [
        makePasskeyRow({ uuid: "pk-1" }),
        makePasskeyRow({ uuid: "pk-2", id: 2n }),
        makePasskeyRow({ uuid: "pk-3", id: 3n }),
      ];
      mockRepo.findAll.mockResolvedValue(rows);

      const result = await dal.countByUserProfileId(10n);

      expect(result).toBe(3);
    });

    it("should return 0 when user has no passkeys", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await dal.countByUserProfileId(999n);

      expect(result).toBe(0);
    });
  });

  describe("deleteByUuid", () => {
    it("should delete a passkey by uuid", async () => {
      const row = makePasskeyRow({ uuid: "pk-to-delete", id: 42n });
      mockRepo.find.mockResolvedValue(row);

      await dal.deleteByUuid("pk-to-delete");

      expect(mockRepo.find).toHaveBeenCalledTimes(1);
      expect(mockRepo.delete).toHaveBeenCalledTimes(1);
      const [entity, match, options] = mockRepo.delete.mock.calls[0];
      expect(match.id).toBe(42n);
      expect(options.actor).toBe("test-actor-uuid");
    });

    it("should do nothing if passkey not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      await dal.deleteByUuid("nonexistent");

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("deleteByCredentialId", () => {
    it("should delete a passkey by credential ID", async () => {
      const row = makePasskeyRow({ credential_id: "cred-to-delete", id: 55n });
      mockRepo.find.mockResolvedValue(row);

      await dal.deleteByCredentialId("cred-to-delete");

      expect(mockRepo.delete).toHaveBeenCalledTimes(1);
      const [, match] = mockRepo.delete.mock.calls[0];
      expect(match.id).toBe(55n);
    });

    it("should do nothing if credential ID not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      await dal.deleteByCredentialId("nonexistent");

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("updateLabel", () => {
    it("should update the label of a passkey", async () => {
      await dal.updateLabel("pk-uuid", "My New Label");

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data, options] = mockRepo.update.mock.calls[0];
      expect(data.uuid).toBe("pk-uuid");
      expect(data.label).toBe("My New Label");
      expect(data.updated_by).toBe("test-actor-uuid");
      expect(options.actor).toBe("test-actor-uuid");
    });
  });

  describe("updateLastUsed", () => {
    it("should bump last_used_at for an existing credential", async () => {
      const row = makePasskeyRow({ credential_id: "cred-abc", id: 77n, version: 1 });
      mockRepo.find.mockResolvedValue(row);
      const when = new Date("2026-07-25T12:00:00Z");

      await dal.updateLastUsed("cred-abc", when);

      expect(mockRepo.find).toHaveBeenCalledTimes(1);
      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data, options] = mockRepo.update.mock.calls[0];
      expect(data.id).toBe(77n);
      expect(data.last_used_at).toBe(when);
      // version is required for optimistic locking (auditable entity)
      expect(data.version).toBe(1);
      // updated_by is NOT set in the body — the `{ actor }` option writes it
      // automatically. Setting it in both places yields a PG error
      // "multiple assignments to same column" (42601).
      expect(data.updated_by).toBeUndefined();
      expect(options.actor).toBe("test-actor-uuid");
    });

    it("should do nothing if credential ID not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      await dal.updateLastUsed("nonexistent", new Date());

      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
