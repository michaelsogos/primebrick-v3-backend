import { logger } from "@primebrick/sdk";
import type { ErrorRequestHandler } from "express";
import { mapDalError } from "@primebrick/sdk";
import { isDatabaseUnavailableError, isApiError, type ApiErrorResponse } from "./api-errors.js";


export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Log all errors to console with full details including stack trace.
  // The request line goes on its own line (amber) so the failed call is
  // visible at a glance before the payload. originalUrl keeps the QS.
  const requestLine = `${req.method} ${req.protocol}://${req.headers.host ?? "localhost"}${req.originalUrl || req.url}`;
  logger.error(`Backend Error\n  \x1b[38;5;214m${requestLine}\x1b[0m`, { tags: ["http"],
    message: err.message,
    stack: err.stack,
    name: err.name,
    ...err
  });

  if (res.headersSent) return;

  const instance = req.originalUrl || req.url;

  // Handle ApiError instances (RFC 7807 compliant)
  if (isApiError(err)) {
    const payload = err.toResponse();
    res.status(err.status).json(payload);
    return;
  }

  // DAL errors (ERR01–ERR07, 57014, NOT_FOUND/VALIDATION/…): shared pure
  // mapper from the SDK — identical mapping to the US microservices.
  // Bulk raises carry structured detail → extra.issues for the FE dialog.
  const mapped = mapDalError(err, instance);
  if (mapped) {
    res.status(mapped.status).json(mapped.body);
    return;
  }

  if (isDatabaseUnavailableError(err)) {
    const payload = {
      type: '/errors/database-unavailable',
      title: 'Database unavailable',
      status: 503,
      detail: 'The database is currently unavailable. Please try again later.',
      instance,
      severity: 'CRITICAL' as const,
    };
    // 503 is the standard (>= 501) for downstream unavailability.
    res.status(503).json(payload);
    return;
  }

  // Transport-level errors that already carry an HTTP status (e.g. the
  // ext-json body parser sets 400 "Invalid JSON body" / 413 "Body exceeds
  // limit") — honor it instead of masking the client error as a 500.
  const errStatus = (err as { status?: unknown }).status;
  if (typeof errStatus === "number" && errStatus >= 400 && errStatus < 500) {
    res.status(errStatus).json({
      type: '/errors/bad-request',
      title: 'Bad request',
      status: errStatus,
      detail: typeof err.message === "string" ? err.message : 'Bad request',
      instance,
      severity: 'MEDIUM',
    });
    return;
  }

  const payload = {
    type: '/errors/internal-error',
    title: 'Internal server error',
    status: 500,
    detail: 'An unexpected error occurred. Please try again later.',
    instance,
    severity: 'HIGH' as const,
  };
  res.status(500).json(payload);
};
// DAL error mapping lives in the SDK (@primebrick/sdk mapDalError) — shared