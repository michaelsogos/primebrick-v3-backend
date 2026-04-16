---
name: pg-migration-draft
description: >-
  Produce PostgreSQL migration patches from schema evolution (add/rename/drop),
  combining pg-diff / pg-diff-api style SOURCE→TARGET automation with optional
  AI review. Aligns with Primebrick @Entity/@Column entities and node-pg-migrate
  (or pg-diff) for applying committed SQL.
---

# PostgreSQL migration draft (Primebrick)

## When to use

- User asks for a **new migration** after entity / DB changes.
- User cares about **rename vs drop+add** and **data safety** (trust catalog-level diff, e.g. **pg-diff-api**).
- User wants **AI** mainly for **review**, hints, and glue—not to replace a proven diff engine.

## Preferred automation (Node / npm ecosystem)

The **michaelsogos** stack (**`pg-diff-cli`** + **`pg-diff-api`**) is explicitly designed for:

- Comparing **two live PostgreSQL** instances (or equivalent connections).
- Emitting a **timestamped SQL patch** with **WARN/ERROR hints** next to risky lines.
- A team workflow: **`SOURCE`** = DB where you apply experimental changes; **`TARGET`** = baseline app DB; patch moves TARGET → SOURCE state.

That is real **automation**: the engine reads **catalog metadata** (not just text diff), which is why it can be **much smarter** than a naive file diff—including heuristics you trust for **renames** and avoiding silent data loss.

**Primebrick integration (conceptual):**

1. Developer evolves schema on **`SOURCE`** (DBeaver, SQL, or—later—a small script that applies DDL inferred from `@Entity` / `@Column`).
2. Run **`pg-diff`** (or call **`pg-diff-api`** from a `pnpm` script) with config pointing **SOURCE** vs **TARGET**.
3. Commit the generated patch (+ review WARN/ERROR comments).
4. Apply in other envs via **`node-pg-migrate`** or **`pg-diff -mt`**—pick one strategy for CI and stick to it.

## When AI is enough without an external diff (fallback)

If the user refuses any external package:

- AI may draft SQL **only** when given **both** sides as structured input: e.g. `pg_dump --schema-only` **before** and **after**, or JSON from `information_schema`—not from memory.
- **Renames** stay **ambiguous** without catalog-level logic; mirror pg-diff’s approach: ask for **SOURCE/TARGET** or two dumps, or accept higher risk.

## Inputs to ask for

1. **Best:** `pg-diff-config.json` profile name + which DB is SOURCE vs TARGET (or connection URLs + schema list).
2. **Good:** two `pg_dump -s` files (old vs new).
3. **Acceptable:** one dump + path to updated **entity** TS—then remind: entity is **intent**; ground truth for patch is still **SOURCE** after applying that intent to a DB, unless you generate DDL from decorators (future `pb-schema apply-source` script).

## Rename & data safety (review rules)

- Prefer **trust the diff engine’s rename detection** when using pg-diff-api; use AI to **explain** the patch and flag anything that still looks like destructive DDL.
- If AI disagrees with the tool, **default to human + second opinion**; do not silently rewrite `RENAME` into `DROP+ADD` without user consent.

## Mapping to Primebrick entities

- Table: `getTableName(Entity)` (`@Entity('override')` or class name).
- Columns: `getColumnName` / `@Key()` metadata.
- Long-term optional: a **small internal script** reads decorator metadata and applies **DDL to SOURCE only**, so pg-diff always compares **real** catalogs—no ORM, still automation.

## Output contract

- Patches live under the team’s chosen folder (e.g. `migrations/` for node-pg-migrate, or `sqlscripts/` for pg-diff—**pick one** and document in `AGENTS.md` when introduced).
- Always require **review** of generated SQL before merge; treat WARN/ERROR hints from pg-diff as first-class review items.

## CI/CD

- **CI applies** only committed, reviewed migrations (`npm run migrate` or equivalent).
- **CI does not** auto-generate patches against production; generation stays dev/PR-local or a gated job with human approval.

