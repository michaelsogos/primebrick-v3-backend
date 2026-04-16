# Skill selection for Primebrick backend

Edit the checkboxes below to tell agents **which skills are in scope** for this repository. Use `[x]` for enabled and `[ ]` for disabled.

**Convention:** Agents should read **`AGENTS.md`** at the repo root first, then honor this file. If a task clearly needs an unchecked skill, the user can say so explicitly.

---

## Primebrick-specific (repo-local Cursor skills)

| Enabled | Skill | Path |
|:-------:|-------|------|
| [x] | Core backend repo (Node + Express + TypeScript) | follow `AGENTS.md` |
| [x] | PostgreSQL migration draft (AI-assisted SQL, rename rules) | `.cursor/skills/pg-migration-draft/SKILL.md` |

---

## Cursor (local tooling)

Keep this list short; enable only what you actively want agents to use.

| Enabled | Skill | Path |
|:-------:|-------|------|
| [x] | Monitoring terminal errors | `.cursor/skills/monitoring-terminal-errors/SKILL.md` |
| [x] | Detecting port conflicts | `.cursor/skills/detecting-port-conflicts/SKILL.md` |
