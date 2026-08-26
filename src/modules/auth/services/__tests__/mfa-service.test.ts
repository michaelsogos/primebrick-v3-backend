import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ──────────────────────────────────────────────────────────
const {
  mockRepo,
  mockFactorsDal,
  mockActionDal,
  mockAuthConfigDal,
  mockProfilesDal,
  mockCasdoor,
  mockCasdoorClient,
} = vi.hoisted(() => ({
  mockRepo: {
    add: vi.fn(),
    find: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockFactorsDal: {
    findByUuid: vi.fn(),
    findByUserProfileId: vi.fn(),
    findEnabledByUserProfileId: vi.fn(),
    countEnabledByUserProfileId: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteByUuid: vi.fn(),
    hardDelete: vi.fn(),
    clearPreferredForUser: vi.fn(),
  },
  mockActionDal: {
    create: vi.fn(),
    findByJti: vi.fn(),
    markUsed: vi.fn(),
    deleteExpired: vi.fn(),
  },
  mockAuthConfigDal: {
    findByKey: vi.fn(),
    add: vi.fn(),
    upsert: vi.fn(),
  },
  mockProfilesDal: {
    getByUuid: vi.fn(),
  },
  mockCasdoor: {
    getClient: vi.fn(),
  },
  mockCasdoorClient: {
    mfaEnrollBegin: vi.fn(),
    mfaEnrollFinish: vi.fn(),
    mfaSetPreferred: vi.fn(),
    mfaDeleteFactor: vi.fn(),
    mfaListFactors: vi.fn(),
    deleteMfa: vi.fn(),
  },
}));

// ─── Module mocks ───────────────────────────────────────────────────────────

vi.mock("@primebrick/sdk", () => ({
  requireActor: () => "test-actor-uuid",
  runAsSystem: vi.fn((fn) => fn()),
  getAuthConfig: vi.fn().mockReturnValue({
    mode: "casdoor",
    roles_path: "roles",
    oidc: {},
    gateway: {},
    enable_mfa: true,
    enable_webauthn: true,
    enable_email_verification_check: false,
    casdoor_organization: "acme",
  }),
  invalidateAuthConfig: vi.fn(),
}));

vi.mock("@primebrick/dal-pg", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@primebrick/dal-pg")>();
  return {
    ...actual,
    Repository: vi.fn().mockImplementation(function () { return mockRepo; }),
  };
});

vi.mock("../../user_mfa_factors_dal.js", () => ({
  UserMfaFactorsDal: vi.fn().mockImplementation(function () { return mockFactorsDal; }),
}));

vi.mock("../../mfa_action_authorizations_dal.js", () => ({
  MfaActionAuthorizationsDal: vi.fn().mockImplementation(function () { return mockActionDal; }),
}));

vi.mock("../../auth_configurations_dal.js", () => ({
  AuthConfigurationsDal: vi.fn().mockImplementation(function () { return mockAuthConfigDal; }),
}));

vi.mock("../../user-profiles-dal.js", () => ({
  UserProfilesDal: vi.fn().mockImplementation(function () { return mockProfilesDal; }),
}));

vi.mock("../../config.js", () => ({
  getAuthConfig: vi.fn().mockReturnValue({
    mode: "casdoor",
    roles_path: "roles",
    oidc: {},
    gateway: {},
    enable_mfa: true,
    enable_webauthn: true,
    enable_email_verification_check: false,
    casdoor_organization: "acme",
  }),
}));

vi.mock("../casdoor.service.js", () => ({
  CasdoorService: vi.fn().mockImplementation(function () { return mockCasdoor; }),
}));

// ─── Import after mocks ─────────────────────────────────────────────────────
import { MfaService, generateTotp } from "../mfa.service.js";
import { encrypt } from "../../crypto-helpers.js";
import type { Pool } from "pg";

const mockPool = {
  query: vi.fn(),
} as unknown as Pool;

const SIGNING_SECRET = "a".repeat(64);
const TOTP_SECRET = "JBSWY3DPEHPK3PXP"; // base32
// A fake JWT with 3 parts (header.payload.signature) — the payload is a minimal
// base64url-encoded JSON object. Used as the Casdoor access_token for tests.
const FAKE_JWT = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.fake-signature";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeService(): MfaService {
  return new MfaService(mockPool, mockCasdoor as any);
}

function makeFactor(overrides: Partial<any> = {}): any {
  return {
    uuid: "factor-uuid-1",
    user_profile_id: BigInt(1),
    factor_type: "totp",
    casdoor_mfa_type: "app",
    totp_secret_encrypted: encrypt(TOTP_SECRET, SIGNING_SECRET),
    label: "Test Authenticator",
    is_enabled: true,
    is_preferred: true,
    last_used_at: null,
    created_at: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  // Don't use vi.clearAllMocks() — in vitest 4 it clears implementations.
  // Instead, just overwrite the default implementations each time.
  mockAuthConfigDal.findByKey.mockResolvedValue({ value: SIGNING_SECRET });
  mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([]);
  mockFactorsDal.findByUserProfileId.mockResolvedValue([]);
  mockFactorsDal.findByUuid.mockResolvedValue(null);
  mockFactorsDal.countEnabledByUserProfileId.mockResolvedValue(0);
  mockFactorsDal.hardDelete.mockResolvedValue(undefined);
  mockFactorsDal.deleteByUuid.mockResolvedValue(undefined);
  mockFactorsDal.update.mockResolvedValue(undefined);
  mockActionDal.create.mockResolvedValue(undefined);
  mockActionDal.findByJti.mockResolvedValue(null);
  mockActionDal.markUsed.mockResolvedValue(undefined);
  mockCasdoor.getClient.mockResolvedValue(mockCasdoorClient);
  // Default: pool.query returns a profile id for resolveProfileId
  (mockPool as any).query.mockImplementation((sql: string, _params: any[]) => {
    if (sql.includes("SELECT id FROM user_profiles")) {
      return Promise.resolve({ rows: [{ id: 1 }] });
    }
    if (sql.includes("SELECT idp_org, idp_username, idp_code FROM user_profiles")) {
      return Promise.resolve({ rows: [{ idp_org: "acme", idp_username: "admin", idp_code: "idp-code-1" }] });
    }
    return Promise.resolve({ rows: [] });
  });
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("MfaService — hasMfa", () => {
  it("returns true when user has enabled factors", async () => {
    mockFactorsDal.countEnabledByUserProfileId.mockResolvedValue(1);
    const service = makeService();
    expect(await service.hasMfa("user-uuid-1")).toBe(true);
  });

  it("returns false when user has no enabled factors", async () => {
    mockFactorsDal.countEnabledByUserProfileId.mockResolvedValue(0);
    const service = makeService();
    expect(await service.hasMfa("user-uuid-1")).toBe(false);
  });
});

describe("MfaService — mintLoginChallenge", () => {
  it("issues a challenge token with available factors", async () => {
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([
      makeFactor({ uuid: "factor-1", label: "Phone 1" }),
      makeFactor({ uuid: "factor-2", label: "Phone 2" }),
    ]);
    const service = makeService();
    const result = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "admin",
      { access_token: FAKE_JWT, refresh_token: "fake-refresh", expires_in: 3600 },
    );
    expect(result.mfa_challenge_token).toBeTruthy();
    expect(result.available_factors).toHaveLength(2);
    expect(result.available_factors[0].factor_id).toBe("factor-1");
    expect(result.available_factors[1].factor_id).toBe("factor-2");
  });

  it("throws when user has no enabled factors", async () => {
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([]);
    const service = makeService();
    await expect(
      service.mintLoginChallenge("user-uuid-1", "idp-code-1", "acme", "admin", {
        access_token: FAKE_JWT,
        expires_in: 3600,
      }),
    ).rejects.toThrow();
  });
});

describe("MfaService — verifyAtLogin", () => {
  it("verifies a correct TOTP code and returns tokens", async () => {
    const factor = makeFactor();
    mockFactorsDal.findByUuid.mockResolvedValue(factor);

    const service = makeService();
    // First mint a challenge
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);
    const challenge = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "admin",
      { access_token: FAKE_JWT, refresh_token: "fake-refresh", expires_in: 3600 },
    );

    // Generate the correct TOTP code
    const code = generateTotp(TOTP_SECRET);

    const result = await service.verifyAtLogin(
      challenge.mfa_challenge_token,
      "factor-uuid-1",
      code,
    );

    expect(result.tokens.access_token).toBe(FAKE_JWT);
    expect(result.tokens.refresh_token).toBe("fake-refresh");
    expect(result.user_uuid).toBe("user-uuid-1");
    expect(result.claims).toBeDefined();
  });

  it("rejects an invalid TOTP code", async () => {
    const factor = makeFactor();
    mockFactorsDal.findByUuid.mockResolvedValue(factor);
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);

    const service = makeService();
    const challenge = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "admin",
      { access_token: FAKE_JWT, expires_in: 3600 },
    );

    await expect(
      service.verifyAtLogin(challenge.mfa_challenge_token, "factor-uuid-1", "000000"),
    ).rejects.toThrow();
  });

  it("rejects a factor not in available_factor_ids", async () => {
    const factor = makeFactor();
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);

    const service = makeService();
    const challenge = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "admin",
      { access_token: FAKE_JWT, expires_in: 3600 },
    );

    await expect(
      service.verifyAtLogin(challenge.mfa_challenge_token, "wrong-factor-id", "123456"),
    ).rejects.toThrow();
  });

  it("rejects replay (second use of same challenge token)", async () => {
    const factor = makeFactor();
    mockFactorsDal.findByUuid.mockResolvedValue(factor);
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);

    const service = makeService();
    const challenge = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "admin",
      { access_token: FAKE_JWT, expires_in: 3600 },
    );

    const code = generateTotp(TOTP_SECRET);
    // First use — success
    await service.verifyAtLogin(challenge.mfa_challenge_token, "factor-uuid-1", code);
    // Second use — must fail (tokens already popped)
    await expect(
      service.verifyAtLogin(challenge.mfa_challenge_token, "factor-uuid-1", code),
    ).rejects.toThrow();
  });
});

describe("MfaService — mintStepUpChallenge", () => {
  it("issues a step-up challenge with action + target_resource", async () => {
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([makeFactor()]);
    const service = makeService();
    const result = await service.mintStepUpChallenge("user-uuid-1", "delete", "organizations");
    expect(result.mfa_challenge_token).toBeTruthy();
    expect(result.available_factors).toHaveLength(1);
  });

  it("throws when user has no enabled factors", async () => {
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([]);
    const service = makeService();
    await expect(
      service.mintStepUpChallenge("user-uuid-1", "delete", "organizations"),
    ).rejects.toThrow();
  });
});

describe("MfaService — verifyStepUp", () => {
  it("verifies TOTP and issues an action authorization token", async () => {
    const factor = makeFactor();
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);
    mockFactorsDal.findByUuid.mockResolvedValue(factor);

    const service = makeService();
    const challenge = await service.mintStepUpChallenge("user-uuid-1", "delete", "organizations");
    const code = generateTotp(TOTP_SECRET);

    const result = await service.verifyStepUp(challenge.mfa_challenge_token, "factor-uuid-1", code);
    expect(result.action_authorization_token).toBeTruthy();
    expect(result.action).toBe("delete");
    expect(result.target_resource).toBe("organizations");
    // Action authorization must be stored in DB
    expect(mockActionDal.create).toHaveBeenCalledTimes(1);
  });

  it("rejects wrong TOTP code", async () => {
    const factor = makeFactor();
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);
    mockFactorsDal.findByUuid.mockResolvedValue(factor);

    const service = makeService();
    const challenge = await service.mintStepUpChallenge("user-uuid-1", "delete", "organizations");
    await expect(
      service.verifyStepUp(challenge.mfa_challenge_token, "factor-uuid-1", "000000"),
    ).rejects.toThrow();
  });
});

describe("MfaService — consumeActionAuthorization", () => {
  it("consumes a valid action authorization token", async () => {
    const factor = makeFactor();
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);
    mockFactorsDal.findByUuid.mockResolvedValue(factor);

    const service = makeService();
    // Issue a step-up challenge + verify to get an action token
    const challenge = await service.mintStepUpChallenge("user-uuid-1", "delete", "organizations");
    const code = generateTotp(TOTP_SECRET);
    const { action_authorization_token } = await service.verifyStepUp(
      challenge.mfa_challenge_token,
      "factor-uuid-1",
      code,
    );

    // Mock the DB lookup — token not yet used, not expired
    mockActionDal.findByJti.mockResolvedValue({
      jti: expect.any(String),
      used_at: null,
      expires_at: new Date(Date.now() + 300_000),
      token_hash: "", // will be set below
    });

    // We need the correct token_hash — compute it
    const { createHash } = await import("crypto");
    const expectedHash = createHash("sha256").update(action_authorization_token).digest("hex");
    mockActionDal.findByJti.mockResolvedValue({
      jti: "any",
      used_at: null,
      expires_at: new Date(Date.now() + 300_000),
      token_hash: expectedHash,
    });

    const result = await service.consumeActionAuthorization(action_authorization_token, "delete", "organizations");
    expect(result.user_uuid).toBe("user-uuid-1");
    expect(mockActionDal.markUsed).toHaveBeenCalledTimes(1);
  });

  it("rejects a token with wrong action", async () => {
    const factor = makeFactor();
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);
    mockFactorsDal.findByUuid.mockResolvedValue(factor);

    const service = makeService();
    const challenge = await service.mintStepUpChallenge("user-uuid-1", "delete", "organizations");
    const code = generateTotp(TOTP_SECRET);
    const { action_authorization_token } = await service.verifyStepUp(
      challenge.mfa_challenge_token,
      "factor-uuid-1",
      code,
    );

    await expect(
      service.consumeActionAuthorization(action_authorization_token, "update", "organizations"),
    ).rejects.toThrow();
  });

  it("rejects an already-used token", async () => {
    const factor = makeFactor();
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);
    mockFactorsDal.findByUuid.mockResolvedValue(factor);

    const service = makeService();
    const challenge = await service.mintStepUpChallenge("user-uuid-1", "delete", "organizations");
    const code = generateTotp(TOTP_SECRET);
    const { action_authorization_token } = await service.verifyStepUp(
      challenge.mfa_challenge_token,
      "factor-uuid-1",
      code,
    );

    const { createHash } = await import("crypto");
    const expectedHash = createHash("sha256").update(action_authorization_token).digest("hex");
    mockActionDal.findByJti.mockResolvedValue({
      jti: "any",
      used_at: new Date(), // already used!
      expires_at: new Date(Date.now() + 300_000),
      token_hash: expectedHash,
    });

    await expect(
      service.consumeActionAuthorization(action_authorization_token, "delete", "organizations"),
    ).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const factor = makeFactor();
    mockFactorsDal.findEnabledByUserProfileId.mockResolvedValue([factor]);
    mockFactorsDal.findByUuid.mockResolvedValue(factor);

    const service = makeService();
    const challenge = await service.mintStepUpChallenge("user-uuid-1", "delete", "organizations");
    const code = generateTotp(TOTP_SECRET);
    const { action_authorization_token } = await service.verifyStepUp(
      challenge.mfa_challenge_token,
      "factor-uuid-1",
      code,
    );

    const { createHash } = await import("crypto");
    const expectedHash = createHash("sha256").update(action_authorization_token).digest("hex");
    mockActionDal.findByJti.mockResolvedValue({
      jti: "any",
      used_at: null,
      expires_at: new Date(Date.now() - 1000), // expired!
      token_hash: expectedHash,
    });

    await expect(
      service.consumeActionAuthorization(action_authorization_token, "delete", "organizations"),
    ).rejects.toThrow();
  });
});

describe("MfaService — listFactors", () => {
  it("returns enabled factors for the user", async () => {
    mockFactorsDal.findByUserProfileId.mockResolvedValue([
      makeFactor({ uuid: "f1", label: "Phone 1" }),
      makeFactor({ uuid: "f2", label: "Phone 2" }),
    ]);
    const service = makeService();
    const factors = await service.listFactors("user-uuid-1");
    expect(factors).toHaveLength(2);
    expect(factors[0].uuid).toBe("f1");
    expect(factors[0].label).toBe("Phone 1");
  });
});

describe("MfaService — deleteFactor", () => {
  it("deletes a factor that belongs to the user", async () => {
    mockFactorsDal.findByUuid.mockResolvedValue(makeFactor());
    mockFactorsDal.deleteByUuid.mockResolvedValue(undefined);
    mockCasdoorClient.deleteMfa.mockResolvedValue(true);
    mockCasdoor.getClient.mockResolvedValue(mockCasdoorClient);

    const service = makeService();
    const result = await service.deleteFactor("user-uuid-1", "factor-uuid-1");
    expect(result.success).toBe(true);
    expect(mockFactorsDal.deleteByUuid).toHaveBeenCalledWith("factor-uuid-1");
  });

  it("throws when factor does not belong to the user", async () => {
    mockFactorsDal.findByUuid.mockResolvedValue(
      makeFactor({ user_profile_id: BigInt(999) }), // different user
    );
    const service = makeService();
    await expect(service.deleteFactor("user-uuid-1", "factor-uuid-1")).rejects.toThrow();
  });
});
