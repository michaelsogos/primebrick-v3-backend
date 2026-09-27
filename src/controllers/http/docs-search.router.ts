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
import { validateBody } from "../../http/validation.js";
import { DocsSearchService } from "../../modules/system/docs-search.service.js";

const DocsSearchBodySchema = z.object({
  embedding: z.array(z.number().finite()).min(1),
  keywords: z.array(z.string()).optional(),
  limit: z.number().optional(),
  repo: z.string().optional(),
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
