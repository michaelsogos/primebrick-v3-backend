/**
 * docs_kb search DAL — semantic + keyword search over the documentation
 * knowledge base (`ai.docs_kb`, populated by the ai microservice's manual
 * embedding pipeline).
 *
 * Raw SQL (not the DAL Repository): pgvector's cosine operator (<=>) is not
 * supported by the metadata-driven DAL. The BE never embeds text — callers
 * pass a pre-computed query embedding (384-dim float array); all vector math
 * runs inside Postgres.
 *
 * Ranking: two-phase. Phase 1 uses the HNSW index to fetch the top-N nearest
 * chunks by cosine distance (ORDER BY embedding <=> $1 — the index is only
 * used with this exact ordering expression, so keyword terms CANNOT be mixed
 * in here). Phase 2 re-ranks that small candidate set with a keyword boost:
 * literal terms (identifiers like "IDP Code", config keys, error codes)
 * matched case-insensitively against title, path and content. The ILIKE
 * scan runs on ~24 rows, not the whole table — no extra index needed.
 * Phase 2 also applies a content-type weight: user-guide tutorials rank
 * above OpenAPI endpoint records for the same similarity, so procedural
 * questions surface manual pages instead of raw API listings.
 */
import type { Pool } from "pg";

export interface DocsSearchResult {
  id: bigint;
  repo: string;
  path: string;
  title: string;
  chunk_idx: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
  keyword_hits: number;
  score: number;
  /** True for chunks added by doc-graph expansion (outbound links of the
   *  top hits), not by vector rank — they bypass the FE similarity floor. */
  graph_expanded?: boolean;
}

/** Weight of each keyword hit in the final score (similarity units). */
const KEYWORD_BOOST = 0.05;
/** How many HNSW candidates to fetch before keyword re-ranking. */
const OVERSAMPLE = 4;

export async function searchDocsKb(
  pool: Pool,
  opts: {
    embedding: number[];
    keywords?: string[];
    limit?: number;
    repo?: string;
    /** Similarity floor — graph expansion only follows links of hits that
     *  cleared it. Without it, an uncovered question would seed expansion
     *  from near-zero hits and inject unrelated context. */
    min_similarity?: number;
  },
): Promise<DocsSearchResult[]> {
  const limit = Math.min(Math.max(opts.limit ?? 6, 1), 20);
  const keywords = (opts.keywords ?? [])
    .map((k) => k.trim())
    .filter((k) => k.length >= 2)
    .slice(0, 10);
  const embeddingStr = `[${opts.embedding.join(",")}]`;

  const result = await pool.query(
    `WITH candidates AS (
       SELECT
         d.id, d.repo, d.path, d.title, d.chunk_idx, d.content, d.metadata,
         1 - (d.embedding <=> $1::vector) AS similarity
       FROM ai.docs_kb d
       WHERE ($4::text IS NULL OR d.repo = $4)
       ORDER BY d.embedding <=> $1::vector
       LIMIT $2::int * $6::int
     ),
     scored AS (
       SELECT c.*, k.keyword_hits
       FROM candidates c
       CROSS JOIN LATERAL (
         SELECT COUNT(*)::int AS keyword_hits
         FROM unnest($3::text[]) AS kw
         WHERE c.title ILIKE '%' || kw || '%'
            OR c.path ILIKE '%' || kw || '%'
            OR c.content ILIKE '%' || kw || '%'
       ) k
     )
     SELECT
       id, repo, path, title, chunk_idx, content, metadata,
       similarity, keyword_hits,
       similarity + $5::float8 * keyword_hits
         + CASE metadata->>'content_type'
             WHEN 'tutorial' THEN 0.08
             WHEN 'conceptual' THEN 0.03
             WHEN 'api' THEN -0.10
             ELSE 0
           END AS score
     FROM scored
     ORDER BY score DESC
     LIMIT $2`,
    [
      embeddingStr,
      limit,
      keywords.length > 0 ? keywords : null,
      opts.repo ?? null,
      KEYWORD_BOOST,
      OVERSAMPLE,
    ],
  );

  const hits = result.rows.map((row) => ({
    ...(row as Omit<DocsSearchResult, "score" | "similarity" | "keyword_hits">),
    similarity: Number(row.similarity),
    keyword_hits: Number(row.keyword_hits),
    score: Number(row.score),
  }));

  const floor = opts.min_similarity ?? 0;
  const seeds = hits.filter((h) => h.similarity >= floor);
  return [...hits, ...(await expandDocGraph(pool, opts.embedding, seeds))];
}

/**
 * Doc-graph expansion (Obsidian-style backlink following): every top hit's
 * declared outbound links (metadata.links, extracted at index time) are
 * followed — one best-matching chunk per linked page is appended. These are
 * structural correlations, not vector hits, so they carry their real
 * similarity but are flagged `graph_expanded` for the caller's thresholding.
 * Bounded: distinct linked paths are capped to keep the context sane.
 */
const GRAPH_MAX_PATHS = 6;

async function expandDocGraph(
  pool: Pool,
  embedding: number[],
  hits: DocsSearchResult[],
): Promise<DocsSearchResult[]> {
  const seen = new Set(hits.map((h) => h.path));
  const linked: string[] = [];
  for (const h of hits) {
    const links = h.metadata?.links;
    if (!Array.isArray(links)) continue;
    for (const p of links) {
      if (typeof p === "string" && !seen.has(p) && !linked.includes(p)) linked.push(p);
    }
  }
  const paths = linked.slice(0, GRAPH_MAX_PATHS);
  if (!paths.length) return [];

  const result = await pool.query(
    `SELECT DISTINCT ON (d.path)
       d.id, d.repo, d.path, d.title, d.chunk_idx, d.content, d.metadata,
       1 - (d.embedding <=> $1::vector) AS similarity
     FROM ai.docs_kb d
     WHERE d.path = ANY($2::text[])
     ORDER BY d.path, d.embedding <=> $1::vector`,
    [`[${embedding.join(",")}]`, paths],
  );

  return result.rows.map((row) => ({
    id: row.id,
    repo: row.repo,
    path: row.path,
    title: row.title,
    chunk_idx: row.chunk_idx,
    content: row.content,
    metadata: row.metadata,
    similarity: Number(row.similarity),
    keyword_hits: 0,
    score: Number(row.similarity),
    graph_expanded: true,
  }));
}
