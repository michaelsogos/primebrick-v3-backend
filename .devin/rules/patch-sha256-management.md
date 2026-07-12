# Devin Rule: Database Patch SHA256 Management

## Trigger
- Applies when `pnpm run db:migrate` fails with "exists in registry with a different content_sha256 — refusing to run"
- Applies when the init patch (`00000000000000_init_database.sql`) or any existing patch file is modified
- Applies when consolidating patches or updating the initial database schema

## The Problem

The patch registry (`public.primebrick_database_patches`) records the `content_sha256` of each patch file when it was first applied. If a patch file is later modified (e.g. the init script is updated with new tables/columns), the hash no longer matches and `db:migrate` refuses to run.

## The Rule

### 1. NEVER create a new initial patch
- Do NOT create `00000000000000_init_database_v2.sql` or similar.
- There is exactly ONE init patch: `00000000000000_init_database.sql`.
- If the init schema changes, UPDATE the existing file in place.

### 2. UPDATE the existing patch file
- Modify `db-meta/patches/00000000000000_init_database.sql` directly.
- The init patch is idempotent (uses `IF NOT EXISTS` guards), so updating it is safe.
- New tables, columns, indexes, and seed data should be added to the init patch body.

### 3. Create a fire-and-forget script to update existing databases
- Existing databases already have the OLD sha256 in their registry.
- Create a SQL file in `db-meta/fire-and-forget/` that updates the registry hash.
- Naming: `update_<patch_id>_sha256.sql` (e.g. `update_init_patch_sha256.sql`).
- The script must be idempotent (only update if hash differs).

Example fire-and-forget script:
```sql
-- Fire-and-forget: Update content_sha256 for init_database patch in the patch registry.
BEGIN;
UPDATE public.primebrick_database_patches
SET content_sha256 = '<NEW_SHA256_HEX>'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '<NEW_SHA256_HEX>';
COMMIT;
```

### 4. How to calculate the new SHA256
Run this from the backend root:
```bash
node -e "const {readFileSync}=require('fs'); const {createHash}=require('crypto'); const raw=readFileSync('db-meta/patches/00000000000000_init_database.sql','utf8'); console.log(createHash('sha256').update(raw,'utf8').digest('hex'))"
```

### 5. How to apply the fire-and-forget script
Fire-and-forget scripts are NOT run automatically by `db:migrate`. They must be applied manually on each existing database:

Option A — via psql:
```bash
psql "$DATABASE_URL" -f db-meta/fire-and-forget/update_init_patch_sha256.sql
```

Option B — via Node script (from backend root):
```bash
npx tsx -e "import {Pool} from 'pg'; import {readFileSync} from 'fs'; const pool=new Pool({connectionString:process.env.DATABASE_URL}); await pool.query(readFileSync('db-meta/fire-and-forget/update_init_patch_sha256.sql','utf8')); await pool.end(); console.log('Done');"
```

After applying the fire-and-forget script, `pnpm run db:migrate` will skip the init patch (hash matches) and apply any new patches normally.

### 6. Document the SHA256 update in the fire-and-forget script
Every fire-and-forget script that updates a patch hash MUST include:
- A comment explaining WHY the patch file was modified
- The old hash and new hash (for audit trail)
- The date of the change

## Workflow Summary

When you modify an existing patch file:

1. **Update the patch file** (`db-meta/patches/00000000000000_init_database.sql`)
2. **Calculate the new SHA256** of the updated file
3. **Create a fire-and-forget script** in `db-meta/fire-and-forget/` that updates the registry
4. **Apply the fire-and-forget script** on each existing database
5. **Run `pnpm run db:migrate`** to verify it now passes
6. **Commit** the updated patch file + fire-and-forget script together

## Enforcement
- AI agent MUST NOT create new initial patch files (e.g. `init_database_v2.sql`)
- AI agent MUST update the existing `00000000000000_init_database.sql` in place
- AI agent MUST create a fire-and-forget script to update the registry hash
- AI agent MUST include the SHA256 calculation in the fire-and-forget script comments
- AI agent MUST verify `pnpm run db:migrate` passes after applying the fire-and-forget script
