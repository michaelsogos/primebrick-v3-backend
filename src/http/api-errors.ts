export type ImpactLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ApiErrorCode =
  | "DATABASE_UNAVAILABLE"
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

