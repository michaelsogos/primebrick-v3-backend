---
name: make-docs
description: Refresh docs-from-code extraction and surgically update docs/dev-guide based on current branch diff
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
- API endpoints (src/controllers/http/**, src/controllers/nats-sub/**)
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

### 5. Update docs/dev-guide/

Follow `.devin/rules/docs-dev-guide.md` for editorial conventions:
- Use `<Mermaid chart={...} />` for diagrams, never ```Code or ```mermaid
- Minimal edits — preserve existing prose structure
- Update `<!-- AUTO-GENERATED:reference -->` blocks if API signatures changed

### 6. Report

Summarize in chat:
- Which files changed in the diff (user-facing only)
- Which doc pages were updated and why (added/fixed/created)
- Which doc pages were skipped (already accurate)
- That changes are NOT committed — wait for user instruction to commit

### 7. Auto-generated reference docs (generated IN this repo)

Generated reference docs are produced **in this repo** by
`scripts/generate-reference-docs.ts`, invoked through `pnpm generate:docs`
(which also builds `dist/docs-pack/`). `generate:docs` runs automatically in
`prebuild` — every `pnpm build` regenerates them.

Outputs (committed under `docs/user-guide/generated/`):

1. `entity-field-reference.mdx` — extracted from `src/modules/**/*.meta.ts`
2. `filter-operator-reference.mdx` — extracted from the DAL `SqlOperator` union
3. `filter-syntax-guide.mdx` — filter examples per operator + filterable fields per entity
4. `navigation-map.mdx` — FE routes + entity associations
5. Per-entity module pages (`modules*.mdx`, `configurations*.mdx`, etc.)

Downstream consumers (no manual steps):
- **Product KB**: the AI service pulls `dist/docs-pack/` via
  `GET /api/v1/system/docs/pack` on service registration and embeds the
  user-guide into `ai.docs_kb`.
- **Institutional site**: `primebrick-v3-docs` syncs `docs/user-guide/` from
  this repo's `main` on its scheduled `docs-release` workflow.

**When to regenerate locally:** after adding/removing `*.meta.ts` files,
changing filter operators, or touching module navigation metadata — run
`pnpm generate:docs` (or just `pnpm build`, which includes it) and commit the
regenerated `docs/user-guide/generated/` files with your branch.

**MDX safety:** generated prose MUST pass through `mdxSafe()` — raw `{`, `}`,
`<`, `>` in table cells/prose are parsed by MDX as JS expressions/JSX and will
crash the docs-site build (or silently drop content).

**Do NOT hand-edit** the generated MDX files — they have
`<!-- AUTO-GENERATED -->` markers and will be overwritten on the next run.
