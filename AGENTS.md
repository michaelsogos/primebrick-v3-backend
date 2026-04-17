# Agent instructions — Primebrick backend

This repository contains the **Primebrick API** (Node + Express + TypeScript) and its DB patch tooling.

## Multi-repo layout (this repository is standalone)

- This **backend** tree is its **own Git repository**, independent from the **frontend** repo and from any **workspace/meta** repo that may sit beside it in a local folder layout.
- **Commits, branches, pushes, and releases** apply to **this repo only** (`git` commands run from the backend root unless the user specifies otherwise).

### “Release everything” / **rilascia tutto**

When the user says **rilascia tutto** or **release everything**, they expect the **full GitFlow release close** in **this repo** and in **frontend** and **workspace meta**: `develop` → `release/<version>` → **`pnpm run version:auto`** → merge to **`main`** → tag **`v<version>`** → merge to **`develop`** → delete **`release/*`**. Do **not** treat “release” as only pushing `develop`.

Authoritative steps: **`.cursor/rules/gitflow-guard.mdc`**. Same SemVer across all three repos for a coordinated release unless the user scopes to one repo.

## Commands

Install dependencies:

- `pnpm install`

Run API:

- Dev: `pnpm run dev`
- Build: `pnpm run build`

### Dev auto-reload (HMR-like)

Backend dev mode uses **`tsx watch`** (`pnpm run dev`), which automatically restarts the API on file changes.

**Important:** do not start a second backend instance on the same port (default `3001`) or you will hit `EADDRINUSE`.
When the user already has the backend running, test changes by calling the existing server on `http://localhost:3001`
(e.g. via HTTP requests), rather than spawning another dev server.

### Cleanup after agent-started servers

- If you **started** `pnpm run dev` (or equivalent) **only to test or verify**, **stop that process when finished** (e.g. terminate the `tsx watch` subtree you spawned) so port `3001` is not left bound by an agent-only run.
- **Do not** kill the user’s long-running dev server in **their** terminal. If ownership is unclear, **ask** or stop only the process tree clearly tied to the agent’s test session.

Database patch tooling:

- Compare entities ↔ database (writes gitignored output): `pnpm run db:meta:compare`
- Apply patches: `pnpm run db:migrate`
- Seed demo customers: `pnpm run db:seed:customers`

Local Postgres (Docker Compose):

- `docker compose -f infra/docker-compose.postgres.yml up -d`
- `docker compose -f infra/docker-compose.postgres.yml down`

## Conventions

- Prefer small, focused changes; keep migrations/patches readable.
- Do not commit secrets (`.env`, credentials, connection strings).
- **Documentation language:** All `*.md` files in this repository must use **English** for team-facing prose.
- **API errors (impact levels):** Follow `.cursor/rules/error-impact-levels.mdc` — errors should return a stable `error` code and an `impact` level for consistent frontend rendering.

## GitFlow workflow (team rule)

- **Zero tolerance:** do **not** keep working (edits/commits) on **`develop` or `main`**. Do **not** push commits that were created on `develop`—merge **`feature/*`** into `develop` first. *"Push and close"* does **not** mean commit on `develop`. Only an **explicit** *"commit on `develop`"* overrides—see **`.cursor/rules/gitflow-guard.mdc`** (*Zero tolerance*).
- **Never commit** application or config changes on `main` or `develop`. If you are on `develop` or `main`, **create a `feature/*` branch first** (`git checkout -b feature/...` from updated `develop`), then edit and commit. No “small fix” exception unless the user explicitly allows direct commits to `develop`.
- **Before the first patch/write in this repo:** run `git branch --show-current`; if `develop` or `main`, **`git checkout -b feature/<slug>`** first—see workspace **`.cursor/rules/gitflow-guard.mdc`** (*Mandatory order*).
- Allowed branch types:
  - `feature/*` or `fix/*` from `develop`
  - `release/*` from `develop` (release process only)
  - `hotfix/*` from `main`
- If you are **already** on `feature/*`, `release/*`, or `hotfix/*`, **ask** whether to **stay** on that branch or **open a new** GitFlow branch for the task. If the user stays, do **not** argue about the branch name.
- If the user **chooses a new** branch: **ask** whether to **close the previous branch first** or leave it open; then always **`checkout` the parent (`develop` or `main`) → `pull` → `checkout -b …`** for the new branch (do not branch the new feature off the old feature unless the user explicitly asks).
- Do not push automatically. Push only when explicitly requested.
- Do not commit changes until the fix has been verified (checks and/or visual verification).
- When closing a GitFlow branch, delete it locally and on the remote (branch hygiene).

## Skill selection (required)

Before deep work on Azure, Foundry, messaging, or Cursor meta-tasks, read **`docs/ai/SKILLS.md`** and treat only checked skills as in-scope unless the user explicitly overrides.

## Further reading

| Doc | Purpose |
|-----|---------|
| `docs/ai/README.md` | Index of AI/agent docs |
| `docs/ai/SKILLS.md` | Editable skill checklist and paths |
| `docs/ai/WORKFLOWS.md` | Suggested workflows |
