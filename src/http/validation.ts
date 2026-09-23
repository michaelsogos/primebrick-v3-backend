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

/**
 * Bounded float field for request BODIES — same ext-json caveat as
 * `zBoundedInt`: a JSON `1` (or `1.0` serialized without decimals) arrives as
 * `bigint` and fails a plain `z.number()`. Use for any numeric body field
 * that can legitimately carry an integer value (temperature, rank, …).
 */
export function zBoundedNumber(min: number, max: number) {
  return z
    .union([z.number(), z.bigint()])
    .transform((v) => (typeof v === "bigint" ? Number(v) : v))
    .pipe(z.number().min(min).max(max));
}

/**
 * UPDATE-body schema — validates against `schema.partial()` (provided fields
 * get full validation + transforms) then strips every key that was absent in
 * the raw input.
 *
 * Why: in zod v4 `.partial()` keeps `.default()` wrappers — an omitted key
 * parses to its DEFAULT, and the DAL then writes that default over the
 * existing column. A partial PUT like `{vram_mb: 2257}` silently resets
 * temperature/top_p/rank/engine_type/... to schema defaults (observed on
 * ai_model, version 41→42). Pass the FULL update shape (incl. `version`)
 * so required fields still validate.
 */
export function zPartialNoDefaults<S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
): z.ZodType<{ [K in keyof z.output<S>]?: z.output<S>[K] }> {
  type Out = { [K in keyof z.output<S>]?: z.output<S>[K] };
  const partial = schema.partial();
  return z.unknown().transform((v, ctx) => {
    const r = partial.safeParse(v);
    if (!r.success) {
      for (const i of r.error.issues) ctx.addIssue(i as never);
      return z.NEVER;
    }
    const raw = v as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(r.data as Record<string, unknown>).filter(
        ([k]) => k in raw,
      ),
    ) as Out;
  });
}

