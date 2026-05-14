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
    issues: err.issues.map((i) => ({
      path: i.path.join("."),
      code: i.code,
      message: i.message,
    })),
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

