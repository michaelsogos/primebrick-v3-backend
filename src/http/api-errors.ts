export type ImpactLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ApiErrorCode =
  | "DATABASE_UNAVAILABLE"
  | "REDIS_UNAVAILABLE"
  | "LIST_FAILED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN";

export type ApiErrorResponse = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  internal_code?: string;
  severity?: string;
  extra?: {
    viewer?: string;
    results?: any;
    issues?: any;
    [key: string]: any;
  };
};

/**
 * RFC 7807 Problem Details for HTTP APIs
 * Base class for all API errors
 */
export class ApiError extends Error {
  public readonly type: string;
  public readonly title: string;
  public readonly status: number;
  public readonly detail: string;
  public readonly instance?: string;
  public readonly internal_code?: string;
  public readonly severity?: ImpactLevel;
  public readonly extra?: ApiErrorResponse["extra"];

  constructor(
    type: string,
    title: string,
    status: number,
    detail: string,
    options?: {
      instance?: string;
      internal_code?: string;
      severity?: ImpactLevel;
      extra?: ApiErrorResponse["extra"];
    }
  ) {
    super(detail);
    this.name = "ApiError";
    this.type = type;
    this.title = title;
    this.status = status;
    this.detail = detail;
    this.instance = options?.instance;
    this.internal_code = options?.internal_code;
    this.severity = options?.severity || "HIGH";
    this.extra = options?.extra;
  }

  toResponse(): ApiErrorResponse {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance: this.instance,
      internal_code: this.internal_code,
      severity: this.severity,
      extra: this.extra,
    };
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(detail: string, options?: { instance?: string; internal_code?: string }) {
    super(
      "/errors/not-found",
      "Resource not found",
      404,
      detail,
      {
        ...options,
        internal_code: options?.internal_code || "NOT_FOUND",
        severity: "MEDIUM",
      }
    );
    this.name = "NotFoundError";
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends ApiError {
  constructor(detail: string, options?: { instance?: string; internal_code?: string }) {
    super(
      "/errors/validation-error",
      "Validation error",
      400,
      detail,
      {
        ...options,
        internal_code: options?.internal_code || "VALIDATION_ERROR",
        severity: "MEDIUM",
      }
    );
    this.name = "ValidationError";
  }
}

/**
 * Unprocessable Entity Error (422)
 */
export class UnprocessableEntityError extends ApiError {
  constructor(detail: string, options?: { instance?: string; internal_code?: string }) {
    super(
      "/errors/unprocessable-entity",
      "Unprocessable entity",
      422,
      detail,
      {
        ...options,
        internal_code: options?.internal_code || "UNPROCESSABLE_ENTITY",
        severity: "MEDIUM",
      }
    );
    this.name = "UnprocessableEntityError";
  }
}

/**
 * Unauthorized Error (401) - RFC 7807
 * Authentication is missing or invalid (no token / invalid signature / expired).
 */
export class UnauthorizedError extends ApiError {
  constructor(
    detail: string,
    options?: {
      instance?: string;
      internal_code?: string;
      extra?: ApiErrorResponse["extra"];
    }
  ) {
    super(
      "/errors/unauthorized",
      "Unauthorized",
      401,
      detail,
      {
        ...options,
        internal_code: options?.internal_code || "UNAUTHORIZED",
        severity: "MEDIUM",
      }
    );
    this.name = "UnauthorizedError";
  }
}

/**
 * Forbidden Error (403) - RFC 7807
 * Authentication ok, but the user lacks the required permissions.
 * `extra.issues` SHOULD contain the missing permissions for the caller to inspect.
 */
export class ForbiddenError extends ApiError {
  constructor(
    detail: string,
    options?: {
      instance?: string;
      internal_code?: string;
      extra?: ApiErrorResponse["extra"];
    }
  ) {
    super(
      "/errors/forbidden",
      "Forbidden",
      403,
      detail,
      {
        ...options,
        internal_code: options?.internal_code || "FORBIDDEN",
        severity: "MEDIUM",
      }
    );
    this.name = "ForbiddenError";
  }
}

/**
 * Auth Config Not Loaded Error (500) - RFC 7807
 *
 * The BE cannot process the request because the auth configuration is
 * not loaded in memory. This is a CRITICAL configuration error — the
 * entire application cannot function without auth config.
 *
 * This is NOT a 503 (Service Unavailable) because:
 *   - 503 is intercepted by the FE's DB-offline interceptor (api.ts:175),
 *     which would trigger a /health probe and show a misleading
 *     "DB OFFLINE" / "IDP OFFLINE" sidebar badge.
 *   - The DB and IDP are NOT down — the BE is misconfigured (missing
 *     mandatory rows in auth_configurations, or the startup load failed).
 *
 * The `severity: "CRITICAL"` field in the RFC7807 body drives the FE
 * toast style (toast.critical) — the 500 status just ensures the FE's
 * RFC7807 handler processes it normally without triggering the
 * offline/offline-badge code path.
 */
export class AuthConfigNotLoadedError extends ApiError {
  constructor(
    detail: string,
    options?: {
      instance?: string;
      internal_code?: string;
    }
  ) {
    super(
      "/errors/auth-config-not-loaded",
      "Auth configuration not loaded",
      500,
      detail,
      {
        ...options,
        internal_code: options?.internal_code || "AUTH_CONFIG_NOT_LOADED",
        severity: "CRITICAL",
      }
    );
    this.name = "AuthConfigNotLoadedError";
  }
}

/**
 * Redis Unavailable Error (503) - RFC 7807
 *
 * Redis is a mandatory infrastructure component. When Redis is down,
 * Redis-dependent features (WebAuthn session relay, presence, cache
 * invalidation) cannot function. The FE shows a "Redis offline" health chip.
 *
 * 503 is the standard status for downstream unavailability — same as
 * DATABASE_UNAVAILABLE. The FE's 503 interceptor probes /health, which
 * reports redis.ok=false and triggers the redis_offline chip.
 */
export class RedisUnavailableError extends ApiError {
  constructor(
    detail: string,
    options?: { instance?: string; internal_code?: string }
  ) {
    super(
      "/errors/redis-unavailable",
      "Redis unavailable",
      503,
      detail,
      {
        ...options,
        internal_code: options?.internal_code || "REDIS_UNAVAILABLE",
        severity: "CRITICAL",
      }
    );
    this.name = "RedisUnavailableError";
  }
}

export function isDatabaseUnavailableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;

  const anyErr = err as any;
  const code = typeof anyErr.code === "string" ? anyErr.code : null;

  // Network / Node-level codes
  if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "EHOSTUNREACH" || code === "ENETUNREACH") {
    return true;
  }

  // Postgres server states (common ones when DB is restarting/down)
  // https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (code === "57P01" /* admin_shutdown */ || code === "57P02" /* crash_shutdown */ || code === "57P03" /* cannot_connect_now */) {
    return true;
  }

  return false;
}

/**
 * Check if error is an ApiError instance
 */
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

