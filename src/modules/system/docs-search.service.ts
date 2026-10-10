/**
 * DocsSearchService — documentation KB vector search.
 *
 * Thin delegation to `searchDocsKb` (pgvector HNSW + keyword boost); exists so
 * controllers never hold a direct reference to the DAL layer.
 */

import { internalFetch, getAuthConfig, serializeAuthUserToHeaders, type AuthUser } from "@primebrick/sdk";
import { getPool } from "../../db/pool.js";
import { ServiceRegistryRepo } from "../proxy/service-registry-repo.js";
import { searchDocsKb, getDocByPath } from "./docs-search-dal.js";

/**
 * Resolve the `ai` microservice instance from the service registry and ask
 * it to embed the query text. The FE never embeds — query embedding is a
 * server concern (heavier instruct models than any browser can run).
 */
async function embedQueryText(query: string, user: AuthUser | undefined): Promise<number[]> {
  const pool = getPool();
  const registry = new ServiceRegistryRepo(pool);
  const instances = (await registry.findAllByCode("ai")).filter((i) => i.status === "online");
  if (!instances.length) {
    throw new Error("AI microservice is not available — cannot embed the search query");
  }
  const instance = instances[0];
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (user) {
    const cfg = await getAuthConfig();
    Object.assign(headers, serializeAuthUserToHeaders(user, cfg));
  }
  const res = await internalFetch(new URL("/api/v1/ai/embed", instance.base_url).toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({ text: query, kind: "query" }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    throw new Error(`AI embed failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { embedding: number[] };
  return data.embedding;
}

export class DocsSearchService {
  async search(
    params: {
      /** Raw query text — embedded server-side via the AI microservice.
       *  Mutually exclusive with `embedding`. */
      query?: string;
      /** Legacy: pre-computed embedding (kept for internal callers/tests). */
      embedding?: number[];
      keywords?: string[];
      limit?: number;
      repo?: string;
      path_prefix?: string;
      min_similarity?: number;
      keyword_boost?: number;
      lexical_boost?: number;
      lex_match_min?: number;
      oversample?: number;
      graph_max_paths?: number;
    },
    user?: AuthUser,
  ) {
    const embedding = params.embedding ?? (params.query ? await embedQueryText(params.query, user) : undefined);
    if (!embedding?.length) {
      throw new Error("docs search requires either 'query' text or a precomputed 'embedding'");
    }
    return searchDocsKb(getPool(), { ...params, embedding });
  }

  async getDocument(params: { path: string; repo?: string }) {
    return getDocByPath(getPool(), params);
  }
}
