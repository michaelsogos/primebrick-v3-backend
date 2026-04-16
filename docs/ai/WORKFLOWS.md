# Suggested agent workflows (backend)

These are guidelines, not strict rules. Adapt when the user asks for something different.

## Feature work (API)

1. **Understand** — confirm module and acceptance criteria; identify DTO and list meta implications.
2. **Contract** — agree API shape (path, query params, response DTO) before big refactors.
3. **Implement** — router → DAL/repo → DTO validation; keep errors meaningful.
4. **Verify** — `pnpm run build` and, when DB is available, run the relevant endpoint locally.

## Database patch tooling

1. Ensure `DATABASE_URL` is set (use `.env`, not committed).
2. Generate meta diff: `pnpm run db:meta:compare` (writes gitignored `db-meta/`).
3. Review rename heuristics carefully when requested by tooling/user.
4. Apply patch: `pnpm run db:migrate`.
