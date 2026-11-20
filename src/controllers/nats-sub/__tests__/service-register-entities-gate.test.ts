import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Enrollment gate for `endpoints.entities` — the entity→service document
 * served on /modules feeds the FE's api-base resolution, so a malformed
 * declaration must be refused BEFORE it reaches service_registry. The gate
 * mirrors the nav/events/callables validators in the same handler.
 *
 * The handler is captured from makeNatsRequestRoute — the same callback
 * NATS invokes — so the test exercises the real gate sequence, not a
 * re-implementation.
 */

const captured: { handler?: (arg: { request: unknown }) => Promise<unknown> } = {};

vi.mock("@primebrick/sdk", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@primebrick/sdk")>();
  return {
    ...mod,
    makeNatsRequestRoute: vi.fn(async (routes: { handler: (arg: { request: unknown }) => Promise<unknown> }[]) => {
      captured.handler = routes[0].handler;
    }),
    NatsClient: { subscribe: vi.fn(async () => undefined), publish: vi.fn(async () => undefined) },
    setNatsShieldRegistry: vi.fn(),
  };
});

vi.mock("../publisher-identity.js", () => ({
  createPublisherVerifier: () => ({
    asRouteVerify: () => async () => true,
    verify: async () => true,
    invalidate: () => undefined,
    shieldRegistry: {},
  }),
}));

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
  findAll: vi.fn(),
};

vi.mock("../../../modules/system/service-registry.service.js", () => ({
  ServiceRegistryService: vi.fn().mockImplementation(function () { return mockRepo; }),
}));

vi.mock("../../../modules/proxy/service-events-bus.js", () => ({
  serviceEventsBus: { emit: vi.fn() },
}));

vi.mock("../../../modules/mcp/tools/openapi-discovery.js", () => ({
  discoverEntitiesFromService: vi.fn(async () => []),
}));

vi.mock("../../../modules/mcp/tools/entity-registry.js", () => ({
  entityRegistry: { registerServiceEntities: vi.fn(), removeService: vi.fn() },
}));

import { ServiceLifecycleSubscriber } from "../service-lifecycle-subscriber.js";

import { extJsonStringify } from '@primebrick/sdk';
function registerPayload(entities: unknown) {
  return {
    code: "svc_a",
    base_url: "http://localhost:8000",
    part_of: "system",
    is_behind_scaler: true,
    http_healthy: true,
    nats_connected: true,
    service_version: "1.0.0",
    name: "Service A",
    schemas: [],
    endpoints: entities === "__absent__" ? {} : { entities },
  };
}

describe("service.register — endpoints.entities enrollment gate", () => {
  beforeEach(async () => {
    for (const fn of Object.values(mockRepo)) fn.mockReset();
    mockRepo.findByCode.mockResolvedValue(null);
    mockRepo.findDeletedByCode.mockResolvedValue(null);
    mockRepo.findAllByCode.mockResolvedValue([]);
    mockRepo.findAll.mockResolvedValue([]);
    mockRepo.insert.mockResolvedValue(undefined);
    await new ServiceLifecycleSubscriber().start();
    expect(captured.handler).toBeTypeOf("function");
  });

  it("non-array entities → rejected before persistence", async () => {
    for (const bad of ["job_schedule", 42, { list: [] }, true]) {
      const res = (await captured.handler!({ request: registerPayload(bad) })) as { registered: boolean; error?: string };
      expect(res.registered, String(bad)).toBe(false);
      expect(res.error).toMatch(/endpoints\.entities/);
    }
    expect(mockRepo.insert).not.toHaveBeenCalled();
  });

  it("malformed entries + duplicates → rejected", async () => {
    for (const bad of [["JobSchedule"], ["job-schedule"], [42], ["job_run", "job_run"]]) {
      const res = (await captured.handler!({ request: registerPayload(bad) })) as { registered: boolean; error?: string };
      expect(res.registered, extJsonStringify(bad)).toBe(false);
      expect(res.error).toMatch(/endpoints\.entities/);
    }
    expect(mockRepo.insert).not.toHaveBeenCalled();
  });

  it("well-formed entities pass the gate and reach persistence", async () => {
    const res = (await captured.handler!({ request: registerPayload(["job_run", "job_schedule"]) })) as { registered: boolean; error?: string };
    expect(res.error).toBeUndefined();
    expect(res.registered).toBe(true);
    expect(mockRepo.insert).toHaveBeenCalledTimes(1);
    // The declaration lands verbatim on the persisted row — /modules
    // serves exactly what enrollment validated.
    const row = mockRepo.insert.mock.calls[0][0] as { endpoints: { entities: string[] } };
    expect(row.endpoints.entities).toEqual(["job_run", "job_schedule"]);
  });

  it("absent entities (headless/legacy) — optional axis, still registers", async () => {
    const res = (await captured.handler!({ request: registerPayload("__absent__") })) as { registered: boolean };
    expect(res.registered).toBe(true);
  });
});
