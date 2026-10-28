import { describe, it, expect, vi, beforeEach } from "vitest";

// The service reaches the DB through the inherited lazy `_dal` field
// (DomainService.dal → dal-pg's process-singleton getDal()). Node-modules
// internals can't be vi.mock'ed, so tests inject the seam directly
// (same pattern as webauthn-passkeys.test.ts).
const mockRepo = {
  findAll: vi.fn(),
  find: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  hardDelete: vi.fn(),
};

import { UserPreferencesService } from "../user-preferences.service.js";
import { NotFoundError } from "../../../../http/api-errors.js";

const USER_UUID = "11111111-2222-3333-4444-555555555555";

function prefRow(overrides: Record<string, unknown> = {}) {
  return {
    uuid: "row-uuid-1",
    user_uuid: USER_UUID,
    key: "favorite_pages",
    value: ["/system/job/rules/create"],
    version: 3,
    ...overrides,
  };
}

describe("UserPreferencesService", () => {
  let svc: UserPreferencesService;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new UserPreferencesService();
    (svc as any)._dal = mockRepo;
  });

  describe("getAll", () => {
    it("maps rows to a {key: value} preferences map", async () => {
      mockRepo.findAll.mockResolvedValue([
        prefRow(),
        prefRow({ key: "ui_locale", value: "it-IT" }),
      ]);
      const entry = await svc.getAll(USER_UUID);
      expect(entry.data.preferences).toEqual({
        favorite_pages: ["/system/job/rules/create"],
        ui_locale: "it-IT",
      });
    });

    it("returns an empty map when the user has no rows", async () => {
      mockRepo.findAll.mockResolvedValue([]);
      const entry = await svc.getAll(USER_UUID);
      expect(entry.data.preferences).toEqual({});
    });
  });

  describe("getOne", () => {
    it("returns {key, value} for an owned row", async () => {
      mockRepo.find.mockResolvedValue(prefRow());
      const entry = await svc.getOne(USER_UUID, "favorite_pages");
      expect(entry.data).toEqual({
        key: "favorite_pages",
        value: ["/system/job/rules/create"],
      });
    });

    it("throws NotFoundError when the caller owns no row for key", async () => {
      mockRepo.find.mockResolvedValue(null);
      await expect(svc.getOne(USER_UUID, "missing")).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("findByKey", () => {
    it("returns the row scoped by user_uuid + key", async () => {
      mockRepo.find.mockResolvedValue(prefRow());
      const row = await svc.findByKey(USER_UUID, "favorite_pages");
      expect(row?.key).toBe("favorite_pages");
      expect(mockRepo.find).toHaveBeenCalledTimes(1);
    });

    it("returns null when no row exists", async () => {
      mockRepo.find.mockResolvedValue(null);
      expect(await svc.findByKey(USER_UUID, "missing")).toBeNull();
    });
  });

  describe("set", () => {
    it("inserts when no row exists (upsert banned → read-then-add)", async () => {
      mockRepo.find.mockResolvedValue(null);
      mockRepo.add.mockResolvedValue(prefRow());
      await svc.set(USER_UUID, "favorite_pages", ["/a"], "actor-1");
      expect(mockRepo.add).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          user_uuid: USER_UUID,
          key: "favorite_pages",
          value: ["/a"],
        }),
        expect.anything(),
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("updates with the observed version when a row exists", async () => {
      mockRepo.find.mockResolvedValue(prefRow({ version: 7 }));
      mockRepo.update.mockResolvedValue(prefRow({ value: ["/b"], version: 8 }));
      await svc.set(USER_UUID, "favorite_pages", ["/b"], "actor-1");
      expect(mockRepo.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ uuid: "row-uuid-1", version: 7, value: ["/b"] }),
        expect.anything(),
      );
      expect(mockRepo.add).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("throws NotFoundError when the caller owns no row for key", async () => {
      mockRepo.find.mockResolvedValue(null);
      await expect(svc.remove(USER_UUID, "missing", "actor-1")).rejects.toBeInstanceOf(NotFoundError);
      expect(mockRepo.hardDelete).not.toHaveBeenCalled();
    });

    it("hard-deletes the owned row", async () => {
      mockRepo.find.mockResolvedValue(prefRow());
      mockRepo.hardDelete.mockResolvedValue(undefined);
      await svc.remove(USER_UUID, "favorite_pages", "actor-1");
      expect(mockRepo.hardDelete).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ uuid: "row-uuid-1", version: 3 }),
        expect.anything(),
      );
    });
  });
});
