import type { ErrorRequestHandler } from "express";
import { isDatabaseUnavailableError, type ApiErrorResponse } from "./api-errors.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (res.headersSent) return;

  if (isDatabaseUnavailableError(err)) {
    const payload: ApiErrorResponse = { error: "DATABASE_UNAVAILABLE", impact: "CRITICAL" };
    // 503 is the standard (>= 501) for downstream unavailability.
    res.status(503).json(payload);
    return;
  }

  // Fallback: keep errors non-fatal and consistent.
  const payload: ApiErrorResponse = { error: "INTERNAL_ERROR", impact: "HIGH" };
  res.status(500).json(payload);
};

