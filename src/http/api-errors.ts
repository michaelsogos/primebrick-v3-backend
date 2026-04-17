export type ImpactLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ApiErrorCode =
  | "DATABASE_UNAVAILABLE"
  | "LIST_FAILED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export type ApiErrorResponse = {
  error: ApiErrorCode | (string & {});
  impact: ImpactLevel;
};

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

