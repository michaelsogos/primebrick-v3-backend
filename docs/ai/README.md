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
| [`always-check-rules-first.md`](./always-check-rules-first.md) | Always Check Rules Before Action |
| [`api-path-conventions.md`](./api-path-conventions.md) | API Path Conventions |
| [`casdoor-integration.md`](./casdoor-integration.md) | Casdoor Integration Gotchas |
| [`code-guardrails.md`](./code-guardrails.md) | Code Execution Guardrails |
| [`controller-boundary.md`](./controller-boundary.md) | Controller Boundary (MVC transport layer) |
| [`cross-repo-release-order.md`](./cross-repo-release-order.md) | Cross-Repo Release Ordering |
| [`dal-usage.md`](./dal-usage.md) | DAL Usage — ONE way only |
| [`data-model-conventions.md`](./data-model-conventions.md) | Data Model Conventions |
| [`db-patches.md`](./db-patches.md) | Database Patches (db-meta + migration engine) |
| [`docs-audience.md`](./docs-audience.md) | Documentation Audience (3 tiers) |
| [`docs-dev-guide.md`](./docs-dev-guide.md) | Developer # Devin Rule: User-Facing Documentation User Documentation |
| [`docs-order.md`](./docs-order.md) | Documentation Page Order |
| [`docs-pipeline.md`](./docs-pipeline.md) | Documentation Pipeline (trigger-based, end to end) |
| [`docs-sync-on-close.md`](./docs-sync-on-close.md) | Sync Docs on GitFlow Close |
| [`docs-user-pages.md`](./docs-user-pages.md) | End-User Page Structure (docs/user-guide) |
| [`e2e-test-users.md`](./e2e-test-users.md) | Test Users — NEVER the dev `admin` |
| [`entity-meta-schema.md`](./entity-meta-schema.md) | Canonical Entity Meta Schema (`EntityMeta`) |
| [`entity-router-factory.md`](./entity-router-factory.md) | Entity Router Factory (`makeEntityRouter`) |
| [`file-operations.md`](./file-operations.md) | File Operations |
| [`internal-client.md`](./internal-client.md) | Internal HTTP Client (mandatory) |
| [`logging-telemetry.md`](./logging-telemetry.md) | Logging & Telemetry |
| [`no-coalesce-writes.md`](./no-coalesce-writes.md) | No Coalesce Writes (CREATE and UPDATE are separate calls) |
| [`package-versioning.md`](./package-versioning.md) | Fixed Package Versions (No Ranges) |
| [`temp-files.md`](./temp-files.md) | Temporary Files Location |
| [`translation-key-convention.md`](./translation-key-convention.md) | Translation Key Convention — snake_case singular |
| [`translations-cache-invalidation.md`](./translations-cache-invalidation.md) | Translations Cache Invalidation (deterministic) |
| [`verify-file-creation.md`](./verify-file-creation.md) | Verify File Creation (Prevent Truncated Filename Bug) |
| [`workflow.md`](./workflow.md) | Devin Workflow Rule: Tic-Toc Planning |

**Start here for agents:** read root `AGENTS.md`, then `SKILLS.md`. For the
auth/RBAC module specifically, see [`../dev-guide/authentication.mdx`](../dev-guide/authentication.mdx)
and [`../dev-guide/rbac.mdx`](../dev-guide/rbac.mdx).
