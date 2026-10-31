/**
 * Unit tests for `marker-persister.ts` — NATS `entity.*.*.changed` markers
 * are persisted into the Redis presence store (setChanged + markEdited).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  subscribe: vi.fn(),
  isConnected: vi.fn(() => true),
  store: {
    setChanged: vi.fn(async () => {}),
    markEdited: vi.fn(async () => {}),
  },
  getStore: vi.fn(),
  logger: { warn: vi.fn(), info: vi.fn(), done: vi.fn() },
}));

vi.mock("@primebrick/sdk", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@primebrick/sdk")>();
  return {
    ...orig,
    NatsClient: {
      ...orig.NatsClient,
      isConnected: mocks.isConnected,
      subscribe: mocks.subscribe,
    },
  };
});

vi.mock("../presence-store-holder.js", () => ({
  getPresenceStore: mocks.getStore,
}));

// Re-import per test to reset the module-level `started` flag.
async function freshModule() {
  vi.resetModules();
  return await import("../marker-persister.js");
}

describe("marker persister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isConnected.mockReturnValue(true);
    mocks.getStore.mockReturnValue(mocks.store);
    mocks.subscribe.mockResolvedValue({ unsubscribe: () => {} });
  });

  it("subscribes to entity.*.*.changed and persists markers", async () => {
    const { startMarkerPersister } = await freshModule();
    startMarkerPersister(mocks.logger as any);
    await vi.waitFor(() => expect(mocks.subscribe).toHaveBeenCalled());

    expect(mocks.subscribe.mock.calls[0]![0]).toBe("entity.*.*.changed");
    const handler = mocks.subscribe.mock.calls[0]![1] as (m: unknown) => Promise<void>;

    const marker = {
      entity_type: "job_rule",
      entity_uuid: "u-9",
      version: 7,
      audit_log_id: 42,
      changed_by: "user-uuid-b",
      changed_at: 1700000000000,
    };
    await handler(marker);

    expect(mocks.store.setChanged).toHaveBeenCalledWith(marker, 300_000);
    expect(mocks.store.markEdited).toHaveBeenCalledWith(
      "job_rule",
      "u-9",
      "user-uuid-b",
      1700000000000,
    );
  });

  it("self-retries on a 5s timer when NATS is not connected yet", async () => {
    vi.useFakeTimers();
    try {
      const { startMarkerPersister } = await freshModule();
      mocks.isConnected.mockReturnValue(false);
      startMarkerPersister(mocks.logger as any);
      expect(mocks.subscribe).not.toHaveBeenCalled();
      expect(mocks.logger.warn).toHaveBeenCalled();

      // NATS comes up later — the scheduled retry subscribes by itself.
      mocks.isConnected.mockReturnValue(true);
      await vi.advanceTimersByTimeAsync(5_000);
      expect(mocks.subscribe).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("resets `started` and retries when the subscribe call rejects", async () => {
    vi.useFakeTimers();
    try {
      const { startMarkerPersister } = await freshModule();
      mocks.subscribe.mockRejectedValueOnce(new Error("nats closed"));
      startMarkerPersister(mocks.logger as any);
      await vi.advanceTimersByTimeAsync(0);
      expect(mocks.subscribe).toHaveBeenCalledTimes(1);
      expect(mocks.logger.warn).toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(5_000);
      expect(mocks.subscribe).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("is idempotent — second start is a no-op", async () => {
    const { startMarkerPersister } = await freshModule();
    startMarkerPersister(mocks.logger as any);
    startMarkerPersister(mocks.logger as any);
    await vi.waitFor(() => expect(mocks.subscribe).toHaveBeenCalledTimes(1));
  });

  it("no-ops when the presence store is unavailable", async () => {
    mocks.getStore.mockReturnValue(null);
    const { startMarkerPersister } = await freshModule();
    startMarkerPersister(mocks.logger as any);
    await vi.waitFor(() => expect(mocks.subscribe).toHaveBeenCalled());
    const handler = mocks.subscribe.mock.calls[0]![1] as (m: unknown) => Promise<void>;
    await handler({ entity_type: "e", entity_uuid: "u" });
    expect(mocks.store.setChanged).not.toHaveBeenCalled();
  });

  it("swallows Redis errors (best-effort)", async () => {
    mocks.store.setChanged.mockRejectedValueOnce(new Error("redis down"));
    const { startMarkerPersister } = await freshModule();
    startMarkerPersister(mocks.logger as any);
    await vi.waitFor(() => expect(mocks.subscribe).toHaveBeenCalled());
    const handler = mocks.subscribe.mock.calls[0]![1] as (m: unknown) => Promise<void>;
    await expect(handler({ entity_type: "e", entity_uuid: "u" })).resolves.toBeUndefined();
  });
});
