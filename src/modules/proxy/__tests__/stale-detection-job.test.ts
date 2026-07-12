import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the pool module
vi.mock("../../../db/pool.js", () => ({
  getPool: vi.fn(),
}));

// Shared mock repo instance — returned by every `new ServiceRegistryRepo()` call
const mockRepo = {
  findAll: vi.fn(),
  updateByCode: vi.fn(),
  updateByCodeAndBaseUrl: vi.fn(),
};

// Mock ServiceRegistryRepo — always returns the shared mockRepo instance
vi.mock("../service-registry-repo.js", () => ({
  ServiceRegistryRepo: vi.fn().mockImplementation(function () { return mockRepo; }),
}));

// Import after mock
import { StaleDetectionJob } from "../stale-detection-job.js";

function makeService(overrides: Partial<{
  code: string;
  base_url: string;
  status: string;
  is_behind_scaler: boolean;
  last_health_check_at: Date;
}> = {}) {
  return {
    code: "svc-a",
    base_url: "http://localhost:8000",
    status: "online",
    is_behind_scaler: true,
    last_health_check_at: new Date(),
    ...overrides,
  };
}

describe("StaleDetectionJob", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    mockRepo.findAll.mockReset();
    mockRepo.updateByCode.mockReset();
    mockRepo.updateByCodeAndBaseUrl.mockReset();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("no stale services → no updates, no error log", async () => {
    const job = new StaleDetectionJob();
    mockRepo.findAll.mockResolvedValue([
      makeService({ code: "svc-a", last_health_check_at: new Date() }),
      makeService({ code: "svc-b", last_health_check_at: new Date() }),
    ]);

    await (job as any).run();

    expect(mockRepo.updateByCode).not.toHaveBeenCalled();
    expect(mockRepo.updateByCodeAndBaseUrl).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("1 stale service (was online) → marked going_live", async () => {
    const job = new StaleDetectionJob();
    mockRepo.findAll.mockResolvedValue([
      makeService({
        code: "svc-a",
        status: "online",
        is_behind_scaler: true,
        last_health_check_at: new Date(Date.now() - 100000),
      }),
    ]);

    await (job as any).run();

    expect(mockRepo.updateByCode).toHaveBeenCalledWith("svc-a", { status: "going_live" });
    expect(mockRepo.updateByCodeAndBaseUrl).not.toHaveBeenCalled();
  });

  it("1 stale service (was already offline) → stays offline, no update", async () => {
    const job = new StaleDetectionJob();
    mockRepo.findAll.mockResolvedValue([
      makeService({
        code: "svc-a",
        status: "offline",
        is_behind_scaler: true,
        last_health_check_at: new Date(Date.now() - 100000),
      }),
    ]);

    await (job as any).run();

    expect(mockRepo.updateByCode).not.toHaveBeenCalled();
    expect(mockRepo.updateByCodeAndBaseUrl).not.toHaveBeenCalled();
  });

  it("ALL services stale → CRITICAL error logged", async () => {
    const job = new StaleDetectionJob();
    const staleTime = new Date(Date.now() - 100000);
    mockRepo.findAll.mockResolvedValue([
      makeService({ code: "svc-a", status: "online", is_behind_scaler: true, last_health_check_at: staleTime }),
      makeService({ code: "svc-b", status: "going_live", is_behind_scaler: true, last_health_check_at: staleTime }),
      makeService({ code: "svc-c", status: "offline", is_behind_scaler: true, last_health_check_at: staleTime }),
    ]);

    await (job as any).run();

    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorMsg = consoleErrorSpy.mock.calls[0][0] as string;
    expect(errorMsg).toContain("[CRITICAL]");
    // non-offline ones (svc-a, svc-b) marked going_live; svc-c skipped
    expect(mockRepo.updateByCode).toHaveBeenCalledTimes(2);
    expect(mockRepo.updateByCode).toHaveBeenCalledWith("svc-a", { status: "going_live" });
    expect(mockRepo.updateByCode).toHaveBeenCalledWith("svc-b", { status: "going_live" });
  });

  it("some stale, some fresh → only stale ones updated", async () => {
    const job = new StaleDetectionJob();
    mockRepo.findAll.mockResolvedValue([
      makeService({
        code: "svc-a",
        status: "online",
        is_behind_scaler: true,
        last_health_check_at: new Date(Date.now() - 100000),
      }),
      makeService({
        code: "svc-b",
        status: "online",
        is_behind_scaler: true,
        last_health_check_at: new Date(),
      }),
    ]);

    await (job as any).run();

    expect(mockRepo.updateByCode).toHaveBeenCalledTimes(1);
    expect(mockRepo.updateByCode).toHaveBeenCalledWith("svc-a", { status: "going_live" });
  });

  it("no services → no action", async () => {
    const job = new StaleDetectionJob();
    mockRepo.findAll.mockResolvedValue([]);

    await (job as any).run();

    expect(mockRepo.updateByCode).not.toHaveBeenCalled();
    expect(mockRepo.updateByCodeAndBaseUrl).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
