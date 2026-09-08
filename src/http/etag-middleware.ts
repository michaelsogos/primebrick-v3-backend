/**
 * ETag middleware — reusable Express middleware for conditional GET requests.
 *
 * Flow:
 * 1. Route handler runs and sets `res.locals.cacheEntry` (a `CacheEntry<T>` from the SDK).
 * 2. This middleware compares `If-None-Match` header against `cacheEntry.etag`.
 * 3. If match → `304 Not Modified` (no body, short-circuit).
 * 4. If no match → sets `ETag` + `X-PB-Cached` + `Cache-Control` headers, lets the
 *    handler send the body.
 *
 * Usage:
 * ```ts
 * router.get("/list", etagMiddleware(), async (req, res, next) => {
 *   res.locals.cacheEntry = await dal.findAll(); // returns CacheEntry<T>
 *   next(); // let etagMiddleware decide 304 vs 200
 * }, (req, res) => {
 *   // If we get here, ETag didn't match → send body
 *   res.json((res.locals.cacheEntry as CacheEntry<any>).data);
 * });
 * ```
 *
 * If the handler calls `res.json()` directly without setting `res.locals.cacheEntry`,
 * this middleware is a no-op (passes through).
 */

import type { Request, Response, NextFunction } from "express";
import {
  etagMatches,
  CACHE_HEADERS,
  CACHE_CONTROL_CACHED,
  type CacheEntry,
} from "@primebrick/sdk";

export function etagMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const entry = res.locals.cacheEntry as CacheEntry<unknown> | undefined;
    if (!entry) {
      next();
      return;
    }

    const ifNoneMatch = req.headers[CACHE_HEADERS.IF_NONE_MATCH.toLowerCase()] as string | undefined;
    if (ifNoneMatch && etagMatches(ifNoneMatch, entry.etag)) {
      // 304 — not modified, no body
      res.setHeader(CACHE_HEADERS.ETAG, entry.etag);
      res.setHeader(CACHE_HEADERS.PB_CACHED, "true");
      res.setHeader("Cache-Control", CACHE_CONTROL_CACHED);
      res.status(304).end();
      return;
    }

    // 200 — set ETag + cache headers, let the handler send the body
    res.setHeader(CACHE_HEADERS.ETAG, entry.etag);
    res.setHeader(CACHE_HEADERS.PB_CACHED, "true");
    res.setHeader("Cache-Control", CACHE_CONTROL_CACHED);
    next();
  };
}
