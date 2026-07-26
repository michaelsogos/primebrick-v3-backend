import { describe, it, expect } from "vitest";
import { generateTotp } from "../services/mfa.service.js";

// RFC 6238 Appendix B test vectors.
// The secret is the ASCII string "12345678901234567890" (20 bytes).
// SHA1 is used (same as our implementation).
// We test that our generateTotp produces the same codes as the RFC.
//
// RFC 6238 test values for SHA1, 8 digits, T=30s:
//   Time (sec)   TOTP
//   59           94287082
//   1111111109   07081804
//   1111111111   14050471
//   1234567890   89005924
//   2000000000   69279037
//   20000000000  65353130
//
// Our generateTotp uses base32-encoded secrets and 6 digits by default,
// so we encode the secret as base32 and request 8 digits.
//
// Base32("12345678901234567890") = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"

const RFC_SECRET_BASE32 = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("generateTotp — RFC 6238 test vectors", () => {
  // We need to mock Date.now to control the time step.
  // The counter = floor(unix_time / 30).
  // For T=59: counter = floor(59/30) = 1
  // For T=1111111109: counter = floor(1111111109/30) = 37037036

  const originalNow = Date.now;

  function setTime(unixSeconds: number) {
    Date.now = () => unixSeconds * 1000;
  }

  function restoreTime() {
    Date.now = originalNow;
  }

  it("matches RFC 6238 vector at T=59", () => {
    setTime(59);
    try {
      expect(generateTotp(RFC_SECRET_BASE32, 30, 8)).toBe("94287082");
    } finally {
      restoreTime();
    }
  });

  it("matches RFC 6238 vector at T=1111111109", () => {
    setTime(1111111109);
    try {
      expect(generateTotp(RFC_SECRET_BASE32, 30, 8)).toBe("07081804");
    } finally {
      restoreTime();
    }
  });

  it("matches RFC 6238 vector at T=1111111111", () => {
    setTime(1111111111);
    try {
      expect(generateTotp(RFC_SECRET_BASE32, 30, 8)).toBe("14050471");
    } finally {
      restoreTime();
    }
  });

  it("matches RFC 6238 vector at T=1234567890", () => {
    setTime(1234567890);
    try {
      expect(generateTotp(RFC_SECRET_BASE32, 30, 8)).toBe("89005924");
    } finally {
      restoreTime();
    }
  });

  it("matches RFC 6238 vector at T=2000000000", () => {
    setTime(2000000000);
    try {
      expect(generateTotp(RFC_SECRET_BASE32, 30, 8)).toBe("69279037");
    } finally {
      restoreTime();
    }
  });

  it("produces 6-digit codes by default", () => {
    setTime(59);
    try {
      const code = generateTotp(RFC_SECRET_BASE32);
      expect(code).toMatch(/^\d{6}$/);
    } finally {
      restoreTime();
    }
  });

  it("produces different codes for different time steps", () => {
    setTime(59);
    const code1 = generateTotp(RFC_SECRET_BASE32, 30, 6);
    setTime(59 + 30);
    const code2 = generateTotp(RFC_SECRET_BASE32, 30, 6);
    expect(code1).not.toBe(code2);
  });

  it("supports negative time step offset (previous window)", () => {
    setTime(59);
    const current = generateTotp(RFC_SECRET_BASE32, 30, 6);
    const prev = generateTotp(RFC_SECRET_BASE32, 30, 6, -1);
    // Previous window code must differ from current
    expect(prev).not.toBe(current);
    // And must be 6 digits
    expect(prev).toMatch(/^\d{6}$/);
  });

  it("supports positive time step offset (next window)", () => {
    setTime(59);
    const current = generateTotp(RFC_SECRET_BASE32, 30, 6);
    const next = generateTotp(RFC_SECRET_BASE32, 30, 6, 1);
    expect(next).not.toBe(current);
    expect(next).toMatch(/^\d{6}$/);
  });

  it("offset=-1 at T=59 equals code at T=29 (previous window)", () => {
    setTime(59);
    const prevViaOffset = generateTotp(RFC_SECRET_BASE32, 30, 8, -1);
    setTime(29);
    const prevViaTime = generateTotp(RFC_SECRET_BASE32, 30, 8);
    expect(prevViaOffset).toBe(prevViaTime);
  });

  it("offset=+1 at T=59 equals code at T=89 (next window)", () => {
    setTime(59);
    const nextViaOffset = generateTotp(RFC_SECRET_BASE32, 30, 8, 1);
    setTime(89);
    const nextViaTime = generateTotp(RFC_SECRET_BASE32, 30, 8);
    expect(nextViaOffset).toBe(nextViaTime);
  });
});
