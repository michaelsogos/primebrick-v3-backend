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
  /** ts_rank_cd of the full-text lexical channel (0 when absent). */
  lexical_score: number;
  score: number;
  /** True for chunks added by doc-graph expansion (outbound links of the
   *  top hits), not by vector rank — they bypass the FE similarity floor. */
  graph_expanded?: boolean;
  /** True for chunks recalled ONLY by the lexical channel (not in the
   *  vector top-N) whose FTS rank is strong — they bypass the FE
   *  similarity floor like graph_expanded ones. */
  lexical_match?: boolean;
}

/** Weight of each keyword hit in the final score (similarity units). */
const KEYWORD_BOOST = 0.05;
/** Weight of the full-text lexical rank in the final score — larger than
 *  the ILIKE boost: a real FTS match is a second recall channel, not just
 *  a tie-breaker inside vector candidates. */
const LEXICAL_BOOST = 0.15;
/** Minimum ts_rank_cd for a lexical-only candidate (absent from the vector
 *  top-N) to be kept and flagged `lexical_match` — below this the match is
 *  too weak to bypass the similarity floor. */
const LEX_MATCH_MIN = 0.1;
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
    /** Rank-tuning overrides — callers (e.g. the Guide cerebellum) may
     *  retune the retrieval balance per assistant; defaults below. */
    keyword_boost?: number;
    lexical_boost?: number;
    lex_match_min?: number;
    oversample?: number;
    graph_max_paths?: number;
  },
): Promise<DocsSearchResult[]> {
  const limit = Math.min(Math.max(opts.limit ?? 6, 1), 20);
  const keywordBoost = opts.keyword_boost ?? KEYWORD_BOOST;
  const lexicalBoost = opts.lexical_boost ?? LEXICAL_BOOST;
  const lexMatchMin = opts.lex_match_min ?? LEX_MATCH_MIN;
  const oversample = Math.min(Math.max(opts.oversample ?? OVERSAMPLE, 1), 10);
  const keywords = (opts.keywords ?? [])
    .map((k) => k.trim())
    .filter((k) => k.length >= 2)
    .slice(0, 10);
  const embeddingStr = `[${opts.embedding.join(",")}]`;

  // Hybrid retrieval: the HNSW vector channel is unioned with a full-text
  // lexical channel (websearch_to_tsquery over the S0 keywords, 'simple'
  // dictionary — no stemming, safe for identifiers like `idp_code`).
  // Lexical-only rows enter the candidate set with their real similarity,
  // so exact-term docs the vectors miss can still surface; `similarity`
  // stays the floor metric, `lexical_score` only re-ranks.
  const lexQuery = keywords.join(" ").trim() || null;

  const result = await pool.query(
    `WITH vec AS (
       SELECT d.id,
              1 - (d.embedding <=> $1::vector) AS similarity
       FROM ai.docs_kb d
       WHERE ($4::text IS NULL OR d.repo = $4)
       ORDER BY d.embedding <=> $1::vector
       LIMIT $2::int * $6::int
     ),
     lex AS (
       SELECT d.id,
              ts_rank_cd(to_tsvector('simple', d.content),
                         websearch_to_tsquery('simple', $7::text)) AS lexical_score
       FROM ai.docs_kb d
       WHERE $7::text IS NOT NULL
         AND ($4::text IS NULL OR d.repo = $4)
         AND to_tsvector('simple', d.content) @@ websearch_to_tsquery('simple', $7::text)
       ORDER BY lexical_score DESC
       LIMIT $2::int * $6::int
     ),
     candidates AS (
       SELECT
         d.id, d.repo, d.path, d.title, d.chunk_idx, d.content, d.metadata,
         COALESCE(v.similarity, 1 - (d.embedding <=> $1::vector)) AS similarity,
         COALESCE(l.lexical_score, 0)::float8 AS lexical_score,
         (v.id IS NULL AND l.lexical_score >= $9::float8) AS lexical_match
       FROM ai.docs_kb d
       JOIN (SELECT id FROM vec UNION SELECT id FROM lex) cand ON cand.id = d.id
       LEFT JOIN vec v ON v.id = d.id
       LEFT JOIN lex l ON l.id = d.id
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
       similarity, keyword_hits, lexical_score, lexical_match,
       similarity + $5::float8 * keyword_hits + $8::float8 * lexical_score
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
      keywordBoost,
      oversample,
      lexQuery,
      lexicalBoost,
      lexMatchMin,
    ],
  );

  const hits = result.rows.map((row) => ({
    ...(row as Omit<DocsSearchResult, "score" | "similarity" | "keyword_hits" | "lexical_score" | "lexical_match">),
    similarity: Number(row.similarity),
    keyword_hits: Number(row.keyword_hits),
    lexical_score: Number(row.lexical_score),
    lexical_match: row.lexical_match === true,
    score: Number(row.score),
  }));

  const floor = opts.min_similarity ?? 0;
  const seeds = hits.filter((h) => h.similarity >= floor);
  return [
    ...hits,
    ...(await expandDocGraph(pool, opts.embedding, seeds, opts.graph_max_paths)),
  ];
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
  maxPaths: number = GRAPH_MAX_PATHS,
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
  const paths = linked.slice(0, Math.min(Math.max(maxPaths, 0), 20));
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
    lexical_score: 0,
    score: Number(row.similarity),
    graph_expanded: true,
  }));
}

/**
 * Fetch a whole document by (repo, path) — the `docs_fetch` tool backend
 * for the agentic guide loop: the model sees a cited path in an excerpt and
 * can dereference the FULL page, not just the retrieved chunk.
 * Chunks are re-joined in order; caller caps the content budget.
 */
export async function getDocByPath(
  pool: Pool,
  params: { path: string; repo?: string },
): Promise<{ repo: string; path: string; title: string; content: string } | null> {
  const result = await pool.query(
    `SELECT repo, path, title, content
     FROM ai.docs_kb
     WHERE path = $1 ${params.repo ? "AND repo = $2" : ""}
     ORDER BY repo, chunk_idx`,
    params.repo ? [params.path, params.repo] : [params.path],
  );
  if (!result.rows.length) return null;
  const first = result.rows[0];
  // Same path can exist in several repos — when the caller omits `repo`,
  // return only the first repo's chunks (rows are ordered by repo).
  const content = result.rows
    .filter((r) => r.repo === first.repo)
    .map((r) => r.content)
    .join("\n\n");
  return { repo: first.repo, path: first.path, title: first.title, content };
}
