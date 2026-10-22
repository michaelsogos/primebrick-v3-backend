# AI / agent documentation (backend)

These files help humans and agents collaborate consistently on the **Primebrick backend**.

| File | Role |
|------|------|
| [`dev-server.md`](./dev-server.md) | Dev-server lifecycle & process ownership — empirical ownership check, ask-first for user-owned servers, port table |
| [`env-policy.md`](./env-policy.md) | Closed environment policy — `.env` limited to `DATABASE_URL` + `DATABASE_SCHEMA`; everything else in `config_entries` |
| [`enforcement-over-verification.md`](./enforcement-over-verification.md) | Enforcement-over-verification doctrine — behavior is enforced by code/types/builders/validators, tests prove it |
| [`SKILLS.md`](./SKILLS.md) | **Skill selection** — check `[x]` the skills that apply to this repository |
| [`WORKFLOWS.md`](./WORKFLOWS.md) | Optional workflows (plan → implement → verify) |
| Root [`../../AGENTS.md`](../../AGENTS.md) | Project facts, commands, and pointers |
| Root [`../../CLAUDE.md`](../../CLAUDE.md) | Short pointer to `AGENTS.md` |
| [`../dev-guide/authentication.mdx`](../dev-guide/authentication.mdx) | Authentication — Casdoor™ IDP, JWT/OIDC, `config_entries` auth keys, GATEWAY contract, session context |
| [`../dev-guide/rbac.mdx`](../dev-guide/rbac.mdx) | RBAC — wildcard permissions, `rbacHandler`, sentinels, role mappings |

**Start here for agents:** read root `AGENTS.md`, then `SKILLS.md`. For the
auth/RBAC module specifically, see [`../dev-guide/authentication.mdx`](../dev-guide/authentication.mdx)
and [`../dev-guide/rbac.mdx`](../dev-guide/rbac.mdx).
