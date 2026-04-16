# Agent instructions — Primebrick backend

This repository contains the **Primebrick API** (Node + Express + TypeScript) and its DB patch tooling.

## Commands

Install dependencies:

- `pnpm install`

Run API:

- Dev: `pnpm run dev`
- Build: `pnpm run build`

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

## GitFlow workflow (team rule)

- Do not work directly on `main` or `develop`. Create a GitFlow branch first:
  - `feature/*` from `develop`
  - `release/*` from `develop`
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
