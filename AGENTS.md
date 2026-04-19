# Agent instructions — Primebrick backend

Short entry point for this repository. Scoped rules: **`.cursor/rules/`** (see **`backend-api.mdc`** for `src/` and scripts).

## Repository layout

This **backend** tree is its **own Git repository** (separate from frontend and meta workspace).

### Coordinated release (*rilascia tutto*)

Full GitFlow close for **all three** repos (backend, frontend, meta): see **`.cursor/rules/gitflow-guard.mdc`**. Same SemVer across repos unless the user scopes to one repo.

## Commands

| Action | Command |
|--------|---------|
| Install | `pnpm install` |
| Dev API | `pnpm run dev` |
| Build | `pnpm run build` |
| Entity ↔ DB compare (generates snapshots / patch files when models drift) | `pnpm run db:meta:compare` |
| Apply DB patches (migrations registry) | `pnpm run db:migrate` |
| Seed demo customers | `pnpm run db:seed:customers` |

### Postgres (Docker)

- Up: `docker compose -f infra/docker-compose.postgres.yml up -d`
- Down: `docker compose -f infra/docker-compose.postgres.yml down`

### Dev server

Uses **`tsx watch`** — do **not** start a second instance on port **3001** (`EADDRINUSE`). If the user already runs the API, test against `http://localhost:3001` instead of spawning another server.

If **you** started `pnpm run dev` only to verify, **stop it** when done. Do not kill the user’s dev server without asking.

## Conventions

- Small, focused changes; readable migrations/patches.
- No secrets in git (`.env`, credentials).
- **Team-facing `*.md`:** English only.
- **API errors:** follow **`.cursor/rules/error-impact-levels.mdc`** — stable `error` codes + `impact` for the frontend.

### Schema diff safety

If `db-meta/diff-entities-vs-database.json` has `renameHeuristicUserReviewRequired: true`, **ask the user** before applying heuristic renames.

### Database patches vs migrations

- **`pnpm run db:meta:compare`** — run when **entity / model code** changes. It refreshes JSON snapshots and may add a new file under `db-meta/patches/`. Do **not** wire this to **post-merge** (it is not a migration runner).
- **`pnpm run db:migrate`** — applies pending `.sql` files in order, using `public.primebrick_database_patch` (patch_id + `content_sha256`) so already-applied files are skipped and the first missing patch is applied next.

### Git hooks (optional)

From this repository root:

```bash
git config core.hooksPath .githooks
```

- **`post-merge`** runs **`pnpm run db:migrate`** only (skips if `DATABASE_URL` is unset and there is no `.env`). Set **`PB_SKIP_POST_MERGE_DB_MIGRATE=1`** to skip. Remove any local hook that runs `db:meta:compare` on merge — that belongs to model-change workflows, not pull/merge.

## GitFlow

Follow **`.cursor/rules/gitflow-guard.mdc`**: never commit on `develop`/`main`; use `feature/*`; merge before push; push only when asked; verify before commit; when closing a branch, delete it locally and on the remote. **Before closing a feature** (merge, delete branch), **ask the user** — including when you created the branch automatically.

**New task / nuovo task:** When the user starts a new task (e.g. *“Iniziamo un nuovo task”*, *let’s start a new task*), infer `feature/<slug>` from context and create that branch from `develop` before edits — see **workspace root `AGENTS.md` → New task workflow**.

## Skills & AI docs

| Doc | Purpose |
|-----|---------|
| `docs/ai/README.md` | Index |
| `docs/ai/SKILLS.md` | Skill checklist (read before deep Azure/messaging work) |
| `docs/ai/WORKFLOWS.md` | Suggested workflows |
