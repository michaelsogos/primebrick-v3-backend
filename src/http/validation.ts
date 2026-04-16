import type { RequestHandler } from "express";
import { z } from "zod";

function zodErrorToResponse(err: z.ZodError) {
  return {
    error: "VALIDATION_ERROR",
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
      res.status(400).json(zodErrorToResponse(r.error));
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
      res.status(400).json(zodErrorToResponse(r.error));
      return;
    }
    (req as any).body = r.data;
    next();
  };
}

