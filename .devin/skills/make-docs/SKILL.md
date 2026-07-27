---
name: make-docs
description: Refresh docs-from-code extraction and surgically update docs/user-guide based on current branch diff
allowed-tools: [read, write, edit, exec, grep, find_file_by_name]
---

# make-docs

Manually refresh developer documentation for this repo. Run this when you want
to update docs without closing a GitFlow branch, or to verify docs are current.

## Steps

### 1. Detect branch and diff base

Run `git branch --show-current` to get the current branch name. Determine the
diff base:

- `feature/*` → base is `develop`
- `release/*` → base is `develop`
- `hotfix/*` → base is `main`
- `develop` or `main` → diff against the last release tag (`git describe --tags --abbrev=0`)
- Other → ask the user which base to diff against

### 2. Check the diff

```
git diff <base>...HEAD --stat
git diff <base>...HEAD
```

If the diff is empty or only `package.json`/lock files → report "No user-facing
changes detected. Docs are current." and stop.

### 3. Determine if user-facing files changed

For this repo (backend), user-facing changes include:
- API endpoints (src/routes/**, src/modules/**/routes.ts)
- Auth/RBAC changes (src/modules/auth/**)
- Error handling (error codes, RFC 7807 format)
- Service registry / proxy behavior
- OpenAPI aggregation
- Database schema changes affecting API responses

If NO user-facing files changed → report "No user-facing changes. Docs are
current." and stop.

### 4. Anti-rewrite check (MANDATORY)

For each doc page that might be affected:
1. Read the existing page content
2. Compare against the diff
3. Decide:
   - Already accurate → SKIP (no edit)
   - Missing info → ADD minimal content
   - Inaccurate → FIX only the wrong parts
   - No page exists → CREATE new page, add to `_order.json`

A 10-line code change → at most a few lines of doc changes, not a rewritten page.

### 5. Update docs/user-guide/

Follow `.devin/rules/docs-user-guide.md` for editorial conventions:
- Use `<Mermaid chart={...} />` for diagrams, never ```Code or ```mermaid
- Minimal edits — preserve existing prose structure
- Update `<!-- AUTO-GENERATED:reference -->` blocks if API signatures changed

### 6. Report

Summarize in chat:
- Which files changed in the diff (user-facing only)
- Which doc pages were updated and why (added/fixed/created)
- Which doc pages were skipped (already accurate)
- That changes are NOT committed — wait for user instruction to commit

### 7. Auto-generated reference docs (AI knowledge base)

The docs repo (`primebrick-v3-docs`) has a script `scripts/generate-reference-docs.mjs`
that auto-generates 4 critical reference MDX files for the AI chat knowledge base:

1. `entity-field-reference.mdx` — extracted from BE `src/modules/**/*.meta.ts`
2. `filter-operator-reference.mdx` — extracted from BE `src/db/repository/dsl.ts`
3. `filter-syntax-guide.mdx` — filter examples per operator + filterable fields per entity
4. `navigation-map.mdx` — FE routes + entity associations

These docs are regenerated automatically by the docs CI on every push to `main`
and on a 6-hour cron. They are committed to the docs repo by the CI.

**When to regenerate locally:**
- After adding/removing entity meta files (`*.meta.ts`)
- After changing the `SqlOperator` enum in `dsl.ts`
- After adding/removing FE routes that associate with entities
- To validate the generated content before a release

**How to regenerate locally:**
```
cd <primebrick-v3-docs repo>
node scripts/generate-reference-docs.mjs
```
This requires `.tmp-repo-sync/` to exist (run `node scripts/sync-repo-docs.mjs`
first if it doesn't). The script overwrites the 4 MDX files in
`pages/backend/guide/` and updates `_order.json`.

**Do NOT hand-edit** the 4 generated MDX files — they have
`<!-- AUTO-GENERATED -->` markers and will be overwritten on the next run.

If the diff touched meta files or `dsl.ts`, mention in the report that the
auto-generated reference docs should be regenerated in the docs repo (the CI
will do this automatically, but local validation is recommended before a release).
