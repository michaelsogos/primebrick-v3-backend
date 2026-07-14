import { describe, it, expect, vi, beforeEach } from "vitest";
import { Permission } from "@primebrick/sdk";
import type { AuthInfo } from "@modelcontextprotocol/server";

// Mock the pool module (used by dispatch for service construction)
vi.mock("../../../db/pool.js", () => ({
  getPool: vi.fn(() => ({})),
}));

// Mock BE services so we can spy on dispatch calls
const mockCustomersService = {
  listCustomers: vi.fn(),
  getCustomer: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  restoreCustomer: vi.fn(),
  getCustomerAudit: vi.fn(),
};
const mockOrganizationsService = {
  listOrganizations: vi.fn(),
  getOrganization: vi.fn(),
  createOrganization: vi.fn(),
  updateOrganization: vi.fn(),
  deleteOrganization: vi.fn(),
  restoreOrganization: vi.fn(),
  getOrganizationAudit: vi.fn(),
};
const mockUserService = {
  listUsers: vi.fn(),
  getUserByUuid: vi.fn(),
  createUser: vi.fn(),
  updateUserProfile: vi.fn(),
  deleteUser: vi.fn(),
  restoreUser: vi.fn(),
  getUserProfileAudit: vi.fn(),
};

vi.mock("../../customers/customers.service.js", () => ({
  CustomersService: vi.fn().mockImplementation(function () { return mockCustomersService; }),
}));
vi.mock("../../auth/services/organizations.service.js", () => ({
  OrganizationsService: vi.fn().mockImplementation(function () { return mockOrganizationsService; }),
}));
vi.mock("../../auth/services/user.service.js", () => ({
  UserService: vi.fn().mockImplementation(function () { return mockUserService; }),
}));
vi.mock("../../auth/user-profiles-dal.js", () => ({
  UserProfilesDal: vi.fn().mockImplementation(function () { return ({}); }),
}));
vi.mock("../../auth/services/casdoor.service.js", () => ({
  CasdoorService: vi.fn().mockImplementation(function () { return ({}); }),
}));

// Mock meta files
vi.mock("../../customers/customers.meta.js", () => ({
  customerMeta: { entity: "customer", fields: [] },
}));
vi.mock("../../auth/organizations.meta.js", () => ({
  organizationMeta: { entity: "organization", fields: [] },
}));
vi.mock("../../auth/user-profiles.meta.js", () => ({
  userProfileMeta: { entity: "user_profiles", fields: [] },
}));

// Mock ServiceRegistryRepo
const mockRepo = {
  findAll: vi.fn(),
  findByCode: vi.fn(),
  toggleEnabled: vi.fn(),
  updateByCodeAdmin: vi.fn(),
  hardDeleteByCode: vi.fn(),
};
vi.mock("../../proxy/service-registry-repo.js", () => ({
  ServiceRegistryRepo: vi.fn().mockImplementation(function () { return mockRepo; }),
}));

// Import after mocks
import {
  checkRbac,
  RbacDeniedError,
  EntityNotFoundError,
  OperationNotSupportedError,
  dispatchBeList,
  dispatchBeGet,
  dispatchBeCreate,
  dispatchBeUpdate,
  dispatchBeDelete,
  dispatchBeRestore,
  dispatchBeAudit,
  dispatchBeMeta,
  dispatchBeBulk,
  listServices,
  getService,
  activateService,
  updateService,
  deleteService,
} from "../tools/dispatch.js";
import { entityRegistry, registerBeEntities } from "../tools/entity-registry.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAuthInfo(overrides: Partial<AuthInfo> = {}): AuthInfo {
  return {
    token: "test-token",
    clientId: "test-client",
    scopes: [],
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    extra: {
      user_id: "user-uuid",
      email: "test@example.com",
      name: "Test User",
      roles: ["collaborator"],
      is_admin: false,
      is_system: false,
      idp_code: "admin/acme",
      idp_org: "acme",
      idp_username: "testuser",
      permissions: [],
      raw_access_token: "raw-jwt-token",
    },
    ...overrides,
  };
}

function makeAdminAuthInfo(): AuthInfo {
  return makeAuthInfo({
    extra: {
      user_id: "admin-uuid",
      email: "admin@example.com",
      name: "Admin",
      roles: ["administrators"],
      is_admin: true,
      is_system: false,
      idp_code: "admin/acme",
      idp_org: "acme",
      idp_username: "admin",
      permissions: ["*"],
      raw_access_token: "raw-admin-jwt",
    },
  });
}

function makeAuthInfoWithPermissions(perms: string[]): AuthInfo {
  return makeAuthInfo({
    extra: {
      user_id: "user-uuid",
      email: "user@example.com",
      name: "User",
      roles: ["collaborator"],
      is_admin: false,
      is_system: false,
      idp_code: "admin/acme",
      idp_org: "acme",
      idp_username: "user",
      permissions: perms,
      raw_access_token: "raw-jwt",
    },
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("MCP Dispatch — Error classes", () => {
  it("RbacDeniedError has correct name and message", () => {
    const err = new RbacDeniedError("Permission denied: requires customers.read.all");
    expect(err.name).toBe("RbacDeniedError");
    expect(err.message).toBe("Permission denied: requires customers.read.all");
    expect(err instanceof Error).toBe(true);
  });

  it("EntityNotFoundError has correct name and message", () => {
    const err = new EntityNotFoundError("be", "nonexistent");
    expect(err.name).toBe("EntityNotFoundError");
    expect(err.message).toContain("be/nonexistent");
    expect(err.message).toContain("list_available_entities");
  });

  it("OperationNotSupportedError has correct name and message", () => {
    const err = new OperationNotSupportedError("be", "user_profiles", "create");
    expect(err.name).toBe("OperationNotSupportedError");
    expect(err.message).toContain("create");
    expect(err.message).toContain("be/user_profiles");
  });
});

describe("MCP Dispatch — checkRbac", () => {
  beforeEach(() => {
    entityRegistry.clear();
    registerBeEntities();
  });

  it("admin user bypasses all permission checks", () => {
    const adminAuth = makeAdminAuthInfo();
    // Should not throw for any operation
    expect(() => checkRbac(adminAuth, "be", "customer", "list")).not.toThrow();
    expect(() => checkRbac(adminAuth, "be", "customer", "delete")).not.toThrow();
    expect(() => checkRbac(adminAuth, "be", "organization", "create")).not.toThrow();
  });

  it("throws RbacDeniedError when user lacks required permissions", () => {
    const userAuth = makeAuthInfoWithPermissions([]); // no permissions
    expect(() => checkRbac(userAuth, "be", "customer", "list")).toThrow(RbacDeniedError);
    expect(() => checkRbac(userAuth, "be", "customer", "create")).toThrow(RbacDeniedError);
  });

  it("passes when user has the required permission (any-of semantics)", () => {
    const userAuth = makeAuthInfoWithPermissions([Permission.CUSTOMERS_READ_ALL]);
    expect(() => checkRbac(userAuth, "be", "customer", "list")).not.toThrow();
    // get requires CUSTOMERS_READ_SINGLE OR CUSTOMERS_READ_ALL
    expect(() => checkRbac(userAuth, "be", "customer", "get")).not.toThrow();
  });

  it("passes when user has wildcard permission", () => {
    const userAuth = makeAuthInfoWithPermissions(["customers.*"]);
    expect(() => checkRbac(userAuth, "be", "customer", "list")).not.toThrow();
    expect(() => checkRbac(userAuth, "be", "customer", "create")).not.toThrow();
    expect(() => checkRbac(userAuth, "be", "customer", "delete")).not.toThrow();
  });

  it("throws EntityNotFoundError for unknown entity", () => {
    const userAuth = makeAuthInfoWithPermissions([]);
    expect(() => checkRbac(userAuth, "be", "nonexistent", "list")).toThrow();
  });

  it("passes for proxy entities (RBAC enforced by microservice)", () => {
    entityRegistry.registerProxyEntity("emailsender", {
      entity: "providers",
      label: "Providers",
      supported_operations: ["list"],
    });
    const userAuth = makeAuthInfoWithPermissions([]); // no permissions
    // Proxy entities skip RBAC — the microservice enforces its own
    expect(() => checkRbac(userAuth, "emailsender", "providers", "list")).not.toThrow();
  });
});

describe("MCP Dispatch — BE in-process dispatch", () => {
  beforeEach(() => {
    entityRegistry.clear();
    registerBeEntities();
    vi.clearAllMocks();
  });

  it("dispatchBeList calls CustomersService.listCustomers for customer", async () => {
    mockCustomersService.listCustomers.mockResolvedValue({ rows: [], total: 0 });
    const result = await dispatchBeList("customer", { page: 1, page_size: 10 });
    expect(mockCustomersService.listCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 }),
    );
    expect(result).toEqual({ rows: [], total: 0 });
  });

  it("dispatchBeList calls OrganizationsService for organization", async () => {
    mockOrganizationsService.listOrganizations.mockResolvedValue({ rows: [], total: 0 });
    await dispatchBeList("organization", { page: 2, page_size: 5 });
    expect(mockOrganizationsService.listOrganizations).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, page_size: 5 }),
    );
  });

  it("dispatchBeList calls UserService for user_profiles", async () => {
    mockUserService.listUsers.mockResolvedValue({ rows: [], total: 0 });
    await dispatchBeList("user_profiles", { page: 1 });
    expect(mockUserService.listUsers).toHaveBeenCalled();
  });

  it("dispatchBeList throws EntityNotFoundError for unknown entity", async () => {
    await expect(dispatchBeList("nonexistent", {})).rejects.toThrow(EntityNotFoundError);
  });

  it("dispatchBeList applies default pagination", async () => {
    mockCustomersService.listCustomers.mockResolvedValue({ rows: [], total: 0 });
    await dispatchBeList("customer", {});
    expect(mockCustomersService.listCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 25, deleted_records: "EXCLUDED" }),
    );
  });

  it("dispatchBeGet calls getCustomer with uuid", async () => {
    mockCustomersService.getCustomer.mockResolvedValue({ uuid: "abc" });
    await dispatchBeGet("customer", "abc");
    expect(mockCustomersService.getCustomer).toHaveBeenCalledWith("abc");
  });

  it("dispatchBeCreate calls createCustomer with data", async () => {
    mockCustomersService.createCustomer.mockResolvedValue({ uuid: "new" });
    await dispatchBeCreate("customer", { first_name: "John" });
    expect(mockCustomersService.createCustomer).toHaveBeenCalledWith({ first_name: "John" });
  });

  it("dispatchBeUpdate calls updateCustomer and returns success", async () => {
    mockCustomersService.updateCustomer.mockResolvedValue(undefined);
    const result = await dispatchBeUpdate("customer", "abc", { first_name: "Jane" });
    expect(mockCustomersService.updateCustomer).toHaveBeenCalledWith("abc", { first_name: "Jane" });
    expect(result).toEqual({ success: true });
  });

  it("dispatchBeDelete calls deleteCustomer and returns success", async () => {
    mockCustomersService.deleteCustomer.mockResolvedValue(undefined);
    const result = await dispatchBeDelete("customer", "abc");
    expect(mockCustomersService.deleteCustomer).toHaveBeenCalledWith("abc");
    expect(result).toEqual({ success: true });
  });

  it("dispatchBeRestore calls restoreCustomer and returns success", async () => {
    mockCustomersService.restoreCustomer.mockResolvedValue(undefined);
    const result = await dispatchBeRestore("customer", "abc");
    expect(mockCustomersService.restoreCustomer).toHaveBeenCalledWith("abc");
    expect(result).toEqual({ success: true });
  });

  it("dispatchBeAudit calls getCustomerAudit with uuid, page, limit", async () => {
    mockCustomersService.getCustomerAudit.mockResolvedValue({ rows: [], total: 0 });
    await dispatchBeAudit("customer", "abc", 2, 50);
    expect(mockCustomersService.getCustomerAudit).toHaveBeenCalledWith("abc", 2, 50);
  });

  it("dispatchBeMeta returns customerMeta for customer", async () => {
    const result = await dispatchBeMeta("customer");
    expect(result).toEqual({ entity: "customer", fields: [] });
  });

  it("dispatchBeMeta returns organizationMeta for organization", async () => {
    const result = await dispatchBeMeta("organization");
    expect(result).toEqual({ entity: "organization", fields: [] });
  });

  it("dispatchBeMeta throws EntityNotFoundError for unknown entity", async () => {
    await expect(dispatchBeMeta("nonexistent")).rejects.toThrow(EntityNotFoundError);
  });
});

describe("MCP Dispatch — BE bulk dispatch", () => {
  beforeEach(() => {
    entityRegistry.clear();
    registerBeEntities();
    vi.clearAllMocks();
  });

  it("dispatchBeBulk delete processes all UUIDs and returns per-UUID results", async () => {
    mockCustomersService.deleteCustomer.mockResolvedValue(undefined);
    const result = await dispatchBeBulk("customer", "delete", ["uuid-1", "uuid-2", "uuid-3"]);
    expect(mockCustomersService.deleteCustomer).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      results: [
        { uuid: "uuid-1", success: true },
        { uuid: "uuid-2", success: true },
        { uuid: "uuid-3", success: true },
      ],
    });
  });

  it("dispatchBeBulk restore processes all UUIDs", async () => {
    mockCustomersService.restoreCustomer.mockResolvedValue(undefined);
    const result = await dispatchBeBulk("customer", "restore", ["uuid-1"]);
    expect(mockCustomersService.restoreCustomer).toHaveBeenCalledWith("uuid-1");
    expect(result).toEqual({ results: [{ uuid: "uuid-1", success: true }] });
  });

  it("dispatchBeBulk records errors for failed operations", async () => {
    mockCustomersService.deleteCustomer
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Not found"));

    const result = await dispatchBeBulk("customer", "delete", ["ok-uuid", "bad-uuid"]);
    const results = result as { results: Array<{ uuid: string; success: boolean; error?: string }> };
    expect(results.results).toHaveLength(2);
    expect(results.results[0]).toEqual({ uuid: "ok-uuid", success: true });
    expect(results.results[1].success).toBe(false);
    expect(results.results[1].error).toBe("Not found");
  });
});

describe("MCP Dispatch — Service registry (manage_service)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listServices returns all services from repo", async () => {
    mockRepo.findAll.mockResolvedValue([
      { code: "EMAILSENDER", is_enabled: true },
      { code: "home", is_enabled: true },
    ]);
    const result = await listServices();
    expect(mockRepo.findAll).toHaveBeenCalled();
    expect(result).toEqual({
      services: [
        { code: "EMAILSENDER", is_enabled: true },
        { code: "home", is_enabled: true },
      ],
    });
  });

  it("getService returns service by code", async () => {
    mockRepo.findByCode.mockResolvedValue({ code: "EMAILSENDER", is_enabled: true });
    const result = await getService("EMAILSENDER");
    expect(mockRepo.findByCode).toHaveBeenCalledWith("EMAILSENDER");
    expect(result).toEqual({ service: { code: "EMAILSENDER", is_enabled: true } });
  });

  it("getService throws when service not found", async () => {
    mockRepo.findByCode.mockResolvedValue(null);
    await expect(getService("UNKNOWN")).rejects.toThrow("Service 'UNKNOWN' not found");
  });

  it("activateService toggles is_enabled", async () => {
    mockRepo.findByCode.mockResolvedValue({ code: "EMAILSENDER", is_enabled: true });
    mockRepo.toggleEnabled.mockResolvedValue(undefined);
    const result = await activateService("EMAILSENDER");
    expect(mockRepo.toggleEnabled).toHaveBeenCalledWith("EMAILSENDER", false);
    expect(result).toEqual({ code: "EMAILSENDER", is_enabled: false });
  });

  it("activateService throws when service not found", async () => {
    mockRepo.findByCode.mockResolvedValue(null);
    await expect(activateService("UNKNOWN")).rejects.toThrow("Service 'UNKNOWN' not found");
  });

  it("updateService updates and returns the updated service", async () => {
    mockRepo.findByCode
      .mockResolvedValueOnce({ code: "EMAILSENDER", is_enabled: true })
      .mockResolvedValueOnce({ code: "EMAILSENDER", name: "Updated", is_enabled: true });
    mockRepo.updateByCodeAdmin.mockResolvedValue(undefined);

    const result = await updateService("EMAILSENDER", { name: "Updated" });
    expect(mockRepo.updateByCodeAdmin).toHaveBeenCalledWith(
      "EMAILSENDER",
      expect.objectContaining({ name: "Updated" }),
    );
    expect(result).toEqual({ service: { code: "EMAILSENDER", name: "Updated", is_enabled: true } });
  });

  it("deleteService hard-deletes and returns permanent: true", async () => {
    mockRepo.findByCode.mockResolvedValue({ code: "EMAILSENDER", is_enabled: true });
    mockRepo.hardDeleteByCode.mockResolvedValue(undefined);
    const result = await deleteService("EMAILSENDER");
    expect(mockRepo.hardDeleteByCode).toHaveBeenCalledWith("EMAILSENDER");
    expect(result).toEqual({ code: "EMAILSENDER", deleted: true, permanent: true });
  });

  it("deleteService throws when service not found", async () => {
    mockRepo.findByCode.mockResolvedValue(null);
    await expect(deleteService("UNKNOWN")).rejects.toThrow("Service 'UNKNOWN' not found");
  });
});
