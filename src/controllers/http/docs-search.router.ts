/**
 * Documentation KB search endpoint (system RPC).
 *
 * POST /api/v1/system/docs/search
 *
 * Body: { embedding: number[], keywords?: string[], limit?: number, repo?: string }
 *
 * The caller pre-computes the 384-dim query embedding (browser worker or ai
 * microservice); this route is a thin pass-through — all vector math runs in
 * Postgres (pgvector HNSW + keyword boost). Used by the local Guide
 * assistant and by the MCP `search_docs` tool (global assistant).
 */

import { z } from "zod";

import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../../modules/auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { asyncHandler } from "../../http/async-handler.js";
import { validateBody, zBoundedInt, zBoundedNumber } from "../../http/validation.js";
import { DocsSearchService } from "../../modules/system/docs-search.service.js";

const DocsSearchBodySchema = z.object({
  // extJsonBodyParser decodes every integer as bigint — embedding elements
  // that happen to serialize without decimals (0, 1) arrive as bigint too.
  embedding: z.array(zBoundedNumber(-10, 10)).min(1),
  keywords: z.array(z.string()).optional(),
  limit: zBoundedInt(1, 20).optional(),
  repo: z.string().optional(),
  /** Caller's similarity floor — doc-graph expansion only follows links of
   *  hits that cleared it (a no-coverage question must stay uncovered). */
  min_similarity: zBoundedNumber(0, 1).optional(),
  /** Rank-tuning overrides (bounded) — per-assistant retrieval balance. */
  keyword_boost: zBoundedNumber(0, 1).optional(),
  lexical_boost: zBoundedNumber(0, 1).optional(),
  lex_match_min: zBoundedNumber(0, 1).optional(),
  oversample: zBoundedInt(1, 10).optional(),
  graph_max_paths: zBoundedInt(0, 20).optional(),
});

export function docsSearchRouter() {
  const router = makeProtectedRouter();
  const service = new DocsSearchService();

  router.post(
    "/api/v1/system/docs/search",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    validateBody(DocsSearchBodySchema),
    asyncHandler(async (req, res) => {
      const results = await service.search(req.body);
      res.json({ results });
    }),
  );

  return router;
}
