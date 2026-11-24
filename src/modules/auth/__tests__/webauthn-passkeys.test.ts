import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @primebrick/sdk — requireActor returns a fixed actor for audit fields.
// Spread actual: UserPasskeyEntity pulls entity decorators whose @Cached
// decorator is re-exported through the sdk barrel.
vi.mock("@primebrick/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@primebrick/sdk")>();
  return {
    ...actual,
    requireActor: () => "test-actor-uuid",
  };
});

// Mock @primebrick/dal-pg — preserve decorators via importOriginal, mock Repository
// `svc` composes entityService over the dal — wire it against the same stub
// repo; audit port is silenced (fire-and-forget writes are not under test).
import { makeEntityService, DAL_NOW } from "@primebrick/dal-pg";
const mockRepo = {
  add: vi.fn(async (...args: any[]) => args[1]),
  find: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(async (...args: any[]) => args[1]),
  delete: vi.fn(async (...args: any[]) => args[1]),
  entityService: (cfg: Record<string, unknown>) =>
    makeEntityService({
      ...cfg,
      repo: mockRepo as never,
      auditPort: () => ({ writeAudit: async () => 0n }),
    } as never),
  tableAuditPort: () => ({ writeAudit: async () => 0n }),
};

// The service reaches the DB through the inherited lazy `_dal` field
// (DomainService.dal → dal-pg's process-singleton getDal()). Node-modules
// internals can't be vi.mock'ed, so tests inject the seam directly:
// `(svc as any)._dal = mockRepo` in beforeEach below.

// Import after mocks
import { WebauthnService } from "../services/webauthn.service.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makePasskeyRow(overrides: Partial<{
  uuid: string;
  user_profile_uuid: string;
  credential_id: string;
  aaguid: string | null;
  transports: string[] | null;
  label: string | null;
  version: number;
}> = {}) {
  return {
    uuid: "passkey-uuid-123",
    user_profile_uuid: "profile-uuid-123",
    credential_id: "cred-id-base64url",
    aaguid: "aaguid-uuid",
    transports: ["internal"],
    label: "Windows Hello",
    version: 1,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("WebauthnService — user_passkeys ops", () => {
  let svc: WebauthnService;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new WebauthnService({} as any);
    (svc as any)._dal = mockRepo;
  });

  describe("create", () => {
    it("should insert a new passkey and return uuid", async () => {
      mockRepo.add.mockResolvedValue({ uuid: "new-passkey-uuid" });

      const result = await (svc as any).createPasskey({
        user_profile_uuid: "profile-uuid-123",
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
      // created_by/updated_by are NOT in the body — the `{ actor }` option
      // stamps them automatically at the repo layer.
      expect(data.created_by).toBeUndefined();
      expect(options.actor).toBe("test-actor-uuid");
    });

    it("should insert a passkey without optional fields", async () => {
      mockRepo.add.mockResolvedValue({ uuid: "new-passkey-uuid" });

      await (svc as any).createPasskey({
        user_profile_uuid: "profile-uuid-123",
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

      await (svc as any).createPasskey({
        user_profile_uuid: "profile-uuid-123",
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

      const result = await (svc as any).findPasskeyByCredentialId("my-cred");

      expect(result).not.toBeNull();
      expect(result!.credential_id).toBe("my-cred");
    });

    it("should return null when credential ID not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      const result = await (svc as any).findPasskeyByCredentialId("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findByUserProfileUuid", () => {
    it("should return all passkeys for a user profile", async () => {
      const rows = [
        makePasskeyRow({ uuid: "pk-1", label: "Windows Hello" }),
        makePasskeyRow({ uuid: "pk-2", label: "iPhone" }),
      ];
      mockRepo.findAll.mockResolvedValue(rows);

      const result = await (svc as any).findPasskeysByUserProfileUuid("profile-uuid-123");

      expect(result).toHaveLength(2);
      expect(result[0].uuid).toBe("pk-1");
      expect(result[1].uuid).toBe("pk-2");
    });

    it("should return empty array when user has no passkeys", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await (svc as any).findPasskeysByUserProfileUuid("profile-uuid-123");

      expect(result).toHaveLength(0);
    });
  });

  describe("countByUserProfileUuid", () => {
    it("should return the count of passkeys", async () => {
      const rows = [
        makePasskeyRow({ uuid: "pk-1" }),
        makePasskeyRow({ uuid: "pk-2" }),
        makePasskeyRow({ uuid: "pk-3" }),
      ];
      mockRepo.findAll.mockResolvedValue(rows);

      const result = await svc.countPasskeysByUserProfileUuid("profile-uuid-123");

      expect(result).toBe(3);
    });

    it("should return 0 when user has no passkeys", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await svc.countPasskeysByUserProfileUuid("profile-uuid-123");

      expect(result).toBe(0);
    });
  });

  describe("deleteByUuid", () => {
    it("should delete a passkey by uuid", async () => {
      const row = makePasskeyRow({ uuid: "pk-to-delete" });
      mockRepo.find.mockResolvedValue(row);

      await (svc as any).deletePasskeyByUuid("pk-to-delete");

      expect(mockRepo.find).toHaveBeenCalledTimes(1);
      expect(mockRepo.delete).toHaveBeenCalledTimes(1);
      const [entity, match, options] = mockRepo.delete.mock.calls[0];
      expect(match.uuid).toBe("pk-to-delete");
      expect(options.actor).toBe("test-actor-uuid");
    });

    it("should do nothing if passkey not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      await (svc as any).deletePasskeyByUuid("nonexistent");

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("deleteByCredentialId", () => {
    it("should delete a passkey by credential ID", async () => {
      const row = makePasskeyRow({ credential_id: "cred-to-delete", uuid: "pk-cred-del" });
      mockRepo.find.mockResolvedValue(row);

      await (svc as any).deletePasskeyByCredentialId("cred-to-delete");

      expect(mockRepo.delete).toHaveBeenCalledTimes(1);
      const [, match] = mockRepo.delete.mock.calls[0];
      expect(match.uuid).toBe("pk-cred-del");
    });

    it("should do nothing if credential ID not found", async () => {
      mockRepo.find.mockResolvedValue(null);

      await (svc as any).deletePasskeyByCredentialId("nonexistent");

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("updateLabel", () => {
    it("should update the label of a passkey", async () => {
      mockRepo.find.mockResolvedValue(makePasskeyRow({ uuid: "pk-uuid" }));
      await (svc as any).updatePasskeyLabel("pk-uuid", "My New Label");

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data, options] = mockRepo.update.mock.calls[0];
      expect(data.uuid).toBe("pk-uuid");
      expect(data.label).toBe("My New Label");
      // updated_by is NOT set in the body — the `{ actor }` option writes it
      // (setting both yields PG 42601 "multiple assignments to same column").
      expect(data.updated_by).toBeUndefined();
      expect(options.actor).toBe("test-actor-uuid");
      expect(options.actor).toBe("test-actor-uuid");
    });
  });

  describe("updateLastUsed", () => {
    it("should bump last_used_at for an existing credential", async () => {
      const row = makePasskeyRow({ credential_id: "cred-abc", version: 1 });
      mockRepo.find.mockResolvedValue(row);

      await (svc as any).updatePasskeyLastUsed("cred-abc");

      expect(mockRepo.find).toHaveBeenCalledTimes(1);
      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const [, data, options] = mockRepo.update.mock.calls[0];
      // svc.update matches by uuid — the row was resolved by credential_id
      // first, so the uuid match is strictly equivalent.
      expect(data.uuid).toBe(row.uuid);
      expect(data.last_used_at).toBe(DAL_NOW);
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

      await (svc as any).updatePasskeyLastUsed("nonexistent", new Date());

      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
