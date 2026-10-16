import { describe, it, expect } from "vitest";
import type { Request } from "express";
import { buildProxyRequestHeaders } from "../proxy-service.js";

function makeReq(headers: Record<string, string> = {}): Request {
  return {
    headers,
    ip: "203.0.113.10",
    protocol: "https",
    hostname: "api.example.com",
  } as unknown as Request;
}

describe("buildProxyRequestHeaders — closed allowlist", () => {
  it("forwards the mfa step-up token header", () => {
    const h = buildProxyRequestHeaders(
      makeReq({ "x-mfa-action-authorization": "mfa-token-123" })
    );
    expect(h["x-mfa-action-authorization"]).toBe("mfa-token-123");
  });

  it("forwards conditional/caching headers", () => {
    const h = buildProxyRequestHeaders(
      makeReq({ "if-none-match": '"abc"', "if-match": '"def"' })
    );
    expect(h["if-none-match"]).toBe('"abc"');
    expect(h["if-match"]).toBe('"def"');
  });

  it("honours a client-provided x-request-id", () => {
    const h = buildProxyRequestHeaders(
      makeReq({ "x-request-id": "req-abc" })
    );
    expect(h["x-request-id"]).toBe("req-abc");
  });

  it("generates x-request-id when absent", () => {
    const h = buildProxyRequestHeaders(makeReq());
    expect(h["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it("sends the BE service identity as user-agent; client UA is preserved in x-forwarded-user-agent", () => {
    const h = buildProxyRequestHeaders(
      makeReq({
        "user-agent": "Mozilla/5.0",
        "accept-language": "it-IT",
      })
    );
    // B11: the outbound UA is the BE's own identity (allowlisted at the US),
    // not the browser's — the client UA survives in x-forwarded-user-agent.
    expect(h["user-agent"]).toMatch(/^\S+( \(.+\))? (Node|Bun)\//);
    expect(h["user-agent"]).toContain("(backend)");
    expect(h["x-forwarded-user-agent"]).toBe("Mozilla/5.0");
    expect(h["accept-language"]).toBe("it-IT");
  });

  it("adds x-forwarded-* network context", () => {
    const h = buildProxyRequestHeaders(makeReq());
    expect(h["x-forwarded-for"]).toBe("203.0.113.10");
    expect(h["x-forwarded-proto"]).toBe("https");
    expect(h["x-forwarded-host"]).toBe("api.example.com");
  });

  it("drops non-allowlisted headers (closed by default)", () => {
    const h = buildProxyRequestHeaders(
      makeReq({
        authorization: "Bearer secret",
        cookie: "session=abc",
        "x-custom-evil": "x",
        "x-user-id": "spoofed",
      })
    );
    expect(h["authorization"]).toBeUndefined();
    expect(h["cookie"]).toBeUndefined();
    expect(h["x-custom-evil"]).toBeUndefined();
    expect(h["x-user-id"]).toBeUndefined();
    expect(h["Content-Type"]).toBe("application/json");
  });
});
