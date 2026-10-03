/**
 * DocsSearchService — documentation KB vector search.
 *
 * Thin delegation to `searchDocsKb` (pgvector HNSW + keyword boost); exists so
 * controllers never hold a direct reference to the DAL layer.
 */

import { getPool } from "../../db/pool.js";
import { searchDocsKb } from "./docs-search-dal.js";

export class DocsSearchService {
  async search(params: {
    embedding: number[];
    keywords?: string[];
    limit?: number;
    repo?: string;
    min_similarity?: number;
  }) {
    return searchDocsKb(getPool(), params);
  }
}
