import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Import after mocks
import { CasdoorApiClient } from "../casdoor-api-client.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeClient(): CasdoorApiClient {
  return new CasdoorApiClient({
    endpoint: "http://localhost:8000",
    clientId: "test-client",
    clientSecret: "test-secret",
    orgName: "ACME",
  });
}

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("CasdoorApiClient — checkUserPassword", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns { status: 'ok' } when password is correct", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    const client = makeClient();
    const result = await client.checkUserPassword(
      { id: "ACME/admin", owner: "ACME", name: "admin" },
      "correct-password",
    );
    expect(result.status).toBe("ok");
    expect(result.msg).toBeUndefined();
  });

  it("returns { status: 'error' } when password is wrong", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "error", msg: "wrong password" }));
    const client = makeClient();
    const result = await client.checkUserPassword(
      { id: "ACME/admin" },
      "wrong-password",
    );
    expect(result.status).toBe("error");
    expect(result.msg).toBe("wrong password");
  });

  it("returns { status: 'error' } on HTTP failure", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "internal" }, 500));
    const client = makeClient();
    const result = await client.checkUserPassword(
      { id: "ACME/admin" },
      "any-password",
    );
    expect(result.status).toBe("error");
    expect(result.msg).toContain("500");
  });

  it("splits id into owner/name when owner/name not provided", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    const client = makeClient();
    await client.checkUserPassword({ id: "ACME/admin" }, "pw");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("id=ACME%2Fadmin");
  });
});

describe("CasdoorApiClient — addApplication", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("creates an application and returns it on success", async () => {
    const appData = { name: "primebrick-api", owner: "admin", enableWebAuthn: true };
    mockFetch.mockResolvedValue(mockResponse({ status: "ok", data: appData }));
    const client = makeClient();
    const result = await client.addApplication(appData);
    expect(result).toEqual(appData);
  });

  it("returns null on HTTP failure", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "bad request" }, 400));
    const client = makeClient();
    const result = await client.addApplication({ name: "test", owner: "admin" });
    expect(result).toBeNull();
  });

  it("returns null when status is not ok", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "error" }));
    const client = makeClient();
    const result = await client.addApplication({ name: "test", owner: "admin" });
    expect(result).toBeNull();
  });

  it("returns the input application object when data field is missing", async () => {
    const appData = { name: "primebrick-api", owner: "admin" };
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    const client = makeClient();
    const result = await client.addApplication(appData);
    expect(result).toEqual(appData);
  });
});

describe("CasdoorApiClient — getApplication", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns the application data on success", async () => {
    const appData = { name: "primebrick-api", owner: "admin", enableWebAuthn: false };
    mockFetch.mockResolvedValue(mockResponse({ status: "ok", data: appData }));
    const client = makeClient();
    const result = await client.getApplication("primebrick-api", "admin");
    expect(result).toEqual(appData);
  });

  it("returns null when status is error", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "error" }));
    const client = makeClient();
    const result = await client.getApplication("primebrick-api", "admin");
    expect(result).toBeNull();
  });

  it("returns null on HTTP failure", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "not found" }, 404));
    const client = makeClient();
    const result = await client.getApplication("primebrick-api", "admin");
    expect(result).toBeNull();
  });
});

describe("CasdoorApiClient — updateApplication", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns true on success", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    const client = makeClient();
    const result = await client.updateApplication({
      name: "primebrick-api",
      owner: "admin",
      enableWebAuthn: true,
    });
    expect(result).toBe(true);
  });

  it("returns false on HTTP failure", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "bad request" }, 400));
    const client = makeClient();
    const result = await client.updateApplication({
      name: "primebrick-api",
      owner: "admin",
    });
    expect(result).toBe(false);
  });
});

describe("CasdoorApiClient — setApplicationWebAuthn", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("fetches app, sets enableWebAuthn, and returns true on success", async () => {
    const appData = { name: "primebrick-api", owner: "admin", enableWebAuthn: false };
    mockFetch
      .mockResolvedValueOnce(mockResponse({ status: "ok", data: appData })) // getApplication
      .mockResolvedValueOnce(mockResponse({ status: "ok" })); // updateApplication
    const client = makeClient();
    const result = await client.setApplicationWebAuthn("primebrick-api", "admin", true);
    expect(result).toBe(true);
    // Verify the update call had enableWebAuthn=true
    const updateBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(updateBody.enableWebAuthn).toBe(true);
  });

  it("returns false when application is not found", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "error" }));
    const client = makeClient();
    const result = await client.setApplicationWebAuthn("nonexistent", "admin", true);
    expect(result).toBe(false);
  });
});

describe("CasdoorApiClient — getRole", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns the role when found", async () => {
    mockFetch.mockResolvedValue(mockResponse({ owner: "ACME", name: "sales", displayName: "Sales" }));
    const client = makeClient();
    const role = await client.getRole("sales", "ACME");
    expect(role).not.toBeNull();
    expect(role?.name).toBe("sales");
    expect(role?.owner).toBe("ACME");
  });

  it("builds the URL with owner/name id", async () => {
    mockFetch.mockResolvedValue(mockResponse({ owner: "ACME", name: "sales" }));
    const client = makeClient();
    await client.getRole("sales", "ACME");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/get-role?id=ACME%2Fsales");
  });

  it("falls back to orgName when owner not provided", async () => {
    mockFetch.mockResolvedValue(mockResponse({ owner: "ACME", name: "sales" }));
    const client = makeClient();
    await client.getRole("sales");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("id=ACME%2Fsales");
  });

  it("returns null on 404", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "not found" }, 404));
    const client = makeClient();
    const role = await client.getRole("nonexistent", "ACME");
    expect(role).toBeNull();
  });
});

describe("CasdoorApiClient — addRole", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns the created role on success", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok", data: { owner: "ACME", name: "sales" } }));
    const client = makeClient();
    const role = await client.addRole({ owner: "ACME", name: "sales", displayName: "Sales" });
    expect(role).not.toBeNull();
    expect(role?.name).toBe("sales");
  });

  it("builds the URL with owner/name id and sends body with owner/name/displayName", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok", data: { owner: "ACME", name: "sales" } }));
    const client = makeClient();
    await client.addRole({ owner: "ACME", name: "sales", displayName: "Sales" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/add-role?id=ACME%2Fsales");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.owner).toBe("ACME");
    expect(body.name).toBe("sales");
    expect(body.displayName).toBe("Sales");
    expect(body.isEnabled).toBe(true);
  });

  it("returns null when status is not ok", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "error", msg: "duplicate" }));
    const client = makeClient();
    const role = await client.addRole({ owner: "ACME", name: "sales" });
    expect(role).toBeNull();
  });

  it("returns null on HTTP error", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "internal" }, 500));
    const client = makeClient();
    const role = await client.addRole({ owner: "ACME", name: "sales" });
    expect(role).toBeNull();
  });
});

describe("CasdoorApiClient — updateRole", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns true on success", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    const client = makeClient();
    const ok = await client.updateRole({ owner: "ACME", name: "sales", displayName: "Sales Team" });
    expect(ok).toBe(true);
  });

  it("builds the URL with owner/name id", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    const client = makeClient();
    await client.updateRole({ owner: "ACME", name: "sales", displayName: "Sales Team" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/update-role?id=ACME%2Fsales");
  });

  it("only sends displayName/description/isEnabled in the body (not idp_role/idp_org as separate fields)", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    const client = makeClient();
    await client.updateRole({ owner: "ACME", name: "sales", displayName: "Sales Team", description: "Updated" });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.owner).toBe("ACME");
    expect(body.name).toBe("sales");
    expect(body.displayName).toBe("Sales Team");
    expect(body.description).toBe("Updated");
    expect(body.isEnabled).toBeUndefined();
  });

  it("returns false on HTTP error", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "internal" }, 500));
    const client = makeClient();
    const ok = await client.updateRole({ owner: "ACME", name: "sales", displayName: "X" });
    expect(ok).toBe(false);
  });
});

describe("CasdoorApiClient — deleteRole", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns true on success", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    const client = makeClient();
    const ok = await client.deleteRole("sales", "ACME");
    expect(ok).toBe(true);
  });

  it("builds the URL with owner/name id and sends body with owner/name", async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: "ok" }));
    const client = makeClient();
    await client.deleteRole("sales", "ACME");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/delete-role?id=ACME%2Fsales");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.owner).toBe("ACME");
    expect(body.name).toBe("sales");
  });

  it("returns false on HTTP error", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "internal" }, 500));
    const client = makeClient();
    const ok = await client.deleteRole("sales", "ACME");
    expect(ok).toBe(false);
  });
});
