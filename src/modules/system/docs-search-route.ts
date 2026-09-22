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

import { makeProtectedRouter } from "../../http/protected-router.js";
import { rbacHandler } from "../auth/rbac.middleware.js";
import { Permission } from "@primebrick/sdk";
import { asyncHandler } from "../../http/async-handler.js";
import { getPool } from "../../db/pool.js";
import { searchDocsKb } from "./docs-search-dal.js";

export function docsSearchRouter() {
  const router = makeProtectedRouter();

  router.post(
    "/api/v1/system/docs/search",
    rbacHandler([Permission.AUTHENTICATED_USER]),
    asyncHandler(async (req, res) => {
      const { embedding, keywords, limit, repo } = req.body ?? {};

      if (!Array.isArray(embedding) || embedding.length === 0 ||
          !embedding.every((n) => typeof n === "number" && Number.isFinite(n))) {
        res.status(400).json({
          type: "about:blank",
          status: 400,
          title: "Bad Request",
          detail: "embedding must be a non-empty array of finite numbers",
        });
        return;
      }
      if (keywords !== undefined &&
          (!Array.isArray(keywords) || !keywords.every((k) => typeof k === "string"))) {
        res.status(400).json({
          type: "about:blank",
          status: 400,
          title: "Bad Request",
          detail: "keywords must be an array of strings",
        });
        return;
      }

      const results = await searchDocsKb(getPool(), {
        embedding,
        keywords,
        limit: typeof limit === "number" ? limit : undefined,
        repo: typeof repo === "string" ? repo : undefined,
      });
      res.json({ results });
    }),
  );

  return router;
}
