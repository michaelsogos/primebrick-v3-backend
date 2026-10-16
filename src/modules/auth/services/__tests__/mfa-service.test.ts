import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ──────────────────────────────────────────────────────────
const {
  factorMethodMocks,
  actionAuthzMocks,
  mockConfigEntriesService,
  mockUserService,
  mockCasdoor,
  mockCasdoorClient,
} = vi.hoisted(() => ({
  factorMethodMocks: {
    findFactorByUuid: vi.fn(),
    findFactorsByUserProfileId: vi.fn(),
    findEnabledFactorsByUserProfileId: vi.fn(),
    countEnabledFactorsByUserProfileId: vi.fn(),
    createFactor: vi.fn(),
    updateFactor: vi.fn(),
    delete: vi.fn(),
    deleteFactorByUuid: vi.fn(),
    hardDelete: vi.fn(),
    clearPreferredFactorsForUser: vi.fn(),
  },
  actionAuthzMocks: {
    createActionAuthorization: vi.fn(),
    findActionAuthorizationByJti: vi.fn(),
    markActionAuthorizationUsed: vi.fn(),
    deleteExpiredActionAuthorizations: vi.fn(),
  },
  mockConfigEntriesService: {
    findByKey: vi.fn(),
    createEntry: vi.fn(),
  },
  mockUserService: {
    getByUuid: vi.fn(),
    getIdByUuid: vi.fn(),
    getIdpIdentityByUuid: vi.fn(),
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
  Cached: () => () => {},
  logger: { debug: vi.fn(), info: vi.fn(), done: vi.fn(), warn: vi.fn(), error: vi.fn() },
  runAsSystem: vi.fn((fn) => fn()),
  getAuthConfig: vi.fn().mockReturnValue({
    mode: "casdoor",
    roles_path: "roles",
    oidc: {},
    gateway: {},
    enable_mfa: true,
    enable_webauthn: true,
    enable_email_verification_check: false,
    idp_organization: "acme",
  }),
  invalidateAuthConfig: vi.fn(),
}));

vi.mock("../config-entries.service.js", () => ({
  getConfigEntriesService: vi.fn(() => mockConfigEntriesService),
}));

vi.mock("../user.service.js", () => ({
  getUserService: vi.fn(() => mockUserService),
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
    idp_organization: "acme",
  }),
}));

vi.mock("../casdoor.service.js", () => ({
  CasdoorService: vi.fn().mockImplementation(function () { return mockCasdoor; }),
}));

// ─── Import after mocks ─────────────────────────────────────────────────────
import { MfaService, generateTotp } from "../mfa.service.js";
import { encrypt } from "../../crypto-helpers.js";


const SIGNING_SECRET = "a".repeat(64);
const TOTP_SECRET = "JBSWY3DPEHPK3PXP"; // base32
// A fake JWT with 3 parts (header.payload.signature) — the payload is a minimal
// base64url-encoded JSON object. Used as the Casdoor access_token for tests.
const FAKE_JWT = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.fake-signature";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeService(): MfaService {
  const svc = new MfaService(mockCasdoor as any);
  // Stub the entity-owned methods at the service seam (the absorbed DAL
  // methods live on the service itself now — no DB access in unit tests).
  return Object.assign(svc, factorMethodMocks, actionAuthzMocks);
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
  mockConfigEntriesService.findByKey.mockResolvedValue({ value: SIGNING_SECRET });
  factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([]);
  factorMethodMocks.findFactorsByUserProfileId.mockResolvedValue([]);
  factorMethodMocks.findFactorByUuid.mockResolvedValue(null);
  factorMethodMocks.countEnabledFactorsByUserProfileId.mockResolvedValue(0);
  factorMethodMocks.hardDelete.mockResolvedValue(undefined);
  factorMethodMocks.deleteFactorByUuid.mockResolvedValue(undefined);
  factorMethodMocks.updateFactor.mockResolvedValue(undefined);
  actionAuthzMocks.createActionAuthorization.mockResolvedValue(undefined);
  actionAuthzMocks.findActionAuthorizationByJti.mockResolvedValue(null);
  actionAuthzMocks.markActionAuthorizationUsed.mockResolvedValue(undefined);
  mockCasdoor.getClient.mockResolvedValue(mockCasdoorClient);
  // Default: profile lookups used by resolveProfileId / resolveCasdoorIdentity
  mockUserService.getIdByUuid.mockResolvedValue(BigInt(1));
  mockUserService.getIdpIdentityByUuid.mockResolvedValue({
    idp_org: "acme",
    idp_username: "test-admin",
    idp_code: "idp-code-1",
  });
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("MfaService — hasMfa", () => {
  it("returns true when user has enabled factors", async () => {
    factorMethodMocks.countEnabledFactorsByUserProfileId.mockResolvedValue(1);
    const service = makeService();
    expect(await service.hasMfa("user-uuid-1")).toBe(true);
  });

  it("returns false when user has no enabled factors", async () => {
    factorMethodMocks.countEnabledFactorsByUserProfileId.mockResolvedValue(0);
    const service = makeService();
    expect(await service.hasMfa("user-uuid-1")).toBe(false);
  });
});

describe("MfaService — mintLoginChallenge", () => {
  it("issues a challenge token with available factors", async () => {
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([
      makeFactor({ uuid: "factor-1", label: "Phone 1" }),
      makeFactor({ uuid: "factor-2", label: "Phone 2" }),
    ]);
    const service = makeService();
    const result = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "test-admin",
      { access_token: FAKE_JWT, refresh_token: "fake-refresh", expires_in: 3600 },
    );
    expect(result.mfa_challenge_token).toBeTruthy();
    expect(result.available_factors).toHaveLength(2);
    expect(result.available_factors[0].factor_id).toBe("factor-1");
    expect(result.available_factors[1].factor_id).toBe("factor-2");
  });

  it("throws when user has no enabled factors", async () => {
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([]);
    const service = makeService();
    await expect(
      service.mintLoginChallenge("user-uuid-1", "idp-code-1", "acme", "test-admin", {
        access_token: FAKE_JWT,
        expires_in: 3600,
      }),
    ).rejects.toThrow();
  });
});

describe("MfaService — verifyAtLogin", () => {
  it("verifies a correct TOTP code and returns tokens", async () => {
    const factor = makeFactor();
    factorMethodMocks.findFactorByUuid.mockResolvedValue(factor);

    const service = makeService();
    // First mint a challenge
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);
    const challenge = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "test-admin",
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
    factorMethodMocks.findFactorByUuid.mockResolvedValue(factor);
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);

    const service = makeService();
    const challenge = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "test-admin",
      { access_token: FAKE_JWT, expires_in: 3600 },
    );

    await expect(
      service.verifyAtLogin(challenge.mfa_challenge_token, "factor-uuid-1", "000000"),
    ).rejects.toThrow();
  });

  it("rejects a factor not in available_factor_ids", async () => {
    const factor = makeFactor();
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);

    const service = makeService();
    const challenge = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "test-admin",
      { access_token: FAKE_JWT, expires_in: 3600 },
    );

    await expect(
      service.verifyAtLogin(challenge.mfa_challenge_token, "wrong-factor-id", "123456"),
    ).rejects.toThrow();
  });

  it("rejects replay (second use of same challenge token)", async () => {
    const factor = makeFactor();
    factorMethodMocks.findFactorByUuid.mockResolvedValue(factor);
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);

    const service = makeService();
    const challenge = await service.mintLoginChallenge(
      "user-uuid-1",
      "idp-code-1",
      "acme",
      "test-admin",
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
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([makeFactor()]);
    const service = makeService();
    const result = await service.mintStepUpChallenge("user-uuid-1", "delete", "organizations");
    expect(result.mfa_challenge_token).toBeTruthy();
    expect(result.available_factors).toHaveLength(1);
  });

  it("throws when user has no enabled factors", async () => {
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([]);
    const service = makeService();
    await expect(
      service.mintStepUpChallenge("user-uuid-1", "delete", "organizations"),
    ).rejects.toThrow();
  });
});

describe("MfaService — verifyStepUp", () => {
  it("verifies TOTP and issues an action authorization token", async () => {
    const factor = makeFactor();
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);
    factorMethodMocks.findFactorByUuid.mockResolvedValue(factor);

    const service = makeService();
    const challenge = await service.mintStepUpChallenge("user-uuid-1", "delete", "organizations");
    const code = generateTotp(TOTP_SECRET);

    const result = await service.verifyStepUp(challenge.mfa_challenge_token, "factor-uuid-1", code);
    expect(result.action_authorization_token).toBeTruthy();
    expect(result.action).toBe("delete");
    expect(result.target_resource).toBe("organizations");
    // Action authorization must be stored in DB
    expect(actionAuthzMocks.createActionAuthorization).toHaveBeenCalledTimes(1);
  });

  it("rejects wrong TOTP code", async () => {
    const factor = makeFactor();
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);
    factorMethodMocks.findFactorByUuid.mockResolvedValue(factor);

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
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);
    factorMethodMocks.findFactorByUuid.mockResolvedValue(factor);

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
    actionAuthzMocks.findActionAuthorizationByJti.mockResolvedValue({
      jti: expect.any(String),
      used_at: null,
      expires_at: new Date(Date.now() + 300_000),
      token_hash: "", // will be set below
    });

    // We need the correct token_hash — compute it
    const { createHash } = await import("crypto");
    const expectedHash = createHash("sha256").update(action_authorization_token).digest("hex");
    actionAuthzMocks.findActionAuthorizationByJti.mockResolvedValue({
      jti: "any",
      used_at: null,
      expires_at: new Date(Date.now() + 300_000),
      token_hash: expectedHash,
    });

    const result = await service.consumeActionAuthorization(action_authorization_token, "delete", "organizations");
    expect(result.user_uuid).toBe("user-uuid-1");
    expect(actionAuthzMocks.markActionAuthorizationUsed).toHaveBeenCalledTimes(1);
  });

  it("rejects a token with wrong action", async () => {
    const factor = makeFactor();
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);
    factorMethodMocks.findFactorByUuid.mockResolvedValue(factor);

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
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);
    factorMethodMocks.findFactorByUuid.mockResolvedValue(factor);

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
    actionAuthzMocks.findActionAuthorizationByJti.mockResolvedValue({
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
    factorMethodMocks.findEnabledFactorsByUserProfileId.mockResolvedValue([factor]);
    factorMethodMocks.findFactorByUuid.mockResolvedValue(factor);

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
    actionAuthzMocks.findActionAuthorizationByJti.mockResolvedValue({
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
    factorMethodMocks.findFactorsByUserProfileId.mockResolvedValue([
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
    factorMethodMocks.findFactorByUuid.mockResolvedValue(makeFactor());
    factorMethodMocks.deleteFactorByUuid.mockResolvedValue(undefined);
    mockCasdoorClient.deleteMfa.mockResolvedValue(true);
    mockCasdoor.getClient.mockResolvedValue(mockCasdoorClient);

    const service = makeService();
    const result = await service.deleteFactor("user-uuid-1", "factor-uuid-1");
    expect(result.success).toBe(true);
    expect(factorMethodMocks.deleteFactorByUuid).toHaveBeenCalledWith("factor-uuid-1");
  });

  it("throws when factor does not belong to the user", async () => {
    factorMethodMocks.findFactorByUuid.mockResolvedValue(
      makeFactor({ user_profile_id: BigInt(999) }), // different user
    );
    const service = makeService();
    await expect(service.deleteFactor("user-uuid-1", "factor-uuid-1")).rejects.toThrow();
  });
});
