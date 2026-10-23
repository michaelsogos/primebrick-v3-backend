# Devin Rule: Translations Cache Invalidation (deterministic)

## Trigger
- Applies whenever writing/mutating rows in any `*.translations` table
  (`public`, `system`, `custom`, `emailsender` schemas) — via API, DAL, SQL
  script, or manual `psql`.

## Canonical doc
**`docs/ai/translations-cache-invalidation.md` — read it before acting.** This file is a
pointer; the normative text lives in the canonical doc.

## Enforcement
- Follow the normative body in the canonical doc — it is the contract; this file is only its trigger.
