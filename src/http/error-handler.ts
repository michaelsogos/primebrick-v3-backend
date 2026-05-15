import type { ErrorRequestHandler } from "express";
import { isDatabaseUnavailableError, type ApiErrorResponse } from "./api-errors.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Log all errors to console with full details including stack trace
  console.error("[Backend Error]", {
    message: err.message,
    stack: err.stack,
    name: err.name,
    ...err
  });

  if (res.headersSent) return;

  if (isDatabaseUnavailableError(err)) {
    const payload = {
      type: '/errors/database-unavailable',
      title: 'Database unavailable',
      status: 503,
      detail: 'The database is currently unavailable. Please try again later.',
      severity: 'CRITICAL' as const,
    };
    // 503 is the standard (>= 501) for downstream unavailability.
    res.status(503).json(payload);
    return;
  }

  const payload = {
    type: '/errors/internal-error',
    title: 'Internal server error',
    status: 500,
    detail: 'An unexpected error occurred. Please try again later.',
    severity: 'HIGH' as const,
  };
  res.status(500).json(payload);
};
