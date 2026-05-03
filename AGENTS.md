# AI AGENT INSTRUCTIONS - Primebrick Backend

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

This repository follows GitFlow. AI agents MUST follow these rules.

**See [docs/gitflow.md](./docs/gitflow.md) for complete GitFlow rules, branch management, closing procedure, version tagging, and commit rules.**

## Further documentation

See `docs/ai/` for skills selection and suggested workflows.
