import type { RequestHandler, Request } from "express";
import { z } from "zod";

function zodErrorToResponse(err: z.ZodError, req: Request) {
  return {
    type: '/errors/validation-error',
    title: 'Validation error',
    status: 400,
    detail: 'Request validation failed',
    severity: 'HIGH' as const,
    internal_code: 'VALIDATION_ERROR',
    instance: req.path,
    extra: {
      issues: err.issues.map((i) => ({
        path: i.path.join("."),
        code: i.code,
        message: i.message,
      }))
    }
  };
}

export function validateQuery<T>(schema: z.ZodType<T>): RequestHandler {
  return (req, res, next) => {
    const r = schema.safeParse(req.query);
    if (!r.success) {
      res.status(400).json(zodErrorToResponse(r.error, req));
      return;
    }
    (req as any).query = r.data;
    next();
  };
}

export function validateBody<T>(schema: z.ZodType<T>): RequestHandler {
  return (req, res, next) => {
    const r = schema.safeParse(req.body);
    if (!r.success) {
      res.status(400).json(zodErrorToResponse(r.error, req));
      return;
    }
    (req as any).body = r.data;
    next();
  };
}

/**
 * Bounded integer field for request BODIES.
 *
 * `extJsonBodyParser` decodes EVERY JSON integer as native `bigint`, so a
 * plain `z.number().int()` in a body schema always fails on the wire.
 * `zBoundedInt` accepts both `number` and `bigint`, normalizes to `number`,
 * then applies the int + min/max checks. Use it instead of
 * `z.number().int().min().max()` in any schema that parses a request body.
 * (Query params stay `z.coerce.number()` — they arrive as strings.)
 */
export function zBoundedInt(min: number, max: number) {
  return z
    .union([z.number(), z.bigint()])
    .transform((v) => (typeof v === "bigint" ? Number(v) : v))
    .pipe(z.number().int().min(min).max(max));
}

