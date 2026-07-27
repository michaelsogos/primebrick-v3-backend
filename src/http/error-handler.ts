import type { ErrorRequestHandler } from "express";
import { isDatabaseUnavailableError, isApiError, type ApiErrorResponse } from "./api-errors.js";

/**
 * Check if a PostgreSQL error is an optimistic concurrency violation (ERR01).
 *
 * The DAL raises `RAISE EXCEPTION ... USING ERRCODE = 'ERR01'` in PostgreSQL
 * when the `version` column doesn't match the expected value. node-postgres
 * propagates this as a `DatabaseError` with `err.code === 'ERR01'`.
 */
function isOptimisticConcurrencyError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  return (err as Record<string, unknown>).code === "ERR01";
}

/**
 * Check if a DAL error is a missing-version error (ERR02).
 * The DAL throws `MissingVersionError` with `code === 'ERR02'` when an
 * auditable-entity write is attempted without a `version` field.
 */
function isMissingVersionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  return (err as Record<string, unknown>).code === "ERR02";
}

/**
 * Check if a DAL error is a record-vanished error (ERR03).
 * The DAL throws `RecordVanishedError` with `code === 'ERR03'` when the
 * row was hard-deleted by another writer between read and write.
 */
function isRecordVanishedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  return (err as Record<string, unknown>).code === "ERR03";
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Log all errors to console with full details including stack trace
  console.error("[Backend Error]", {
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

  // Handle optimistic concurrency violation (ERR01) → 409
  // The record was modified by another user. The FE uses this to trigger
  // the conflict resolution UI.
  if (isOptimisticConcurrencyError(err)) {
    const payload: ApiErrorResponse = {
      type: 'urn:primebrick:err01',
      title: 'Optimistic concurrency violation',
      status: 409,
      detail: err.message || 'The record was modified by another user. Please refresh and try again.',
      instance,
      internal_code: 'ERR01',
      severity: 'HIGH',
    };
    res.status(409).json(payload);
    return;
  }

  // Handle missing version field (ERR02) → 400
  if (isMissingVersionError(err)) {
    const payload: ApiErrorResponse = {
      type: 'urn:primebrick:err02',
      title: 'Missing version field',
      status: 400,
      detail: err.message || 'The version field is required for this operation.',
      instance,
      internal_code: 'ERR02',
      severity: 'MEDIUM',
    };
    res.status(400).json(payload);
    return;
  }

  // Handle record vanished (ERR03) → 404
  if (isRecordVanishedError(err)) {
    const payload: ApiErrorResponse = {
      type: 'urn:primebrick:err03',
      title: 'Record vanished',
      status: 404,
      detail: err.message || 'The record was deleted by another user.',
      instance,
      internal_code: 'ERR03',
      severity: 'MEDIUM',
    };
    res.status(404).json(payload);
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
};
