import { describe, it, expect, vi, beforeEach } from "vitest";
import { Permission } from "@primebrick/sdk";
import type { AuthInfo } from "@modelcontextprotocol/server";


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
  getUserService: vi.fn(() => mockUserService),
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
  userProfileMeta: { entity: "user_profile", fields: [] },
}));

// Mock ServiceRegistryService — the dal-level seam; SystemService runs for
// real so find→toggle/find→delete domain logic stays covered.
const mockRepo = {
  findAll: vi.fn(),
  findByCode: vi.fn(),
  toggleEnabled: vi.fn(),
  updateByCodeAdmin: vi.fn(),
  deleteByCode: vi.fn(),
};
vi.mock("../../system/service-registry.service.js", () => ({
  ServiceRegistryService: vi.fn().mockImplementation(function () { return mockRepo; }),
}));

// Import after mocks
import {
  checkRbac,
  RbacDeniedError,
  EntityNotFoundError,
  OperationNotSupportedError,
  dispatchLocalList,
  dispatchLocalGet,
  dispatchLocalCreate,
  dispatchLocalUpdate,
  dispatchLocalDelete,
  dispatchLocalRestore,
  dispatchLocalAudit,
  dispatchLocalMeta,
  dispatchLocalBulk,
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
      idp_code: "test-admin/acme",
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
      user_id: "test-admin-uuid",
      email: "test-admin@example.com",
      name: "Test Admin",
      roles: ["administrators"],
      is_admin: true,
      is_system: false,
      idp_code: "test-admin/acme",
      idp_org: "acme",
      idp_username: "test-admin",
      permissions: ["*"],
      raw_access_token: "raw-test-admin-jwt",
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
      idp_code: "test-admin/acme",
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
    const err = new OperationNotSupportedError("be", "user_profile", "create");
    expect(err.name).toBe("OperationNotSupportedError");
    expect(err.message).toContain("create");
    expect(err.message).toContain("be/user_profile");
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
    const userAuth = makeAuthInfoWithPermissions([Permission.CUSTOMER_READ_ALL]);
    expect(() => checkRbac(userAuth, "be", "customer", "list")).not.toThrow();
    // get requires CUSTOMER_READ_SINGLE OR CUSTOMER_READ_ALL
    expect(() => checkRbac(userAuth, "be", "customer", "get")).not.toThrow();
  });

  it("passes when user has wildcard permission", () => {
    const userAuth = makeAuthInfoWithPermissions(["customer.*"]);
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
      entity: "provider",
      label: "Providers",
      supported_operations: ["list"],
    });
    const userAuth = makeAuthInfoWithPermissions([]); // no permissions
    // Proxy entities skip RBAC — the microservice enforces its own
    expect(() => checkRbac(userAuth, "emailsender", "provider", "list")).not.toThrow();
  });
});

describe("MCP Dispatch — BE in-process dispatch", () => {
  beforeEach(() => {
    entityRegistry.clear();
    registerBeEntities();
    vi.clearAllMocks();
  });

  it("dispatchLocalList calls CustomersService.listCustomers for customer", async () => {
    mockCustomersService.listCustomers.mockResolvedValue({ rows: [], total: 0 });
    const result = await dispatchLocalList("customer", { page: 1, page_size: 10 });
    expect(mockCustomersService.listCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 }),
    );
    expect(result).toEqual({ rows: [], total: 0 });
  });

  it("dispatchLocalList calls OrganizationsService for organization", async () => {
    mockOrganizationsService.listOrganizations.mockResolvedValue({ rows: [], total: 0 });
    await dispatchLocalList("organization", { page: 2, page_size: 5 });
    expect(mockOrganizationsService.listOrganizations).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, page_size: 5 }),
    );
  });

  it("dispatchLocalList calls UserService for user_profile", async () => {
    mockUserService.listUsers.mockResolvedValue({ rows: [], total: 0 });
    await dispatchLocalList("user_profile", { page: 1 });
    expect(mockUserService.listUsers).toHaveBeenCalled();
  });

  it("dispatchLocalList throws EntityNotFoundError for unknown entity", async () => {
    await expect(dispatchLocalList("nonexistent", {})).rejects.toThrow(EntityNotFoundError);
  });

  it("dispatchLocalList applies default pagination", async () => {
    mockCustomersService.listCustomers.mockResolvedValue({ rows: [], total: 0 });
    await dispatchLocalList("customer", {});
    expect(mockCustomersService.listCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 25, deleted_records: "EXCLUDED" }),
    );
  });

  it("dispatchLocalGet calls getCustomer with uuid", async () => {
    mockCustomersService.getCustomer.mockResolvedValue({ uuid: "abc" });
    await dispatchLocalGet("customer", "abc");
    expect(mockCustomersService.getCustomer).toHaveBeenCalledWith("abc");
  });

  it("dispatchLocalCreate calls createCustomer with data", async () => {
    mockCustomersService.createCustomer.mockResolvedValue({ uuid: "new" });
    await dispatchLocalCreate("customer", { first_name: "John" });
    expect(mockCustomersService.createCustomer).toHaveBeenCalledWith({ first_name: "John" });
  });

  it("dispatchLocalUpdate calls updateCustomer and returns success", async () => {
    mockCustomersService.updateCustomer.mockResolvedValue(undefined);
    const result = await dispatchLocalUpdate("customer", "abc", { first_name: "Jane" });
    expect(mockCustomersService.updateCustomer).toHaveBeenCalledWith("abc", { first_name: "Jane" });
    expect(result).toEqual({ success: true });
  });

  it("dispatchLocalDelete calls deleteCustomer and returns success", async () => {
    mockCustomersService.deleteCustomer.mockResolvedValue(undefined);
    const result = await dispatchLocalDelete("customer", "abc", 3);
    expect(mockCustomersService.deleteCustomer).toHaveBeenCalledWith("abc", 3);
    expect(result).toEqual({ success: true });
  });

  it("dispatchLocalRestore calls restoreCustomer and returns success", async () => {
    mockCustomersService.restoreCustomer.mockResolvedValue(undefined);
    const result = await dispatchLocalRestore("customer", "abc", 3);
    expect(mockCustomersService.restoreCustomer).toHaveBeenCalledWith("abc", 3);
    expect(result).toEqual({ success: true });
  });

  it("dispatchLocalAudit calls getCustomerAudit with uuid, page, limit", async () => {
    mockCustomersService.getCustomerAudit.mockResolvedValue({ rows: [], total: 0 });
    await dispatchLocalAudit("customer", "abc", 2, 50);
    expect(mockCustomersService.getCustomerAudit).toHaveBeenCalledWith("abc", 2, 50);
  });

  it("dispatchLocalMeta returns customerMeta for customer", async () => {
    const result = await dispatchLocalMeta("customer");
    expect(result).toEqual({ entity: "customer", fields: [] });
  });

  it("dispatchLocalMeta returns organizationMeta for organization", async () => {
    const result = await dispatchLocalMeta("organization");
    expect(result).toEqual({ entity: "organization", fields: [] });
  });

  it("dispatchLocalMeta throws EntityNotFoundError for unknown entity", async () => {
    await expect(dispatchLocalMeta("nonexistent")).rejects.toThrow(EntityNotFoundError);
  });
});

describe("MCP Dispatch — BE bulk dispatch", () => {
  beforeEach(() => {
    entityRegistry.clear();
    registerBeEntities();
    vi.clearAllMocks();
  });

  it("dispatchLocalBulk delete processes all UUIDs and returns per-UUID results", async () => {
    mockCustomersService.deleteCustomer.mockResolvedValue(undefined);
    const result = await dispatchLocalBulk("customer", "delete", [{ uuid: "uuid-1", version: 1 }, { uuid: "uuid-2", version: 1 }, { uuid: "uuid-3", version: 1 }]);
    expect(mockCustomersService.deleteCustomer).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      results: [
        { uuid: "uuid-1", success: true },
        { uuid: "uuid-2", success: true },
        { uuid: "uuid-3", success: true },
      ],
    });
  });

  it("dispatchLocalBulk restore processes all UUIDs", async () => {
    mockCustomersService.restoreCustomer.mockResolvedValue(undefined);
    const result = await dispatchLocalBulk("customer", "restore", [{ uuid: "uuid-1", version: 2 }]);
    expect(mockCustomersService.restoreCustomer).toHaveBeenCalledWith("uuid-1", 2);
    expect(result).toEqual({ results: [{ uuid: "uuid-1", success: true }] });
  });

  it("dispatchLocalBulk records errors for failed operations", async () => {
    mockCustomersService.deleteCustomer
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Not found"));

    const result = await dispatchLocalBulk("customer", "delete", [{ uuid: "ok-uuid", version: 1 }, { uuid: "bad-uuid", version: 1 }]);
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
      { code: "emailsender", is_enabled: true },
      { code: "home", is_enabled: true },
    ]);
    const result = await listServices();
    expect(mockRepo.findAll).toHaveBeenCalled();
    expect(result).toEqual({
      services: [
        { code: "emailsender", is_enabled: true },
        { code: "home", is_enabled: true },
      ],
    });
  });

  it("getService returns service by code", async () => {
    mockRepo.findByCode.mockResolvedValue({ code: "emailsender", is_enabled: true });
    const result = await getService("emailsender");
    expect(mockRepo.findByCode).toHaveBeenCalledWith("emailsender");
    expect(result).toEqual({ service: { code: "emailsender", is_enabled: true } });
  });

  it("getService throws when service not found", async () => {
    mockRepo.findByCode.mockResolvedValue(null);
    await expect(getService("UNKNOWN")).rejects.toThrow("Service 'UNKNOWN' not found");
  });

  it("activateService toggles is_enabled", async () => {
    mockRepo.findByCode.mockResolvedValue({ code: "emailsender", is_enabled: true });
    mockRepo.toggleEnabled.mockResolvedValue(undefined);
    const result = await activateService("emailsender");
    expect(mockRepo.toggleEnabled).toHaveBeenCalledWith("emailsender", false);
    expect(result).toEqual({ code: "emailsender", is_enabled: false });
  });

  it("activateService throws when service not found", async () => {
    mockRepo.findByCode.mockResolvedValue(null);
    await expect(activateService("UNKNOWN")).rejects.toThrow("Service 'UNKNOWN' not found");
  });

  it("updateService updates and returns the updated service", async () => {
    // The updated row is fetched once, after the write (the existence
    // guard lives inside updateByCodeAdmin → findByCode).
    mockRepo.findByCode.mockResolvedValue({ code: "emailsender", name: "Updated", is_enabled: true });
    mockRepo.updateByCodeAdmin.mockResolvedValue(undefined);

    const result = await updateService("emailsender", { name: "Updated" });
    expect(mockRepo.updateByCodeAdmin).toHaveBeenCalledWith(
      "emailsender",
      expect.objectContaining({ name: "Updated" }),
    );
    expect(result).toEqual({ service: { code: "emailsender", name: "Updated", is_enabled: true } });
  });

  it("deleteService soft-deletes the service row", async () => {
    mockRepo.findByCode.mockResolvedValue({ code: "emailsender", is_enabled: true });
    mockRepo.deleteByCode.mockResolvedValue(undefined);
    const result = await deleteService("emailsender");
    expect(mockRepo.deleteByCode).toHaveBeenCalledWith("emailsender");
    expect(result).toEqual({ code: "emailsender", deleted: true });
  });

  it("deleteService throws when service not found", async () => {
    mockRepo.findByCode.mockResolvedValue(null);
    await expect(deleteService("UNKNOWN")).rejects.toThrow("Service 'UNKNOWN' not found");
  });
});
