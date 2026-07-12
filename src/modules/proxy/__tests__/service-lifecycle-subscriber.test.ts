import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the pool module
vi.mock("../../../db/pool.js", () => ({ getPool: vi.fn() }));

// Shared mock repo instance — returned by every `new ServiceRegistryRepo()` call
const mockRepo = {
  findByCode: vi.fn(),
  findByCodeAndBaseUrl: vi.fn(),
  insert: vi.fn(),
  updateByCode: vi.fn(),
  updateByCodeAndBaseUrl: vi.fn(),
};

// Mock ServiceRegistryRepo — always returns the shared mockRepo instance
vi.mock("../service-registry-repo.js", () => ({
  ServiceRegistryRepo: vi.fn().mockImplementation(function () { return mockRepo; }),
}));

// Import after mock
import { ServiceLifecycleSubscriber } from "../service-lifecycle-subscriber.js";

function makeRegisterPayload(overrides: Partial<{
  code: string;
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
    mockRepo.insert.mockReset();
    mockRepo.updateByCode.mockReset();
    mockRepo.updateByCodeAndBaseUrl.mockReset();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("handleRegister", () => {
    it("scaler mode, existing row → updateByCode (skip base_url)", async () => {
      const sub = new ServiceLifecycleSubscriber();
      mockRepo.findByCode.mockResolvedValue({ code: "svc-a", status: "going_live" });

      await (sub as any).handleRegister(makeRegisterPayload({ is_behind_scaler: true }));

      expect(mockRepo.updateByCode).toHaveBeenCalledTimes(1);
      const [code, row] = mockRepo.updateByCode.mock.calls[0];
      expect(code).toBe("svc-a");
      expect(row).not.toHaveProperty("base_url");
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
      expect(mockRepo.updateByCodeAndBaseUrl).not.toHaveBeenCalled();
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
