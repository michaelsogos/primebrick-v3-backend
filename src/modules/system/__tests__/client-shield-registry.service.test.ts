/**
 * Domain tests for ClientShieldRegistryService (B14):
 *  - enrollRegistryRow: stale-generation rejection, rotate-in with grace,
 *    static→derived upgrade;
 *  - rotateClientKey: derived generation bump with BE-precomputed hash,
 *    manual server-minted key, static-registry explicit-key requirement;
 *  - verifyDerivedClaim: HMAC(master,prefix) → derive(secret,prefix,gen).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { clientKeyHash, deriveClientKey } from "@primebrick/sdk";

const mocks = vi.hoisted(() => ({
  dal: {
    find: vi.fn(),
    findAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    restore: vi.fn(),
  },
  svc: {
    get: vi.fn(),
    update: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    restore: vi.fn(),
    audit: vi.fn(),
  },
  configEntries: {
    findByKey: vi.fn(),
  },
}));

vi.mock("../../../db/dal-gateway.js", () => ({
  getDal: () => mocks.dal,
}));

vi.mock("../../../http/entity-service.js", () => ({
  makeEntityService: () => mocks.svc,
}));

vi.mock("../../auth/services/config-entries.service.js", () => ({
  getConfigEntriesService: () => mocks.configEntries,
}));

import { ClientShieldRegistryService } from "../client-shield-registry.service.js";

const MASTER = "test-master-secret";
const PREFIX = "primebrick-ai/3.1.0";
// Mirrors the BE-side service-secret derivation (HMAC(master, ua_prefix)).
const { createHmac } = await import("node:crypto");
const SERVICE_SECRET = createHmac("sha256", MASTER).update(PREFIX).digest("base64url");

function derivedHash(generation: number): string {
  return clientKeyHash(deriveClientKey(SERVICE_SECRET, PREFIX, generation));
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.configEntries.findByKey.mockImplementation(async (key: string) =>
    key === "service_key_derivation_master" ? { value: MASTER } : null,
  );
});

describe("verifyDerivedClaim", () => {
  it("accepts the correctly derived material for the claimed generation", async () => {
    const svc = new ClientShieldRegistryService();
    await expect(svc.verifyDerivedClaim(PREFIX, 3, derivedHash(3))).resolves.toBe(true);
  });

  it("rejects material derived for a different generation", async () => {
    const svc = new ClientShieldRegistryService();
    await expect(svc.verifyDerivedClaim(PREFIX, 3, derivedHash(4))).resolves.toBe(false);
  });

  it("rejects when the master secret is not configured", async () => {
    mocks.configEntries.findByKey.mockResolvedValue(null);
    const svc = new ClientShieldRegistryService();
    await expect(svc.verifyDerivedClaim(PREFIX, 3, derivedHash(3))).resolves.toBe(false);
  });
});

describe("enrollRegistryRow — generation semantics", () => {
  const baseRow = {
    uuid: "u1",
    ua_prefix: PREFIX,
    client_key_hash: derivedHash(3),
    source: "registry",
    is_enabled: true,
    key_mode: "derived",
    key_generation: 3,
    previous_key_hash: null,
    previous_valid_until: null,
    version: 7,
    deleted_at: null,
  };

  it("reports stale_generation when the claim is older than the issued generation", async () => {
    mocks.dal.find.mockResolvedValue({ ...baseRow });
    const svc = new ClientShieldRegistryService();
    const out = await svc.enrollRegistryRow(PREFIX, derivedHash(0), "test", {
      keyMode: "derived",
      keyGeneration: 0,
    });
    expect(out).toEqual({ outcome: "stale_generation", key_generation: 3 });
    expect(mocks.dal.update).not.toHaveBeenCalled();
  });

  it("rotates the hash in with grace when the claimed generation matches", async () => {
    mocks.dal.find.mockResolvedValue({ ...baseRow });
    const svc = new ClientShieldRegistryService();
    const out = await svc.enrollRegistryRow(PREFIX, derivedHash(4), "test", {
      keyMode: "derived",
      keyGeneration: 4,
    });
    expect(out.outcome).toBe("enrolled");
    const patch = mocks.dal.update.mock.calls[0][1] as Record<string, unknown>;
    expect(patch.client_key_hash).toBe(derivedHash(4));
    expect(patch.previous_key_hash).toBe(derivedHash(3));
    expect(patch.key_generation).toBe(4);
    expect(patch.previous_valid_until).toBeInstanceOf(Date);
    expect(patch.key_rotated_at).toBeInstanceOf(Date);
  });

  it("upgrades a static row to derived on first derived claim", async () => {
    mocks.dal.find.mockResolvedValue({ ...baseRow, key_mode: "static", key_generation: 0 });
    const svc = new ClientShieldRegistryService();
    await svc.enrollRegistryRow(PREFIX, derivedHash(1), "test", {
      keyMode: "derived",
      keyGeneration: 1,
    });
    const patch = mocks.dal.update.mock.calls[0][1] as Record<string, unknown>;
    expect(patch.key_mode).toBe("derived");
    expect(patch.key_generation).toBe(1);
  });

  it("leaves manual rows untouched", async () => {
    mocks.dal.find.mockResolvedValue({ ...baseRow, source: "manual" });
    const svc = new ClientShieldRegistryService();
    const out = await svc.enrollRegistryRow(PREFIX, "whatever", "test", { keyMode: "derived", keyGeneration: 9 });
    expect(out.outcome).toBe("enrolled");
    expect(mocks.dal.update).not.toHaveBeenCalled();
  });
});

describe("rotateClientKey", () => {
  it("derived row: bumps generation and pre-computes the next derived hash", async () => {
    const row = {
      uuid: "u1",
      ua_prefix: PREFIX,
      client_key_hash: derivedHash(3),
      source: "registry",
      key_mode: "derived",
      key_generation: 3,
      version: 7,
    };
    mocks.svc.get.mockResolvedValue({ ...row });
    mocks.svc.update.mockResolvedValue({ ...row, key_generation: 4 });
    const svc = new ClientShieldRegistryService();
    const result = await svc.rotateClientKey("u1", {});
    const patch = mocks.svc.update.mock.calls[0][1] as Record<string, unknown>;
    expect(patch.key_generation).toBe(4);
    expect(patch.client_key_hash).toBe(derivedHash(4));
    expect(patch.previous_key_hash).toBe(derivedHash(3));
    expect((result as Record<string, unknown>).key_generation).toBe(4);
  });

  it("manual row without client_key: server-mints and echoes it once", async () => {
    const row = {
      uuid: "u1",
      ua_prefix: "postman/",
      client_key_hash: "old-hash",
      source: "manual",
      key_mode: "static",
      key_generation: 0,
      version: 2,
    };
    mocks.svc.get.mockResolvedValue({ ...row });
    mocks.svc.update.mockResolvedValue({ ...row });
    const svc = new ClientShieldRegistryService();
    const result = (await svc.rotateClientKey("u1", {})) as { client_key?: string };
    expect(result.client_key).toBeTruthy();
    const patch = mocks.svc.update.mock.calls[0][1] as Record<string, unknown>;
    expect(patch.client_key_hash).toBe(clientKeyHash(result.client_key!));
    expect(patch.previous_key_hash).toBe("old-hash");
  });

  it("static registry row without client_key: rejected", async () => {
    const row = {
      uuid: "u1",
      ua_prefix: PREFIX,
      client_key_hash: "h",
      source: "registry",
      key_mode: "static",
      key_generation: 0,
      version: 1,
    };
    mocks.svc.get.mockResolvedValue({ ...row });
    const svc = new ClientShieldRegistryService();
    await expect(svc.rotateClientKey("u1", {})).rejects.toMatchObject({
      internal_code: "CLIENT_REGISTRY_ROTATE_KEY_REQUIRED",
    });
  });

  it("derived row without master secret: rejected", async () => {
    mocks.configEntries.findByKey.mockResolvedValue(null);
    mocks.svc.get.mockResolvedValue({
      uuid: "u1",
      ua_prefix: PREFIX,
      client_key_hash: "h",
      source: "registry",
      key_mode: "derived",
      key_generation: 0,
      version: 1,
    });
    const svc = new ClientShieldRegistryService();
    await expect(svc.rotateClientKey("u1", {})).rejects.toMatchObject({
      internal_code: "CLIENT_REGISTRY_DERIVATION_MASTER_MISSING",
    });
  });
});
