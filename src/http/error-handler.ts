import type { ErrorRequestHandler } from "express";
import { mapDalError } from "@primebrick/sdk";
import { isDatabaseUnavailableError, isApiError, type ApiErrorResponse } from "./api-errors.js";


export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Log all errors to console with full details including stack trace
  console.error("Backend Error", {
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

  const payload = {
    type: '/errors/internal-error',
    title: 'Internal server error',
    status: 500,
    detail: 'An unexpected error occurred. Please try again later.',
    instance,
    severity: 'HIGH' as const,
  };
  res.status(500).json(payload);
};// DAL error mapping lives in the SDK (@primebrick/sdk mapDalError) — shared