import { describe, it, expect } from "vitest";
import {
  signMfaChallengeToken,
  verifyMfaChallengeToken,
  type MfaChallengePayload,
} from "../mfa-challenge-token.js";

const SECRET = "a".repeat(64); // 32-byte hex key

function makePayload(overrides: Partial<MfaChallengePayload> = {}): MfaChallengePayload {
  return {
    jti: "test-jti-123",
    sub: "user-uuid-456",
    idp_code: "idp-code-789",
    idp_org: "acme",
    idp_username: "admin",
    available_factor_ids: ["factor-uuid-1"],
    purpose: "login_challenge",
    ...overrides,
  };
}

describe("mfa-challenge-token — sign/verify", () => {
  it("round-trips a login_challenge token", async () => {
    const payload = makePayload({ purpose: "login_challenge" });
    const token = await signMfaChallengeToken(payload, SECRET, 300);
    const verified = await verifyMfaChallengeToken(token, SECRET);
    expect(verified.jti).toBe(payload.jti);
    expect(verified.sub).toBe(payload.sub);
    expect(verified.purpose).toBe("login_challenge");
    expect(verified.available_factor_ids).toEqual(["factor-uuid-1"]);
  });

  it("round-trips a step_up_challenge token with action + target_resource", async () => {
    const payload = makePayload({
      purpose: "step_up_challenge",
      action: "delete",
      target_resource: "organizations",
    });
    const token = await signMfaChallengeToken(payload, SECRET, 300);
    const verified = await verifyMfaChallengeToken(token, SECRET);
    expect(verified.purpose).toBe("step_up_challenge");
    expect(verified.action).toBe("delete");
    expect(verified.target_resource).toBe("organizations");
  });

  it("rejects a token signed with a different secret", async () => {
    const payload = makePayload();
    const token = await signMfaChallengeToken(payload, SECRET, 300);
    await expect(verifyMfaChallengeToken(token, "b".repeat(64))).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const payload = makePayload();
    // TTL = 0 seconds → expires immediately
    const token = await signMfaChallengeToken(payload, SECRET, 0);
    // Wait a tiny bit to ensure it's past expiration
    await new Promise((r) => setTimeout(r, 1100));
    await expect(verifyMfaChallengeToken(token, SECRET)).rejects.toThrow();
  });

  it("rejects a malformed token (not a JWT)", async () => {
    await expect(verifyMfaChallengeToken("not-a-jwt", SECRET)).rejects.toThrow();
  });

  it("rejects a token missing required claims (jti)", async () => {
    // Manually craft a token without jti using jose directly
    const { SignJWT } = await import("jose");
    const key = new Uint8Array(Buffer.from(SECRET, "hex"));
    const badToken = await new SignJWT({ purpose: "login_challenge" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("primebrick-be")
      .setSubject("user-uuid")
      .setIssuedAt()
      .setExpirationTime("300s")
      .sign(key);
    await expect(verifyMfaChallengeToken(badToken, SECRET)).rejects.toThrow();
  });

  it("accepts a non-hex secret (utf-8 fallback)", async () => {
    const nonHexSecret = "my-ascii-secret-key-that-is-long-enough";
    const payload = makePayload();
    const token = await signMfaChallengeToken(payload, nonHexSecret, 300);
    const verified = await verifyMfaChallengeToken(token, nonHexSecret);
    expect(verified.jti).toBe(payload.jti);
  });
});
