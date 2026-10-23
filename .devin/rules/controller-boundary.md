---
trigger: always_on
---

# Devin Rule: Controller Boundary (MVC transport layer)

## Trigger
- Applies to ALL code in `src/controllers/` (http/, nats-sub/; NATS req/res is banned — sync replies go through governed correlation (`callNats`/`makeNatsRequestRoute`)),
  and to any file handling an HTTP request, NATS request-reply, or NATS
  subscription.

## Canonical doc
**`docs/ai/controller-boundary.md` — read it before acting.** This file is a
pointer; the normative text lives in the canonical doc.

## Enforcement
- Follow the normative body in the canonical doc — it is the contract; this file is only its trigger.
