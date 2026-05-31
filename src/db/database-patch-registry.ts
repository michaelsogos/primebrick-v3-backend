import type { Pool } from "pg";

/** Registry table on TARGET (create once; used for repeatable database patch applies). */
export const PATCH_REGISTRY_FQNAME = "public.primebrick_database_patches";

export const PATCH_REGISTRY_DDL = `-- One-time on TARGET (idempotent):
CREATE TABLE IF NOT EXISTS public.primebrick_database_patches (
  patch_id text PRIMARY KEY,
  content_sha256 text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS primebrick_database_patches_sha_idx
  ON public.primebrick_database_patches (content_sha256);
`;

/** True if this exact patch body was already recorded (same semantic content). */
export async function isPatchBodyAlreadyRecorded(pool: Pool, contentSha256: string): Promise<boolean> {
  const reg = await pool.query<{ oid: string | null }>(
    `SELECT to_regclass('public.primebrick_database_patches')::text AS oid`
  );
  const oid = reg.rows[0]?.oid;
  if (!oid || oid === "") return false;
  const hit = await pool.query(
    `SELECT 1 FROM public.primebrick_database_patches WHERE content_sha256 = $1 LIMIT 1`,
    [contentSha256]
  );
  return (hit.rowCount ?? 0) > 0;
}

