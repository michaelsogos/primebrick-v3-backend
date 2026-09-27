---
trigger: always_on
---

# Devin Rule: Controller Boundary (MVC transport layer)

## Trigger
- Applies to ALL code in `src/controllers/` (http/, nats-req/, nats-sub/),
  and to any file handling an HTTP request, NATS request-reply, or NATS
  subscription.

## Architecture

```
src/
  controllers/            # transport adapters ONLY — no business logic
    http/                 # HTTP route handlers
    nats-req/             # NATS request-reply endpoints (subscribeRequest)
    nats-sub/             # NATS pub/sub + JetStream subscribers
  services/               # transport-agnostic business logic
```

## Controller contract

A controller MAY:
- authenticate (session JWT / API key / gateway-resolved NATS headers)
- validate the incoming payload (zod / shape checks)
- call exactly ONE service method
- shape the *transport* response: HTTP status + RFC7807 body / NATS reply
  envelope / JetStream ack semantics
- own the root try/catch that maps service errors to the transport
- stream / file download where the transport requires it
- use shared transport-level helpers: `runEntityWrite`/`entityWriteBody`
  (write-tx orchestration wrapping the ONE service call),
  `assertTranslationsPermission`, `requireVersionQuery`,
  `validateUuidParam`, `assembleMeta`, `deriveEntityActions`,
  `rbacHandler`, `asyncHandler`

A controller MUST NOT:
- import the DAL / repositories directly
- contain domain rules (reserved checks, existence policy, value coercion)
- loop over entities applying per-item business logic
- build response payloads field-by-field — services return the formed
  snake_case shape; the controller only serializes it
- invent error codes — errors come from the service layer
  (`mapDalError` / `ApiError`); the controller only maps them to transport

## Service contract

Services are pure `(validatedInput, ctx) → result | throw`:
- zero `req`/`res`/Msg imports — no transport types
- `ctx` carries actor, permissions, correlation id — assembled by the
  controller
- the same service must be callable identically from http/, nats-req/,
  and nats-sub/ controllers

## Why

One operation must be invocable over HTTP and NATS without duplicating
auth/validation/dispatch. HTTP endpoints progressively migrate to
`nats-req`; only the controller file moves — the service is untouched.
