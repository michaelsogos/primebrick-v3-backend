import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the pool module
// Shared mock service instance — returned by every `new ServiceRegistryService()` call
const mockRepo = {
  findByCode: vi.fn(),
  findByCodeAndBaseUrl: vi.fn(),
  findAllByCode: vi.fn(),
  findDeletedByCode: vi.fn(),
  findDeletedByCodeAndBaseUrl: vi.fn(),
  restoreByUuid: vi.fn(),
  insert: vi.fn(),
  updateByCode: vi.fn(),
  updateByCodeAndBaseUrl: vi.fn(),
};

// Mock ServiceRegistryService — always returns the shared mockRepo instance
vi.mock("../../../modules/system/service-registry.service.js", () => ({
  ServiceRegistryService: vi.fn().mockImplementation(function () { return mockRepo; }),
}));

// Import after mock
import { ServiceLifecycleSubscriber } from "../service-lifecycle-subscriber.js";

function makeRegisterPayload(overrides: Partial<{
  code: string;
  pkg_name: string;
  base_url: string;
  is_behind_scaler: boolean;
  http_healthy: boolean;
  nats_connected: boolean;
  service_version: string;
  name: string;
  description: string;
  author: string;
  github_repo_url: string;
  endpoints: Record<string, unknown>;
}> = {}) {
  return {
    code: "svc-a",
    base_url: "http://localhost:8000",
    is_behind_scaler: true,
    http_healthy: true,
    nats_connected: true,
    service_version: "1.0.0",
    name: "Service A",
    description: "desc",
    author: "team",
    github_repo_url: "https://github.com/example/svc-a",
    endpoints: { "/health": { method: "GET" } },
    ...overrides,
  };
}

function makeHeartbeatPayload(overrides: Partial<{
  code: string;
  base_url: string;
  is_behind_scaler: boolean;
  http_healthy: boolean;
  nats_connected: boolean;
  service_version: string;
}> = {}) {
  return {
    code: "svc-a",
    base_url: "http://localhost:8000",
    is_behind_scaler: true,
    http_healthy: true,
    nats_connected: true,
    service_version: "1.0.0",
    ...overrides,
  };
}

function makeUnregisterPayload(overrides: Partial<{
  code: string;
  base_url: string;
  is_behind_scaler: boolean;
}> = {}) {
  return {
    code: "svc-a",
    base_url: "http://localhost:8000",
    is_behind_scaler: true,
    ...overrides,
  };
}

describe("ServiceLifecycleSubscriber", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    mockRepo.findByCode.mockReset();
    mockRepo.findByCodeAndBaseUrl.mockReset();
    mockRepo.findAllByCode.mockReset().mockResolvedValue([]);
    mockRepo.findDeletedByCode.mockReset().mockResolvedValue(null);
    mockRepo.findDeletedByCodeAndBaseUrl.mockReset().mockResolvedValue(null);
    mockRepo.restoreByUuid.mockReset();
    mockRepo.insert.mockReset();
    mockRepo.updateByCode.mockReset();
    mockRepo.updateByCodeAndBaseUrl.mockReset();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("handleRegister", () => {
    it("scaler mode, existing row → updateByCode (base_url moves with the row)", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCode.mockResolvedValue({ code: "svc-a", status: "going_live" });

      await (sub as any).handleRegister(makeRegisterPayload({ is_behind_scaler: true }));

      expect(mockRepo.updateByCode).toHaveBeenCalledTimes(1);
      const [code, row] = mockRepo.updateByCode.mock.calls[0];
      expect(code).toBe("svc-a");
      // code is unique for scaler rows — a redeploy at a new base_url moves the row.
      expect(row).toHaveProperty("base_url", "http://localhost:8000");
      expect(row).toHaveProperty("status", "online");
      expect(row).toHaveProperty("service_version", "1.0.0");
      expect(row).toHaveProperty("name", "Service A");
      expect(mockRepo.insert).not.toHaveBeenCalled();
      expect(mockRepo.updateByCodeAndBaseUrl).not.toHaveBeenCalled();
    });

    it("scaler mode, no row → insert with base_url", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCode.mockResolvedValue(null);

      await (sub as any).handleRegister(makeRegisterPayload({ is_behind_scaler: true }));

      expect(mockRepo.insert).toHaveBeenCalledTimes(1);
      const inserted = mockRepo.insert.mock.calls[0][0];
      expect(inserted).toHaveProperty("code", "svc-a");
      expect(inserted).toHaveProperty("base_url", "http://localhost:8000");
      expect(inserted).toHaveProperty("is_behind_scaler", true);
      expect(inserted).toHaveProperty("status", "online");
      expect(mockRepo.updateByCode).not.toHaveBeenCalled();
    });

    it("direct mode, existing row → updateByCodeAndBaseUrl", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCodeAndBaseUrl.mockResolvedValue({ code: "svc-a", status: "going_live" });

      await (sub as any).handleRegister(makeRegisterPayload({ is_behind_scaler: false }));

      expect(mockRepo.updateByCodeAndBaseUrl).toHaveBeenCalledTimes(1);
      const [code, baseUrl, row] = mockRepo.updateByCodeAndBaseUrl.mock.calls[0];
      expect(code).toBe("svc-a");
      expect(baseUrl).toBe("http://localhost:8000");
      expect(row).toHaveProperty("status", "online");
      expect(mockRepo.updateByCode).not.toHaveBeenCalled();
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });

    it("direct mode, no row → insert", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCodeAndBaseUrl.mockResolvedValue(null);

      await (sub as any).handleRegister(makeRegisterPayload({ is_behind_scaler: false }));

      expect(mockRepo.insert).toHaveBeenCalledTimes(1);
      const inserted = mockRepo.insert.mock.calls[0][0];
      expect(inserted).toHaveProperty("code", "svc-a");
      expect(inserted).toHaveProperty("base_url", "http://localhost:8000");
      expect(inserted).toHaveProperty("is_behind_scaler", false);
      expect(inserted).toHaveProperty("status", "online");
      expect(inserted).toHaveProperty("is_enabled", true);
      expect(mockRepo.updateByCodeAndBaseUrl).not.toHaveBeenCalled();
    });

    it("scaler mode, tombstone row → restore + update (identity survives remove→re-add)", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCode.mockResolvedValue(null);
      mockRepo.findDeletedByCode.mockResolvedValue({ uuid: "u-1", version: 3, code: "svc-a" });
      mockRepo.findByCode
        .mockResolvedValueOnce(null) // live lookup
        .mockResolvedValueOnce({ code: "svc-a", status: "online" }); // post-restore re-read

      await (sub as any).handleRegister(makeRegisterPayload({ is_behind_scaler: true }));

      expect(mockRepo.restoreByUuid).toHaveBeenCalledWith("u-1", 3);
      expect(mockRepo.updateByCode).toHaveBeenCalledTimes(1);
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });

    it("direct mode, tombstone row → restore + updateByCodeAndBaseUrl", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCodeAndBaseUrl
        .mockResolvedValueOnce(null) // live lookup
        .mockResolvedValueOnce({ code: "svc-a", status: "online" }); // post-restore re-read
      mockRepo.findDeletedByCodeAndBaseUrl.mockResolvedValue({ uuid: "u-2", version: 7, code: "svc-a" });

      await (sub as any).handleRegister(makeRegisterPayload({ is_behind_scaler: false }));

      expect(mockRepo.restoreByUuid).toHaveBeenCalledWith("u-2", 7);
      expect(mockRepo.updateByCodeAndBaseUrl).toHaveBeenCalledTimes(1);
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });

    it("insert path preserves admin disable — is_enabled follows the code, not the row", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCodeAndBaseUrl.mockResolvedValue(null);
      // A sibling row (same code, different base_url) is admin-disabled.
      mockRepo.findAllByCode.mockResolvedValue([{ code: "svc-a", is_enabled: false }]);

      await (sub as any).handleRegister(makeRegisterPayload({ is_behind_scaler: false }));

      const inserted = mockRepo.insert.mock.calls[0][0];
      expect(inserted).toHaveProperty("is_enabled", false);
    });
  });

  describe("checkServiceCodeIntegrity", () => {
    it("derived: code === pkg_name minus primebrick- → accepted", () => {
      const sub = new ServiceLifecycleSubscriber();
      const err = (sub as any).checkServiceCodeIntegrity(
        makeRegisterPayload({ code: "job", pkg_name: "primebrick-job", is_behind_scaler: true }),
      );
      expect(err).toBeNull();
    });

    it("derived mismatch → rejected (config-edited code cannot re-identify)", () => {
      const sub = new ServiceLifecycleSubscriber();
      const err = (sub as any).checkServiceCodeIntegrity({
        ...makeRegisterPayload(),
        code: "scheduler",
        pkg_name: "primebrick-job",
      });
      expect(err).toContain('service code "scheduler" does not match pkg_name "primebrick-job"');
    });

    it("code_source=override → any valid code accepted", () => {
      const sub = new ServiceLifecycleSubscriber();
      const err = (sub as any).checkServiceCodeIntegrity({
        ...makeRegisterPayload(),
        code: "scheduler",
        pkg_name: "primebrick-job",
        code_source: "override",
      });
      expect(err).toBeNull();
    });

    it("non snake_case code → rejected", () => {
      const sub = new ServiceLifecycleSubscriber();
      const err = (sub as any).checkServiceCodeIntegrity({
        ...makeRegisterPayload(),
        code: "Job-Handler",
        pkg_name: "primebrick-job",
        code_source: "override",
      });
      expect(err).toContain("is invalid");
    });
  });

  describe("handleHeartbeat", () => {
    it("both healthy → status online", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCode.mockResolvedValue({ code: "svc-a", status: "going_live" });

      await (sub as any).handleHeartbeat(
        makeHeartbeatPayload({ is_behind_scaler: true, http_healthy: true, nats_connected: true }),
      );

      expect(mockRepo.updateByCode).toHaveBeenCalledTimes(1);
      const row = mockRepo.updateByCode.mock.calls[0][1];
      expect(row).toHaveProperty("status", "online");
    });

    it("both unhealthy → status offline", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCode.mockResolvedValue({ code: "svc-a", status: "online" });

      await (sub as any).handleHeartbeat(
        makeHeartbeatPayload({ is_behind_scaler: true, http_healthy: false, nats_connected: false }),
      );

      expect(mockRepo.updateByCode).toHaveBeenCalledTimes(1);
      const row = mockRepo.updateByCode.mock.calls[0][1];
      expect(row).toHaveProperty("status", "offline");
    });

    it("one healthy → status going_live", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCode.mockResolvedValue({ code: "svc-a", status: "offline" });

      await (sub as any).handleHeartbeat(
        makeHeartbeatPayload({ is_behind_scaler: true, http_healthy: true, nats_connected: false }),
      );

      expect(mockRepo.updateByCode).toHaveBeenCalledTimes(1);
      const row = mockRepo.updateByCode.mock.calls[0][1];
      expect(row).toHaveProperty("status", "going_live");
    });
  });

  describe("handleUnregister", () => {
    it("marks status offline", async () => {
      const sub = new ServiceLifecycleSubscriber();

      await (sub as any).handleUnregister(makeUnregisterPayload({ is_behind_scaler: true }));

      expect(mockRepo.updateByCode).toHaveBeenCalledTimes(1);
      const row = mockRepo.updateByCode.mock.calls[0][1];
      expect(row).toHaveProperty("status", "offline");
    });
  });

  describe("logStatusChange", () => {
    it("logs only when status changes", async () => {
      const sub = new ServiceLifecycleSubscriber();
      // existing status is 'online' and heartbeat derives 'online' → no change log
      mockRepo.findByCode.mockResolvedValue({ code: "svc-a", status: "online" });

      await (sub as any).handleHeartbeat(
        makeHeartbeatPayload({ is_behind_scaler: true, http_healthy: true, nats_connected: true }),
      );

      // No status-change log (the "[health] ... changed:" message) should appear
      const changeLogs = consoleLogSpy.mock.calls.filter((c: any[]) =>
        String(c[0]).includes("changed:"),
      );
      expect(changeLogs).toHaveLength(0);
    });
  });
});
