# Primebrick Backend - AI Agent Guide

## Repository overview

Independent Git repository containing the Primebrick API, database, and endpoints.

**Documentation language:** All `*.md` files must use **English** for team-facing prose.

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
- **API errors:** Use stable error codes with `impact` field for the frontend.

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

## GitFlow rules

This repository follows GitFlow. AI agents MUST follow these rules:

### Branch management
- **NEVER work directly on `develop` or `main`**
- Always create feature branches: `git checkout -b feature/<slug>` from updated `develop`
- Feature branches for all normal work (bugs, features, fixes)
- Release branches from `develop` for version bumps only
- Hotfix branches from `main` for production fixes only

### When to ask user permission
- **ASK before creating NEW feature branch** if another feature branch is already open
- **DO NOT ask permission** to commit changes on existing feature branch
- **DO NOT ask permission** to close a feature branch (follow proper closing procedure)

### Branch closing procedure
When closing ANY branch (`feature/*`, `release/*`, `hotfix/*`):
1. Merge to appropriate base branch with `--no-ff`
   - Feature: merge into `develop`
   - Release/Hotfix: merge into `main`
2. Push the merged base branch
3. Delete branch LOCALLY: `git branch -d <branch-name>`
4. Delete branch on ORIGIN: `git push origin --delete <branch-name>`
5. For Release/Hotfix: Also merge `main` back to `develop`

### Version tagging
- NO 'v' prefix for tags (use `0.13.2` not `v0.13.2`)
- Tag derived from branch name: `release/0.13.2` → tag `0.13.2`
- Hotfix increments PATCH: `0.13.1` → `hotfix/0.13.2` → tag `0.13.2`
- Release increments MINOR: `0.13.2` → `release/0.14.0` → tag `0.14.0`

### Common mistakes to avoid
- Committing directly on `develop` or `main`
- Creating commits before creating feature branch
- Forgetting to delete branches (both local and origin)
- Using 'v' prefix in tags
- Not pushing merged base branch
- Leaving feature branches open after merge

### Commit rules
- NEVER commit automatically - wait for explicit user instruction
- DO NOT ask user to approve commit messages
- Write appropriate commit messages directly when instructed
- DO NOT open editor for commit approval

### New task workflow
When the user starts a fresh piece of work with phrases such as "Let's start a new task", "Iniziamo un nuovo task", or equivalent:
1. Infer a branch slug from context — lowercase, kebab-case, ASCII letters/digits/hyphens only
2. Before the first tracked-file change, ensure a branch `feature/<slug>` exists from up-to-date `develop`
3. State the slug once (e.g. "Branch: `feature/iana-timezone`") so the user can rename if needed

## Further documentation

See `docs/ai/` for skills selection and suggested workflows.
