import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the pool module
// Shared mock service instance — returned by every `new ServiceRegistryService()` call
const mockRepo = {
  findAll: vi.fn(),
  updateByCode: vi.fn(),
  updateByCodeAndBaseUrl: vi.fn(),
};

// Mock ServiceRegistryService — always returns the shared mockRepo instance
vi.mock("../../../modules/system/service-registry.service.js", () => ({
  ServiceRegistryService: vi.fn().mockImplementation(function () { return mockRepo; }),
}));

// Import after mock
import { logger } from "@primebrick/sdk";
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
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(logger, "error").mockImplementation(() => undefined);
    warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => undefined);
    mockRepo.findAll.mockReset();
    mockRepo.updateByCode.mockReset();
    mockRepo.updateByCodeAndBaseUrl.mockReset();
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
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
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("1 stale service (was online) → marked stale", async () => {
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

    expect(mockRepo.updateByCode).toHaveBeenCalledWith("svc-a", { status: "stale" });
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

  it("ALL services stale → NATS-outage error logged once per outage", async () => {
    const job = new StaleDetectionJob();
    const staleTime = new Date(Date.now() - 100000);
    mockRepo.findAll.mockResolvedValue([
      makeService({ code: "svc-a", status: "online", is_behind_scaler: true, last_health_check_at: staleTime }),
      makeService({ code: "svc-b", status: "stale", is_behind_scaler: true, last_health_check_at: staleTime }),
      makeService({ code: "svc-c", status: "offline", is_behind_scaler: true, last_health_check_at: staleTime }),
    ]);

    await (job as any).run();

    // Second poll: svc-a is now persisted stale → nothing is re-marked
    // and the outage alarm does not repeat.
    mockRepo.findAll.mockResolvedValue([
      makeService({ code: "svc-a", status: "stale", is_behind_scaler: true, last_health_check_at: staleTime }),
      makeService({ code: "svc-b", status: "stale", is_behind_scaler: true, last_health_check_at: staleTime }),
      makeService({ code: "svc-c", status: "offline", is_behind_scaler: true, last_health_check_at: staleTime }),
    ]);
    await (job as any).run();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const errorMsg = errorSpy.mock.calls[0][0] as string;
    expect(errorMsg).toContain("NATS outage suspected");
    // transition-only: svc-a marked stale once; svc-b already stale and
    // svc-c already offline are skipped — no re-marking, no repeated logs.
    expect(mockRepo.updateByCode).toHaveBeenCalledTimes(1);
    expect(mockRepo.updateByCode).toHaveBeenCalledWith("svc-a", { status: "stale" });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("is stale"), expect.anything());
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
    expect(mockRepo.updateByCode).toHaveBeenCalledWith("svc-a", { status: "stale" });
  });

  it("no services → no action", async () => {
    const job = new StaleDetectionJob();
    mockRepo.findAll.mockResolvedValue([]);

    await (job as any).run();

    expect(mockRepo.updateByCode).not.toHaveBeenCalled();
    expect(mockRepo.updateByCodeAndBaseUrl).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
