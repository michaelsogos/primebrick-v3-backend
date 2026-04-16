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

## Skill selection (required)

Before deep work on Azure, Foundry, messaging, or Cursor meta-tasks, read **`docs/ai/SKILLS.md`** and treat only checked skills as in-scope unless the user explicitly overrides.

## Further reading

| Doc | Purpose |
|-----|---------|
| `docs/ai/README.md` | Index of AI/agent docs |
| `docs/ai/SKILLS.md` | Editable skill checklist and paths |
| `docs/ai/WORKFLOWS.md` | Suggested workflows |
\n- GitFlow test change
\n## v0.1.0\n- First release (GitFlow dry run)\n
