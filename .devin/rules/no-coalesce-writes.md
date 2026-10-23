# Devin Rule: No Coalesce Writes (CREATE and UPDATE are separate calls)

## Trigger
- Applies to ALL write paths in this repository: HTTP routers, DAL methods,
  services, and any helper that persists entities.

## Canonical doc
**`docs/ai/no-coalesce-writes.md` — read it before acting.** This file is a
pointer; the normative text lives in the canonical doc.

## Enforcement
- Follow the normative body in the canonical doc — it is the contract; this file is only its trigger.
