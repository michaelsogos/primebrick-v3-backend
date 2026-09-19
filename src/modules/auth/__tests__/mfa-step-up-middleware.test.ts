import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ──────────────────────────────────────────────────────────
const { mockPool, mockMfaService, mockCasdoor } = vi.hoisted(() => ({
  mockPool: {},
  mockMfaService: {
    consumeActionAuthorization: vi.fn(),
  },
  mockCasdoor: {},
}));

vi.mock("../../db/pool.js", () => ({
  getPool: vi.fn(() => mockPool),
}));

vi.mock("../services/casdoor.service.js", () => ({
  CasdoorService: vi.fn().mockImplementation(function () { return mockCasdoor; }),
}));

vi.mock("../services/mfa.service.js", () => ({
  MfaService: vi.fn().mockImplementation(function () { return mockMfaService; }),
}));

// ─── Import after mocks ─────────────────────────────────────────────────────
import type { Request, Response, NextFunction } from "express";
import { requireMfaStepUp } from "../mfa-step-up.middleware.js";

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function makeRes(): Response {
  return {} as unknown as Response;
}

beforeEach(() => {
  mockMfaService.consumeActionAuthorization.mockReset();
});

describe("requireMfaStepUp middleware", () => {
  it("passes 403 mfa_step_up_required to next() when header is missing", async () => {
    const middleware = requireMfaStepUp("delete", "organizations");
    const req = makeReq(); // no header
    const res = makeRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);
    // asyncHandler forwards the thrown ApiError to next(err)
    await vi.waitFor(() => {
      expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        extra: { mfa_step_up_required: true, action: "delete", target_resource: "organizations" },
      }),
    );
    });
  });

  it("calls next() when token is valid", async () => {
    mockMfaService.consumeActionAuthorization.mockResolvedValue({ user_uuid: "user-1" });
    const middleware = requireMfaStepUp("delete", "organizations");
    const req = makeReq({ "x-mfa-action-authorization": "valid-token" });
    const res = makeRes();
    const next: NextFunction = vi.fn();

    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(mockMfaService.consumeActionAuthorization).toHaveBeenCalledWith(
      "valid-token",
      "delete",
      "organizations",
    );
  });

  it("passes 403 to next() when token is invalid (consumption fails)", async () => {
    // The service throws an ApiError when the token is invalid
    const { ApiError } = await import("../../../http/api-errors.js");
    mockMfaService.consumeActionAuthorization.mockRejectedValue(
      new ApiError(
        "/errors/mfa-action-token-invalid",
        "Invalid action authorization token",
        401,
        "The token is invalid",
        { internal_code: "MFA_ACTION_TOKEN_INVALID" },
      ),
    );
    const middleware = requireMfaStepUp("delete", "organizations");
    const req = makeReq({ "x-mfa-action-authorization": "invalid-token" });
    const res = makeRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);
    // asyncHandler forwards the error to next(err) on a later microtask
    await vi.waitFor(() => {
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          extra: { mfa_step_up_required: true, action: "delete", target_resource: "organizations" },
        }),
      );
    });
  });
});
