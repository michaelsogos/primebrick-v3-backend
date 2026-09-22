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
       LIMIT $2 * $6
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
       similarity + $5::float8 * keyword_hits AS score
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

  return result.rows.map((row) => ({
    ...(row as Omit<DocsSearchResult, "score" | "similarity" | "keyword_hits">),
    similarity: Number(row.similarity),
    keyword_hits: Number(row.keyword_hits),
    score: Number(row.score),
  }));
}
